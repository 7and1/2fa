# 部署指南 / Deployment Guide

## 快速开始 / Quick Start

你的项目已经配置好自动部署到 Cloudflare Pages！

## ✅ 已完成的配置

### 1. GitHub 仓库
- ✅ 仓库: `https://github.com/7and1/2fa`
- ✅ Git 初始化完成
- ✅ 代码已提交到本地

### 2. GitHub Secrets
已添加以下 secrets 到 GitHub 仓库：
- ✅ `CLOUDFLARE_API_TOKEN`
- ✅ `CLOUDFLARE_ACCOUNT_ID`

### 3. GitHub Actions 工作流
- ✅ 文件: `.github/workflows/deploy.yml`
- ✅ 配置: 使用 wrangler CLI 部署到 Cloudflare Pages
- ✅ 触发条件: Push 到 main 分支

### 4. 项目构建配置
- ✅ TypeScript 错误已修复
- ✅ Next.js 静态导出配置
- ✅ Wrangler 配置文件

## 📋 待完成步骤

### 步骤 1: 推送代码到 GitHub

由于网络问题，代码还未推送到 GitHub。请手动推送：

```bash
cd /Volumes/SSD/dev/new/2fa
git push
```

### 步骤 2: 查看部署状态

推送后，GitHub Actions 会自动触发部署：

```bash
# 查看工作流运行状态
gh run list -R 7and1/2fa

# 监视最新的运行
gh run watch -R 7and1/2fa

# 或访问 GitHub Actions 页面
# https://github.com/7and1/2fa/actions
```

### 步骤 3: 获取部署 URL

部署成功后，你会看到类似这样的输出：

```
✨ Deployment complete!
🌎 https://xxxxx.2fa-manager.pages.dev
```

## 🔧 手动部署（可选）

如果 GitHub Actions 遇到问题，你也可以手动部署：

```bash
cd /Volumes/SSD/dev/new/2fa

# 安装依赖
npm ci

# 构建项目
npm run build

# 部署到 Cloudflare Pages
source .deploy.env
npx wrangler pages deploy out --project-name=2fa-manager --branch=main
```

## 📝 部署配置详情

### Cloudflare Pages 项目
- **项目名称**: `2fa-manager`
- **构建输出目录**: `out`
- **分支**: `main`

### 环境变量（已在 .deploy.env 中配置）
- `CLOUDFLARE_API_TOKEN`: Cloudflare API Token
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare Account ID
- `GITHUB_TOKEN`: GitHub Personal Access Token

**⚠️ 安全提示**:
- `.deploy.env` 文件已添加到 `.gitignore`
- 不要分享或提交此文件到 Git
- 所有敏感信息都已安全存储在 GitHub Secrets 中

### GitHub Actions 工作流

工作流会在以下情况触发：
1. Push 到 `main` 分支
2. Pull Request 到 `main` 分支

工作流步骤：
1. ✅ Checkout 代码
2. ✅ 设置 Node.js 20
3. ✅ 安装依赖 (`npm ci`)
4. ✅ 构建应用 (`npm run build`)
5. ✅ 部署到 Cloudflare Pages

## 🎯 下一步

1. **推送代码**: `git push`
2. **等待部署**: 查看 GitHub Actions 运行状态
3. **访问网站**: 使用 Cloudflare Pages 提供的 URL
4. **配置自定义域名**（可选）:
   - 在 Cloudflare Pages Dashboard 中添加自定义域名
   - 更新 DNS 记录

## 🔍 故障排查

### 部署失败

如果部署失败，检查：

1. **GitHub Secrets 是否正确**:
   ```bash
   gh secret list -R 7and1/2fa
   ```

2. **查看详细日志**:
   ```bash
   gh run view <run-id> -R 7and1/2fa --log-failed
   ```

3. **本地测试构建**:
   ```bash
   npm run build
   # 检查 out 目录是否生成
   ```

### Cloudflare Pages 项目不存在

首次部署时，wrangler 会自动创建项目。如果遇到问题：

```bash
# 使用 wrangler 登录
npx wrangler login

# 列出现有项目
npx wrangler pages project list

# 创建新项目（如果需要）
npx wrangler pages project create 2fa-manager
```

## 📚 相关文档

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Next.js 静态导出](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

## 🤝 支持

如果遇到问题：

1. 查看 GitHub Actions 运行日志
2. 检查 Cloudflare Dashboard 中的部署状态
3. 参考上面的故障排查部分

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
