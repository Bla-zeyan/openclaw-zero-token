#!/bin/bash
# OpenClaw DeepSeek 独立 Gateway 服务启动脚本
# 设置独立的状态目录和配置文件，不影响系统安装的 OpenClaw

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
STATE_DIR="$SCRIPT_DIR/.openclaw-state"
CONFIG_FILE="$STATE_DIR/openclaw.json"
LOG_FILE="$SCRIPT_DIR/logs/openclaw.log"
PID_FILE="$SCRIPT_DIR/.gateway.pid"
PORT=3001

mkdir -p "$STATE_DIR"
mkdir -p "$SCRIPT_DIR/logs"

if [ ! -f "$CONFIG_FILE" ]; then
  echo '{}' > "$CONFIG_FILE"
  echo "已创建空配置文件: $CONFIG_FILE"
fi

stop_gateway() {
  if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if kill -0 "$OLD_PID" 2>/dev/null; then
      echo "停止旧进程 (PID: $OLD_PID)..."
      kill "$OLD_PID" 2>/dev/null
      sleep 1
      if kill -0 "$OLD_PID" 2>/dev/null; then
        kill -9 "$OLD_PID" 2>/dev/null
      fi
    fi
    rm -f "$PID_FILE"
  fi
  
  PORT_PID=$(lsof -ti:$PORT 2>/dev/null)
  if [ -n "$PORT_PID" ]; then
    echo "停止占用端口 $PORT 的进程 (PID: $PORT_PID)..."
    kill "$PORT_PID" 2>/dev/null
    sleep 1
  fi
}

start_gateway() {
  export OPENCLAW_CONFIG_PATH="$CONFIG_FILE"
  export OPENCLAW_STATE_DIR="$STATE_DIR"

  echo "启动 Gateway 服务..."
  echo "配置文件: $OPENCLAW_CONFIG_PATH"
  echo "状态目录: $OPENCLAW_STATE_DIR"
  echo "日志文件: $LOG_FILE"
  echo "端口: $PORT"
  echo ""

  nohup node "$SCRIPT_DIR/dist/index.mjs" gateway > /tmp/openclaw-gateway.log 2>&1 &
  GATEWAY_PID=$!
  echo "$GATEWAY_PID" > "$PID_FILE"

  sleep 2

  if kill -0 $GATEWAY_PID 2>/dev/null; then
    WEBUI_URL="http://127.0.0.1:$PORT/#token=62b791625fa441be036acd3c206b7e14e2bb13c803355823"
    echo "Gateway 服务已启动 (PID: $GATEWAY_PID)"
    echo "Web UI: $WEBUI_URL"
    if command -v open >/dev/null 2>&1; then
      echo "正在打开浏览器..."
      open "$WEBUI_URL"
    elif command -v xdg-open >/dev/null 2>&1; then
      echo "正在打开浏览器..."
      xdg-open "$WEBUI_URL"
    fi
  else
    echo "Gateway 服务启动失败，请查看日志:"
    cat /tmp/openclaw-gateway.log
    rm -f "$PID_FILE"
    exit 1
  fi
}

case "${1:-start}" in
  start)
    stop_gateway
    start_gateway
    ;;
  stop)
    stop_gateway
    echo "Gateway 服务已停止"
    ;;
  restart)
    stop_gateway
    start_gateway
    ;;
  status)
    if [ -f "$PID_FILE" ]; then
      PID=$(cat "$PID_FILE")
      if kill -0 "$PID" 2>/dev/null; then
        echo "Gateway 服务运行中 (PID: $PID)"
        echo "Web UI: http://127.0.0.1:$PORT/#token=62b791625fa441be036acd3c206b7e14e2bb13c803355823"
      else
        echo "Gateway 服务未运行 (PID 文件存在但进程已退出)"
      fi
    else
      PORT_PID=$(lsof -ti:$PORT 2>/dev/null)
      if [ -n "$PORT_PID" ]; then
        echo "端口 $PORT 被进程 $PORT_PID 占用，但不是本脚本启动的 Gateway"
      else
        echo "Gateway 服务未运行"
      fi
    fi
    ;;
  *)
    echo "用法: $0 {start|stop|restart|status}"
    exit 1
    ;;
esac
