# 部署指南 - Deployment Guide

本文档提供详细的 Cloudflare Pages/Workers 部署步骤。

## 📋 目录

1. [Cloudflare Pages 部署](#cloudflare-pages-部署)
2. [Cloudflare Workers API 部署](#cloudflare-workers-api-部署)
3. [环境变量配置](#环境变量配置)
4. [域名配置](#域名配置)
5. [CI/CD 自动部署](#cicd-自动部署)

## 🚀 Cloudflare Pages 部署

### 方案 1: 使用 @cloudflare/next-on-pages (推荐)

这是在 Cloudflare Pages 上运行 Next.js 的最佳方案。

#### 1. 安装依赖

```bash
npm install --save-dev @cloudflare/next-on-pages
npm install --save-dev wrangler
```

#### 2. 更新 package.json

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "pages:build": "npx @cloudflare/next-on-pages",
    "preview": "npm run pages:build && wrangler pages dev .vercel/output/static",
    "deploy": "npm run pages:build && wrangler pages deploy .vercel/output/static"
  }
}
```

#### 3. 配置 next.config.ts

```typescript
import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  // 确保兼容 Cloudflare Pages
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default withNextIntl(nextConfig);
```

#### 4. 本地预览

```bash
npm run preview
```

访问 `http://localhost:8788`

#### 5. 部署到 Cloudflare Pages

**方式 A: 使用 Wrangler CLI**

```bash
# 首次部署需要登录
npx wrangler login

# 部署
npm run deploy
```

**方式 B: 连接 GitHub (推荐)**

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** > **Create a project**
3. 选择 **Connect to Git**
4. 选择你的 GitHub 仓库
5. 配置构建设置:
   - **Build command**: `npm run pages:build`
   - **Build output directory**: `.vercel/output/static`
   - **Root directory**: `/`
6. 点击 **Save and Deploy**

### 方案 2: 静态导出 (SSG)

如果你不需要服务器端功能，可以使用静态导出。

#### 1. 更新 next.config.ts

```typescript
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true, // Cloudflare Pages 不支持 Next.js Image Optimization
  },
};
```

#### 2. 构建

```bash
npm run build
```

输出目录: `out/`

#### 3. 部署

```bash
npx wrangler pages deploy out
```

或通过 Cloudflare Dashboard 手动上传 `out/` 目录。

## 🔧 Cloudflare Workers API 部署

### 创建 API Worker

#### 1. 创建目录结构

```bash
mkdir -p api
cd api
```

#### 2. 创建 wrangler.toml

```toml
name = "2fa-api"
main = "worker.ts"
compatibility_date = "2025-01-15"

[env.production]
name = "2fa-api"
workers_dev = false
route = "https://api.your-domain.com/*"

[env.staging]
name = "2fa-api-staging"
workers_dev = true
```

#### 3. 创建 worker.ts

```typescript
import { generateTOTP, generateBatch } from '../lib/core/totp';

export interface Env {
  API_KEY: string;
  RATE_LIMIT: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Unauthorized', {
        status: 401,
        headers: corsHeaders
      });
    }

    const token = authHeader.substring(7);
    if (token !== env.API_KEY) {
      return new Response('Invalid API Key', {
        status: 403,
        headers: corsHeaders
      });
    }

    const url = new URL(request.url);

    // Single TOTP generation
    if (url.pathname === '/api/generate' && request.method === 'POST') {
      try {
        const { secret, digits, period, algorithm } = await request.json();
        const code = await generateTOTP(secret, { digits, period, algorithm });

        return Response.json({
          code,
          expiresIn: 30, // Calculate actual expiry
          generatedAt: new Date().toISOString()
        }, { headers: corsHeaders });
      } catch (error) {
        return Response.json({
          error: 'Invalid request',
          message: (error as Error).message
        }, {
          status: 400,
          headers: corsHeaders
        });
      }
    }

    // Batch generation
    if (url.pathname === '/api/batch' && request.method === 'POST') {
      try {
        const { entries } = await request.json();

        if (!Array.isArray(entries) || entries.length > 100) {
          return Response.json({
            error: 'Invalid batch size (max 100)'
          }, {
            status: 400,
            headers: corsHeaders
          });
        }

        const codes = await generateBatch(entries);

        return Response.json({
          codes,
          count: codes.length,
          generatedAt: new Date().toISOString()
        }, { headers: corsHeaders });
      } catch (error) {
        return Response.json({
          error: 'Batch generation failed',
          message: (error as Error).message
        }, {
          status: 400,
          headers: corsHeaders
        });
      }
    }

    return new Response('Not Found', {
      status: 404,
      headers: corsHeaders
    });
  },
};
```

#### 4. 部署 Worker

```bash
cd api

# 登录 (首次)
npx wrangler login

# 部署到生产环境
npx wrangler deploy --env production

# 部署到测试环境
npx wrangler deploy --env staging
```

### 设置环境变量

```bash
# 设置 API Key
npx wrangler secret put API_KEY --env production
# 输入你的 API Key

# 创建 KV Namespace (用于 rate limiting)
npx wrangler kv:namespace create RATE_LIMIT --env production
npx wrangler kv:namespace create RATE_LIMIT --env staging
```

更新 `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "your-kv-namespace-id"
```

## 🔐 环境变量配置

### Cloudflare Pages 环境变量

在 Cloudflare Dashboard > Pages > 你的项目 > Settings > Environment variables 中添加：

```bash
# 生产环境
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# 预览环境
NEXT_PUBLIC_API_URL=https://api-staging.your-domain.com
NEXT_PUBLIC_SITE_URL=https://preview.your-domain.com
```

### 本地开发环境变量

创建 `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🌐 域名配置

### 1. 添加自定义域名

在 Cloudflare Pages 项目设置中:

1. 进入 **Custom domains**
2. 点击 **Set up a domain**
3. 输入你的域名 (例如: `2fa.your-domain.com`)
4. Cloudflare 会自动配置 DNS

### 2. SSL/TLS 配置

Cloudflare Pages 自动提供免费 SSL 证书，无需额外配置。

### 3. API 域名配置

为 Worker 配置子域名:

1. 在 Cloudflare Dashboard > Workers & Pages > 你的 Worker
2. 进入 **Settings** > **Triggers**
3. 添加 **Custom Domain**: `api.your-domain.com`

## 🔄 CI/CD 自动部署

### GitHub Actions 配置

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main
  pull_request:

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    name: Deploy to Cloudflare Pages
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run pages:build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: 2fa
          directory: .vercel/output/static
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

### 配置 GitHub Secrets

在 GitHub 仓库设置中添加:

1. `CLOUDFLARE_API_TOKEN` - Cloudflare API Token
   - 在 Cloudflare Dashboard > My Profile > API Tokens 创建
   - 权限: Account.Cloudflare Pages (Edit)

2. `CLOUDFLARE_ACCOUNT_ID` - Cloudflare Account ID
   - 在 Cloudflare Dashboard 首页右侧找到

## ✅ 部署检查清单

### 部署前

- [ ] 运行 `npm run build` 确保构建成功
- [ ] 运行 `npm run lint` 修复所有 linting 错误
- [ ] 测试多语言功能 (访问 `/zh`)
- [ ] 检查所有页面在生产模式下正常工作

### Cloudflare Pages 部署后

- [ ] 访问部署的 URL 确认网站可访问
- [ ] 测试所有路由: `/`, `/quick`, `/vault`, `/zh/*`
- [ ] 测试 Quick Mode 功能
- [ ] 测试 Vault Manager 功能
- [ ] 检查浏览器控制台无错误
- [ ] 测试语言切换功能

### Cloudflare Workers API 部署后

- [ ] 测试 `/api/generate` 端点
- [ ] 测试 `/api/batch` 端点
- [ ] 验证 API Key 认证
- [ ] 测试 CORS 配置
- [ ] 监控错误率和响应时间

## 📊 性能监控

### Cloudflare Web Analytics

在 Cloudflare Dashboard > Analytics & Logs > Web Analytics 中添加你的网站。

### Lighthouse CI

在 GitHub Actions 中添加性能测试:

```yaml
- name: Run Lighthouse CI
  uses: treosh/lighthouse-ci-action@v10
  with:
    urls: |
      https://your-domain.com
      https://your-domain.com/quick
      https://your-domain.com/vault
    uploadArtifacts: true
```

## 🐛 故障排查

### 构建失败

```bash
# 清除缓存
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### 路由 404 错误

检查 `middleware.ts` 配置和 `next.config.ts` 中的 `trailingSlash` 设置。

### Worker 部署失败

```bash
# 检查 wrangler.toml 语法
npx wrangler deploy --dry-run

# 查看日志
npx wrangler tail
```

## 📞 技术支持

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Next.js on Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [next-intl 文档](https://next-intl-docs.vercel.app/)

---

**文档版本**: 1.0
**最后更新**: 2025-11-15
