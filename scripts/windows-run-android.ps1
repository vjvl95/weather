param(
    [int]$Port = 8082,
    [switch]$SkipInstall,
    [switch]$SkipDoctor
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$androidDir = Join-Path $repoRoot "android"

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Test-Command {
    param([string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command not found: $Name"
    }
}

function Get-FreePort {
    param([int]$StartPort)

    $candidate = $StartPort
    while ($true) {
        if (Get-Command "Get-NetTCPConnection" -ErrorAction SilentlyContinue) {
            $listener = Get-NetTCPConnection -State Listen -LocalPort $candidate -ErrorAction SilentlyContinue
        } else {
            $listener = netstat -ano | Select-String -Pattern "[:\.]$candidate\s+.*LISTENING"
        }

        if (-not $listener) {
            return $candidate
        }

        Write-Host "Port $candidate is already in use. Trying $($candidate + 1)." -ForegroundColor Yellow
        $candidate++
    }
}

function Wait-For-BootCompleted {
    param([int]$TimeoutSeconds = 180)

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        $bootState = (& adb shell getprop sys.boot_completed 2>$null).Trim()
        if ($bootState -eq "1") {
            return
        }

        Start-Sleep -Seconds 3
    }

    throw "Android emulator/device did not finish booting within $TimeoutSeconds seconds."
}

function Get-FirstConnectedDevice {
    $deviceLines = & adb devices
    $devices = @()

    foreach ($line in $deviceLines) {
        if ($line -match "^(?<serial>\S+)\s+device$") {
            $devices += $Matches.serial
        }
    }

    if ($devices.Count -gt 0) {
        return $devices[0]
    }

    return $null
}

function Start-FirstAvdIfNeeded {
    $currentDevice = Get-FirstConnectedDevice
    if ($currentDevice) {
        return $currentDevice
    }

    Test-Command "emulator"

    $avds = (& emulator -list-avds) | Where-Object { $_.Trim() }
    if (-not $avds -or $avds.Count -eq 0) {
        throw "No Android device is connected and no AVD is installed."
    }

    $selectedAvd = $avds[0].Trim()
    Write-Host "No connected Android device found. Starting AVD: $selectedAvd" -ForegroundColor Yellow
    Start-Process -FilePath "emulator" -ArgumentList "@$selectedAvd"

    & adb wait-for-device | Out-Null
    Wait-For-BootCompleted

    $bootedDevice = Get-FirstConnectedDevice
    if (-not $bootedDevice) {
        throw "ADB did not detect a device after starting the emulator."
    }

    return $bootedDevice
}

function Get-ApplicationId {
    $appJsonPath = Join-Path $repoRoot "app.json"
    if (-not (Test-Path $appJsonPath)) {
        return "com.myapp.app"
    }

    $appJson = Get-Content -LiteralPath $appJsonPath -Raw | ConvertFrom-Json
    if ($appJson.expo -and $appJson.expo.android -and $appJson.expo.android.package) {
        return $appJson.expo.android.package
    }

    return "com.myapp.app"
}

Write-Step "Checking required commands"
Test-Command "node"
Test-Command "npm"
Test-Command "adb"

Set-Location -LiteralPath $repoRoot

if (-not $SkipInstall) {
    Write-Step "Running npm install"
    & npm install
}

if (-not $SkipDoctor) {
    Write-Step "Running expo-doctor"
    & npm run doctor -- --verbose
}

if (-not (Test-Path (Join-Path $androidDir "gradlew.bat"))) {
    Write-Step "android folder not found. Running prebuild"
    & npx expo prebuild --platform android --no-install
}

Write-Step "Preparing Android device"
& adb start-server | Out-Null
$deviceSerial = Start-FirstAvdIfNeeded
Write-Host "Using device: $deviceSerial"

$resolvedPort = Get-FreePort -StartPort $Port
if ($resolvedPort -ne $Port) {
    Write-Host "Requested port $Port was busy. Using port $resolvedPort instead." -ForegroundColor Yellow
}

$escapedRepoRoot = $repoRoot.Replace("'", "''")
$metroCommand = "& { Set-Location -LiteralPath '$escapedRepoRoot'; npx expo start --dev-client --android --port $resolvedPort }"

Write-Step "Starting Metro in a new PowerShell window"
Start-Process -FilePath "powershell" -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-Command", $metroCommand
)

Start-Sleep -Seconds 8

Write-Step "Installing debug app with matching Metro port"
Push-Location -LiteralPath $androidDir
& .\gradlew.bat "installDebug" "-PreactNativeDevServerPort=$resolvedPort"
Pop-Location

$applicationId = Get-ApplicationId

Write-Step "Launching app"
& adb -s $deviceSerial shell monkey -p $applicationId -c android.intent.category.LAUNCHER 1 | Out-Null

Write-Host ""
Write-Host "App launch flow completed." -ForegroundColor Green
Write-Host "Metro port: $resolvedPort"
Write-Host "Package: $applicationId"
Write-Host "Device: $deviceSerial"
Write-Host ""
Write-Host "Quick rerun:"
Write-Host "npm run win:android"
