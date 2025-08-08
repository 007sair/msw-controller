#!/bin/bash

# Chrome Extension Build Script
# 用于打包Chrome扩展以发布到Chrome Web Store

set -e

echo "🚀 开始构建 MSW Controller Chrome 扩展..."

# 创建发布目录
DIST_DIR="dist"
ZIP_NAME="msw-controller-extension.zip"

# 清理之前的构建
if [ -d "$DIST_DIR" ]; then
    echo "🧹 清理之前的构建文件..."
    rm -rf "$DIST_DIR"
fi

# 创建发布目录
mkdir -p "$DIST_DIR"

echo "🗜️ 创建发布包..."

# 创建zip文件，排除不必要的文件
zip -r "$DIST_DIR/$ZIP_NAME" . -x "*.sh" "package.json" "node_modules/*" "dist/*" "build/*" "*.md" "*.zip"

echo "✅ 构建完成！"
echo "📁 发布包: $DIST_DIR/$ZIP_NAME"
echo "📊 文件大小: $(du -h $DIST_DIR/$ZIP_NAME | cut -f1)"
echo ""
echo "🎯 使用方法:"
echo "方法一（推荐）：直接加载当前目录"
echo "1. 打开 Chrome 浏览器"
echo "2. 访问 chrome://extensions/"
echo "3. 开启'开发者模式'"
echo "4. 点击'加载已解压的扩展程序'"
echo "5. 选择当前 chrome-extension 目录"
echo ""
echo "方法二：使用zip包"
echo "1. 直接将 $DIST_DIR/$ZIP_NAME 拖拽到 chrome://extensions/ 页面"
echo "2. 或者解压后按照方法一加载文件夹"
echo ""
echo "💡 提示:"
echo "• 扩展将出现在 Chrome DevTools 中"
echo "• 需要在有 MSW 的页面中使用"