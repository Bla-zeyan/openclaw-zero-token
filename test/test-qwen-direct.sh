#!/bin/bash
# 直接测试 Qwen Web API

echo "=========================================="
echo "  测试 Qwen Web API"
echo "=========================================="
echo ""

# 检查 Chrome 是否在运行
if ! pgrep -f "chrome.*remote-debugging-port=9222" > /dev/null; then
    echo "✗ Chrome 调试模式未运行"
    echo "请先运行: ./start-chrome-debug.sh"
    exit 1
fi

# 检查调试端口
if ! curl -s http://127.0.0.1:9222/json/version > /dev/null 2>&1; then
    echo "✗ Chrome 调试端口无响应"
    exit 1
fi

echo "✓ Chrome 调试模式正常运行"
echo ""

# 检测操作系统和 Chrome 路径
if [[ "$OSTYPE" == "darwin"* ]]; then
    CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    USER_DATA_DIR="$HOME/Library/Application Support/Chrome-OpenClaw-Debug"
else
    CHROME_PATH="google-chrome"
    USER_DATA_DIR="$HOME/.config/chrome-openclaw-debug"
fi

echo "正在打开 Qwen 页面..."
"$CHROME_PATH" --remote-debugging-port=9222 --user-data-dir="$USER_DATA_DIR" "https://chat.qwen.ai/" > /dev/null 2>&1 &

sleep 3

echo "✓ Qwen 页面已打开"
echo ""
echo "请在浏览器中确认已登录 Qwen，然后按回车继续测试..."
read

echo ""
echo "开始测试 Qwen API..."
echo ""

# 运行 Node.js 测试脚本
node test/test-qwen-api.mjs
