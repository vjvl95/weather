# WO Pipeline: check -> fix-check -> start -> review
# Usage: .\scripts\wo-pipeline.ps1 WO-004

param(
    [Parameter(Mandatory=$true)]
    [string]$WO
)

$ProjectDir = "C:\AI\Weather"
$WebhookUrl = "https://discord.com/api/webhooks/1484552727735570655/9T-PFK9SYnEoVWiV2REmT9Tajaa7SNRQgwmWraBTnY_M9vNU0QlRlPup9H6W7hqGchSD"

function Send-Discord {
    param([string]$Message, [string]$Color = "3447003")
    $body = @{
        embeds = @(@{
            title = "WO Pipeline"
            description = $Message
            color = [int]$Color
            timestamp = (Get-Date).ToUniversalTime().ToString('o')
        })
    } | ConvertTo-Json -Depth 4
    Invoke-RestMethod -Uri $WebhookUrl -Method Post -ContentType 'application/json' -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) | Out-Null
}

Push-Location $ProjectDir

Send-Discord ":: **$WO** Pipeline Start" "3447003"

# 1/4 check
Write-Host "========== [1/4] check: $WO ==========" -ForegroundColor Cyan
claude -p --model sonnet "/check $WO"
if ($LASTEXITCODE -ne 0) {
    Send-Discord ":: **$WO** [1/4] check FAILED" "15158332"
    Pop-Location; exit 1
}
Send-Discord ":: **$WO** [1/4] check done -> fix-check" "3066993"

# 2/4 fix-check
Write-Host "========== [2/4] fix-check: $WO ==========" -ForegroundColor Cyan
claude -p --model sonnet "/fix-check $WO"
if ($LASTEXITCODE -ne 0) {
    Send-Discord ":: **$WO** [2/4] fix-check FAILED" "15158332"
    Pop-Location; exit 1
}
Send-Discord ":: **$WO** [2/4] fix-check done -> start" "3066993"

# 3/4 start
Write-Host "========== [3/4] start: $WO ==========" -ForegroundColor Yellow
claude -p --model opus "/start $WO"
if ($LASTEXITCODE -ne 0) {
    Send-Discord ":: **$WO** [3/4] start FAILED" "15158332"
    Pop-Location; exit 1
}
Send-Discord ":: **$WO** [3/4] start done -> review" "3066993"

# 4/4 review
Write-Host "========== [4/4] review: $WO ==========" -ForegroundColor Cyan
claude -p --model sonnet "/review $WO"
if ($LASTEXITCODE -ne 0) {
    Send-Discord ":: **$WO** [4/4] review FAILED" "15158332"
    Pop-Location; exit 1
}

Send-Discord ":: **$WO** Pipeline Complete!" "5763719"

Write-Host "========== Pipeline Complete: $WO ==========" -ForegroundColor Green
Pop-Location
