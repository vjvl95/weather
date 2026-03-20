#!/bin/bash
# WO 파이프라인: check → fix-check → start → review
# 사용법: bash scripts/wo-pipeline.sh WO-004

if [ -z "$1" ]; then
  echo "사용법: bash scripts/wo-pipeline.sh WO-XXX"
  exit 1
fi

WO="$1"

echo "========== [1/4] 문서 검수: $WO =========="
claude -p --model sonnet "/check $WO"

echo "========== [2/4] 검수 결과 반영: $WO =========="
claude -p --model sonnet "/fix-check $WO"

echo "========== [3/4] 코딩 구현: $WO =========="
claude -p --model opus "/start $WO"

echo "========== [4/4] 코드 검토: $WO =========="
claude -p --model sonnet "/review $WO"

echo "========== 파이프라인 완료: $WO =========="
