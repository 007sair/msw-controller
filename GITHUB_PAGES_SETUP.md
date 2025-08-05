# GitHub Pages 部署指南

本项目已配置自动部署 examples 目录到 GitHub Pages。

## 🚀 自动部署

当代码推送到 `main` 分支时，GitHub Actions 会自动：
1. 构建 core 和 sdk 包
2. 构建 examples 项目
3. 部署到 GitHub Pages

## ⚙️ GitHub 仓库设置

请按以下步骤配置 GitHub Pages：

1. 进入仓库的 **Settings** 页面
2. 在左侧菜单中找到 **Pages**
3. 在 **Source** 部分选择 **GitHub Actions**
4. 保存设置

## 📁 项目结构

```
├── .github/workflows/
│   └── deploy-pages.yml     # GitHub Actions 工作流
├── examples/
│   ├── public/
│   │   └── .nojekyll        # 确保 GitHub Pages 正确处理文件
│   ├── vite.config.ts       # 配置了生产环境的 base 路径
│   └── package.json         # 包含 build:pages 脚本
└── packages/
    ├── core/
    └── sdk/
```

## 🔧 本地测试

要在本地测试生产环境构建：

```bash
# 构建所有包
pnpm build

# 构建 examples（生产环境）
cd examples
pnpm build:pages

# 预览构建结果
pnpm preview
```

## 🌐 访问地址

部署成功后，可以通过以下地址访问：
`https://[your-username].github.io/msw-controller/`

## 📝 注意事项

- 首次部署可能需要几分钟时间
- 确保仓库是公开的，或者有 GitHub Pro/Team 账户
- 如果修改了仓库名称，需要更新 `examples/vite.config.ts` 中的 base 路径