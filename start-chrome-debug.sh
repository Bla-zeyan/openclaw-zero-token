#!/bin/bash
# 启动 Chrome 调试模式（用于 OpenClaw 连接）
# 单实例：若已有调试 Chrome 则先关闭再重启，保证每次都是新进程

echo "=========================================="
echo "  启动 Chrome 调试模式"
echo "=========================================="
echo ""

# 检测操作系统和 Chrome 路径
if [ -f "/opt/apps/cn.google.chrome-pre/files/google/chrome/google-chrome" ]; then
    # Deepin 系统
    CHROME_PATH="/opt/apps/cn.google.chrome-pre/files/google/chrome/google-chrome"
    USER_DATA_DIR="$HOME/.config/chrome-openclaw-debug"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    CHROME_PATH="google-chrome"
    USER_DATA_DIR="$HOME/.config/chrome-openclaw-debug"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    USER_DATA_DIR="$HOME/Library/Application Support/Chrome-OpenClaw-Debug"
else
    echo "不支持的操作系统: $OSTYPE"
    exit 1
fi

# 单实例：若已有调试 Chrome，先关闭
if pgrep -f "chrome.*remote-debugging-port=9222" > /dev/null; then
    echo "检测到已有调试 Chrome，正在关闭..."
    pkill -f "chrome.*remote-debugging-port=9222" 2>/dev/null
    sleep 2

    if pgrep -f "chrome.*remote-debugging-port=9222" > /dev/null; then
        echo "普通关闭失败，尝试强制关闭..."
        pkill -9 -f "chrome.*remote-debugging-port=9222" 2>/dev/null
        sleep 1
    fi

    if pgrep -f "chrome.*remote-debugging-port=9222" > /dev/null; then
        echo "✗ 无法关闭现有 Chrome，请手动执行: pkill -9 -f 'chrome.*remote-debugging-port=9222'"
        exit 1
    fi
    echo "✓ 已关闭"
    echo ""
fi

echo "正在启动 Chrome 调试模式..."
echo "端口: 9222"
echo "用户数据目录: $USER_DATA_DIR"
echo ""

# 检查 Chrome 路径是否存在
if [ ! -f "$CHROME_PATH" ]; then
    echo "✗ Chrome 未找到: $CHROME_PATH"
    echo ""
    echo "请检查 Chrome 是否已安装"
    exit 1
fi

# 启动 Chrome（添加更多参数确保调试端口正常工作）
"$CHROME_PATH" \
  --remote-debugging-port=9222 \
  --user-data-dir="$USER_DATA_DIR" \
  --disable-gpu-driver-bug-workarounds \
  --no-first-run \
  --no-default-browser-check \
  --disable-background-networking \
  --disable-sync \
  --disable-translate \
  --disable-features=TranslateUI \
  --remote-allow-origins=* \
  > /tmp/chrome-debug.log 2>&1 &

CHROME_PID=$!

echo "Chrome 日志: /tmp/chrome-debug.log"

# 等待 Chrome 启动
echo "等待 Chrome 启动..."
for i in {1..15}; do
    if curl -s http://127.0.0.1:9222/json/version > /dev/null 2>&1; then
        break
    fi
    echo -n "."
    sleep 1
done
echo ""
echo ""

# 检查是否成功启动
if curl -s http://127.0.0.1:9222/json/version > /dev/null 2>&1; then
    VERSION_INFO=$(curl -s http://127.0.0.1:9222/json/version | jq -r '.Browser' 2>/dev/null || echo "未知版本")
    
    echo "✓ Chrome 调试模式启动成功！"
    echo ""
    echo "Chrome PID: $CHROME_PID"
    echo "Chrome 版本: $VERSION_INFO"
    echo "调试端口: http://127.0.0.1:9222"
    echo "用户数据目录: $USER_DATA_DIR"
    echo ""
    echo "正在打开各 Web 平台登录页（便于授权）..."

    WEB_URLS=(
        "https://chat.deepseek.com"
        "https://claude.ai/new"
        "https://chatgpt.com"
        "https://www.doubao.com/chat/"
        "https://chat.qwen.ai"
        "https://www.kimi.com"
        "https://gemini.google.com/app"
        "https://grok.com"
        "https://chat.z.ai"
        "https://manus.im/app"
    )
    for url in "${WEB_URLS[@]}"; do
        "$CHROME_PATH" --remote-debugging-port=9222 --user-data-dir="$USER_DATA_DIR" "$url" > /dev/null 2>&1 &
        sleep 0.5
    done

    echo "✓ 已打开: DeepSeek, Claude, ChatGPT, Doubao, Qwen, Kimi, Gemini, Grok, Z, Manus"
    echo ""
    echo "=========================================="
    echo "下一步操作："
    echo "=========================================="
    echo "1. 在各标签页中登录需要使用的平台"
    echo "2. 确保 config 中 browser.attachOnly=true 且 browser.cdpUrl=http://127.0.0.1:9222"
    echo "3. 运行 ./onboard.sh 选择对应平台完成授权（将复用此浏览器）"
    echo "4. 测试连接: ./test-chrome-connection.sh"
    echo ""
    echo "停止调试模式："
    echo "  pkill -f 'chrome.*remote-debugging-port=9222'"
    echo "=========================================="
else
    echo "✗ Chrome 启动失败"
    echo ""
    echo "请检查："
    echo "  1. Chrome 路径: $CHROME_PATH"
    echo "  2. 端口 9222 是否被占用: lsof -i:9222"
    echo "  3. 用户数据目录权限: $USER_DATA_DIR"
    echo ""
    echo "尝试手动启动："
    echo "  \"$CHROME_PATH\" --remote-debugging-port=9222 --user-data-dir=\"$USER_DATA_DIR\""
    exit 1
fi
