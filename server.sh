#!/bin/bash
# OpenClaw DeepSeek 独立 Gateway 服务启动脚本
# 设置独立的状态目录和配置文件，不影响系统安装的 OpenClaw

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
STATE_DIR="$SCRIPT_DIR/.openclaw-state"
CONFIG_FILE="$STATE_DIR/openclaw.json"
LOG_FILE="$SCRIPT_DIR/logs/openclaw.log"

mkdir -p "$STATE_DIR"
mkdir -p "$SCRIPT_DIR/logs"

if [ ! -f "$CONFIG_FILE" ]; then
  echo '{}' > "$CONFIG_FILE"
  echo "已创建空配置文件: $CONFIG_FILE"
fi

export OPENCLAW_CONFIG_PATH="$CONFIG_FILE"
export OPENCLAW_STATE_DIR="$STATE_DIR"

echo "启动 Gateway 服务..."
echo "配置文件: $OPENCLAW_CONFIG_PATH"
echo "状态目录: $OPENCLAW_STATE_DIR"
echo "日志文件: $LOG_FILE"
echo "端口: 3001"
echo ""

nohup node "$SCRIPT_DIR/dist/index.mjs" gateway > /tmp/openclaw-gateway.log 2>&1 &
GATEWAY_PID=$!

sleep 2

if kill -0 $GATEWAY_PID 2>/dev/null; then
  echo "Gateway 服务已启动 (PID: $GATEWAY_PID)"
  echo "Web UI: http://127.0.0.1:3001/#token=62b791625fa441be036acd3c206b7e14e2bb13c803355823"
else
  echo "Gateway 服务启动失败，请查看日志:"
  cat /tmp/openclaw-gateway.log
  exit 1
fi
