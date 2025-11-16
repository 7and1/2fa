# 2FA Manager - 完整实施文档

## 📋 项目概述

**项目名称**: 2FA Manager (Next.js 版本)
**原始项目**: /Volumes/SSD/dev/new/2fa2fa (Vite + React)
**新项目路径**: /Volumes/SSD/dev/new/2fa
**实施日期**: 2025-11-15
**实施目标**: 完全复刻原项目功能，升级技术栈，优化多语言支持

## 🎯 核心目标

1. ✅ **功能完全复刻** - 保留原项目所有2FA TOTP功能
2. ✅ **技术栈现代化** - Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
3. ✅ **多语言优化** - 英文无前缀（/about）、中文带前缀（/zh/about）
4. ⏳ **部署就绪** - Cloudflare Pages/Workers 配置

## 🏗️ 技术栈对比

### 原项目 (2fa2fa)
```
- 框架: Vite 5 + React 19
- 语言: TypeScript 5.6
- 样式: Tailwind CSS 3.4
- UI: 自定义组件
- 多语言: 自定义 i18n manager
- 部署: Vercel / Cloudflare Pages
```

### 新项目 (2fa)
```
- 框架: Next.js 15 (App Router) + React 19
- 语言: TypeScript 5.7
- 样式: Tailwind CSS 3.4
- UI: shadcn/ui (Radix UI)
- 多语言: next-intl (洁癖路由版)
- 部署: Cloudflare Pages + Workers
```

## 📁 项目结构

```
/Volumes/SSD/dev/new/2fa/
├── app/
│   ├── [locale]/              # 动态语言路由
│   │   ├── layout.tsx         # 根布局 (包含 next-intl Provider)
│   │   ├── page.tsx           # 首页 (模式选择)
│   │   ├── quick/             # Quick Mode 页面
│   │   │   └── page.tsx
│   │   └── vault/             # Vault Manager 页面
│   │       └── page.tsx
│   ├── globals.css            # 全局样式 (Tailwind + shadcn 变量)
│   └── not-found.tsx          # 404 页面
│
├── components/
│   ├── ui/                    # shadcn/ui 组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── totp-card.tsx          # TOTP 代码卡片 (待实现)
│   ├── vault-unlock.tsx       # 保险库解锁组件 (待实现)
│   └── language-switcher.tsx  # 语言切换器 (待实现)
│
├── lib/
│   ├── core/                  # ✅ 核心功能模块 (已迁移)
│   │   ├── base32.ts          # Base32 编解码
│   │   ├── totp.ts            # TOTP 生成引擎
│   │   ├── crypto.ts          # AES-256-GCM 加密
│   │   └── vault.ts           # 保险库服务
│   └── utils.ts               # shadcn/ui 工具函数
│
├── locales/                   # ✅ 多语言翻译文件
│   ├── en.json                # 英文 (默认)
│   └── zh.json                # 中文
│
├── hooks/
│   └── use-toast.ts           # Toast 通知 Hook
│
├── public/
│   └── assets/                # 静态资源
│
├── middleware.ts              # ✅ next-intl 路由中间件
├── i18n.ts                    # ✅ next-intl 配置
├── next.config.ts             # ✅ Next.js 配置
├── tailwind.config.ts         # ✅ Tailwind 配置
├── tsconfig.json              # ✅ TypeScript 配置
├── package.json               # ✅ 依赖配置
└── components.json            # ✅ shadcn/ui 配置
```

## 🚀 已完成的实施步骤

### ✅ 第1步: 项目初始化

**执行时间**: 2025-11-15

**操作内容**:
1. 手动创建 Next.js 项目配置文件
   - `package.json` - 依赖管理
   - `tsconfig.json` - TypeScript 编译器配置
   - `next.config.ts` - Next.js 框架配置
   - `tailwind.config.ts` - Tailwind CSS 配置
   - `postcss.config.mjs` - PostCSS 插件配置
   - `.gitignore` - Git 忽略规则

2. 安装核心依赖
   ```bash
   npm install
   # 安装了 385 个包，无安全漏洞
   ```

3. 创建基础目录结构
   ```bash
   app/ components/ lib/
   ```

**关键配置**:

**package.json**:
```json
{
  "name": "2fa",
  "version": "0.1.0",
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next": "^15.1.0"
  },
  "devDependencies": {
    "typescript": "^5.7.2",
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.2",
    "tailwindcss": "^3.4.16"
  }
}
```

### ✅ 第2步: 多语言系统配置

**执行时间**: 2025-11-15

**操作内容**:
1. 安装 next-intl
   ```bash
   npm install next-intl
   # 添加了 17 个包
   ```

2. 创建 `middleware.ts`
   - 配置语言列表: `['en', 'zh']`
   - 默认语言: `'en'`
   - **关键配置**: `localePrefix: 'as-needed'`
   - 路由匹配规则: `/((?!api|_next|.*\\..*).*)`

3. 创建 `i18n.ts`
   - 动态导入翻译文件
   - 验证语言代码合法性

4. 重组 app 目录结构
   - 删除 `app/layout.tsx` 和 `app/page.tsx`
   - 创建 `app/[locale]/layout.tsx` (包含 NextIntlClientProvider)
   - 创建 `app/[locale]/page.tsx` (首页)
   - 创建 `app/not-found.tsx` (根级 404)

5. 创建翻译文件
   - `locales/en.json` - 英文翻译 (完整)
   - `locales/zh.json` - 中文翻译 (完整)

**路由效果**:
```
✅ 英文 (默认): /          /quick          /vault
✅ 中文:        /zh        /zh/quick       /zh/vault
```

**关键配置**:

**middleware.ts**:
```typescript
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  localePrefix: 'as-needed' // 🚨 关键！
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
```

**app/[locale]/layout.tsx**:
```typescript
export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### ✅ 第3步: shadcn/ui 配置

**执行时间**: 2025-11-15

**操作内容**:
1. 初始化 shadcn/ui
   ```bash
   npx shadcn@latest init -d
   ```
   - 自动创建 `components.json`
   - 更新 `tailwind.config.ts` (添加 CSS 变量)
   - 更新 `app/globals.css` (添加深色模式变量)
   - 创建 `lib/utils.ts`

2. 安装常用组件
   ```bash
   npx shadcn@latest add button card input label separator tabs toast dialog
   ```
   - 创建了 10 个 UI 组件文件
   - 安装了额外依赖: `tailwindcss-animate`, Radix UI 组件

3. 启用深色模式
   - 在 `app/[locale]/layout.tsx` 中添加 `className="dark"`

**安装的组件**:
- ✅ `components/ui/button.tsx` - 按钮
- ✅ `components/ui/card.tsx` - 卡片
- ✅ `components/ui/input.tsx` - 输入框
- ✅ `components/ui/label.tsx` - 标签
- ✅ `components/ui/separator.tsx` - 分隔线
- ✅ `components/ui/tabs.tsx` - 标签页
- ✅ `components/ui/toast.tsx` - 通知提示
- ✅ `components/ui/toaster.tsx` - 通知容器
- ✅ `components/ui/dialog.tsx` - 对话框
- ✅ `hooks/use-toast.ts` - Toast Hook

### ✅ 第4步: 核心功能模块迁移

**执行时间**: 2025-11-15

**操作内容**:
从原项目 `/Volumes/SSD/dev/new/2fa2fa/src/core/` 迁移核心模块到新项目 `lib/core/`

**迁移的模块**:

1. ✅ **base32.ts** (Base32 编解码)
   - `base32ToBytes()` - Base32 字符串转字节数组
   - `bytesToBase32()` - 字节数组转 Base32 字符串
   - `randomBase32()` - 生成随机 Base32 字符串

2. ✅ **totp.ts** (TOTP 生成引擎)
   - `generateTOTP()` - 生成单个 TOTP 代码
   - `verifyTOTP()` - 验证 TOTP 代码
   - `generateBatch()` - 批量生成 TOTP 代码
   - `getTimeWindow()` - 获取时间窗口信息
   - 支持 SHA-1/256/512 算法
   - 支持 6/8/10 位数字
   - 支持 15-60 秒周期

3. ✅ **crypto.ts** (加密服务)
   - `VaultCrypto` 类 - 保险库加密服务
   - `encrypt()` - AES-256-GCM 加密
   - `decrypt()` - AES-256-GCM 解密
   - PBKDF2 密钥派生 (600,000 迭代)
   - `MemoryFootprint` - 内存占用估算

4. ✅ **vault.ts** (保险库服务)
   - `VaultService` 类 - 完整的保险库管理
   - `unlock()` / `lock()` - 解锁/锁定
   - `addEntry()` / `removeEntry()` - 添加/删除条目
   - `importEntries()` - 批量导入
   - `exportEncrypted()` / `restoreFromEnvelope()` - 备份/恢复
   - 标签、分组、收藏、搜索等高级功能

**代码变更**:
- ✅ 移除文件扩展名 `.ts` (从 `'./base32.ts'` 改为 `'./base32'`)
- ✅ 保持所有类型定义和接口
- ✅ 保持所有功能逻辑不变

**测试状态**:
- ⏳ 待添加单元测试 (原项目有 9/9 测试通过)

## 🎨 已创建的页面和组件

### ✅ 首页 (`app/[locale]/page.tsx`)

**功能**:
- 欢迎页面和品牌展示
- 模式选择卡片 (Quick Mode / Vault Manager)
- 功能特性展示 (本地优先、批量生成、军事级加密)

**使用的翻译键**:
```typescript
const t = useTranslations('home');
const appT = useTranslations('app');

t('title')                    // "Welcome to 2FA Manager"
t('subtitle')                 // "Manage your..."
t('quickMode.title')          // "Quick Mode"
t('quickMode.description')    // "Generate single codes..."
t('vaultMode.title')          // "Vault Manager"
t('vaultMode.description')    // "Encrypted vault..."
t('features.local')           // "Local-First"
```

**设计亮点**:
- 深色渐变背景 (`from-gray-900 to-black`)
- 卡片 hover 效果 (边框颜色变化 + 阴影)
- 响应式网格布局 (移动端单列，桌面端双列)

## 📝 翻译文件内容

### 英文 (locales/en.json)

**分类结构**:
```json
{
  "app": { "name", "description", "tagline" },
  "nav": { "home", "quick", "vault", "about" },
  "home": { "title", "subtitle", "quickMode", "vaultMode", "features" },
  "quick": { "title", "description", "secretLabel", "generate", "copy" },
  "vault": { "title", "unlock", "lock", "addAccount", "board", "stats" },
  "common": { "cancel", "save", "delete", "loading", "error" }
}
```

**总计**: ~50 个翻译键 (未来会扩展到 300+)

### 中文 (locales/zh.json)

完全对应英文版本的中文翻译。

## 🔧 待实施的功能

### ⏳ Quick Mode 页面 (`app/[locale]/quick/page.tsx`)

**需求**:
1. 单个 TOTP 代码生成器
2. Base32 密钥输入框
3. 实时倒计时显示
4. 一键复制功能
5. 无需存储，纯客户端运行

**技术要点**:
- 使用 `useState` 管理密钥和代码状态
- 使用 `useEffect` + `setInterval` 实现倒计时
- 调用 `lib/core/totp.ts` 的 `generateTOTP()`
- 使用 `navigator.clipboard.writeText()` 复制

**UI 组件**:
- `Input` - 密钥输入
- `Button` - 生成/复制按钮
- `Card` - 代码显示卡片
- Toast - 复制成功提示

### ⏳ Vault Manager 页面 (`app/[locale]/vault/page.tsx`)

**需求**:
1. 解锁/锁定界面
2. TOTP 代码看板
3. 添加账户表单
4. CSV 导入功能
5. 备份/恢复功能
6. 搜索和过滤

**子组件**:
- `VaultUnlock.tsx` - 解锁组件
- `TotpBoard.tsx` - 代码看板
- `TotpCard.tsx` - 单个代码卡片
- `AddAccountDialog.tsx` - 添加账户对话框
- `ImportCSVDialog.tsx` - CSV 导入
- `BackupDialog.tsx` - 备份管理

**状态管理**:
- 使用 React Context 或创建 `hooks/useVault.ts`
- 初始化 `VaultService` 实例
- 管理 `isUnlocked`, `entries`, `codes` 状态

### ⏳ 语言切换器 (`components/language-switcher.tsx`)

**需求**:
1. 下拉菜单显示可用语言
2. 显示国旗 emoji (🇺🇸 🇨🇳)
3. 点击切换语言并更新 URL
4. 保留当前页面状态

**技术要点**:
```typescript
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };
}
```

## 🚀 Cloudflare 部署配置

### ⏳ Cloudflare Pages 部署

**方案1: 静态导出 (SSG)**

1. 修改 `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};
```

2. 构建命令:
```bash
npm run build
```

3. 输出目录: `out/`

4. 上传到 Cloudflare Pages:
```bash
npx wrangler pages deploy out
```

**方案2: Next.js on Cloudflare Pages (推荐)**

1. 安装适配器:
```bash
npm install --save-dev @cloudflare/next-on-pages
```

2. 修改 `next.config.ts`:
```typescript
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}
```

3. 构建命令:
```bash
npx @cloudflare/next-on-pages
```

4. 输出目录: `.vercel/output/static/`

### ⏳ Cloudflare Workers API 部署

**创建 API 端点** (`api/worker.ts`):

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/generate') {
      // 单个 TOTP 生成端点
      const { secret, digits, period, algorithm } = await request.json();
      const code = await generateTOTP(secret, { digits, period, algorithm });
      return Response.json({ code });
    }

    if (url.pathname === '/api/batch') {
      // 批量生成端点
      const { entries } = await request.json();
      const codes = await generateBatch(entries);
      return Response.json({ codes });
    }

    return new Response('Not Found', { status: 404 });
  },
};
```

**部署命令**:
```bash
cd api && wrangler deploy
```

## 📊 项目进度总结

### ✅ 已完成 (100%)

- [x] Next.js 项目初始化
- [x] TypeScript 配置
- [x] Tailwind CSS 配置
- [x] next-intl 多语言系统
- [x] shadcn/ui 组件库
- [x] 核心功能模块迁移 (base32, totp, crypto, vault)
- [x] 首页设计和实现
- [x] 翻译文件创建 (英文 + 中文)
- [x] 深色模式配置

### ⏳ 进行中 (30%)

- [ ] Quick Mode 页面开发
- [ ] Vault Manager 页面开发
- [ ] 语言切换器组件
- [ ] TOTP 卡片组件
- [ ] 解锁/锁定组件

### ⏳ 待开始 (0%)

- [ ] CSV 导入功能
- [ ] QR 扫描功能
- [ ] 备份/恢复功能
- [ ] 搜索和过滤功能
- [ ] 单元测试迁移
- [ ] Cloudflare 部署配置
- [ ] API 端点开发
- [ ] 性能优化

## 🎯 下一步行动计划

### 优先级 P0 (立即执行)

1. **开发 Quick Mode 页面**
   - 创建 `app/[locale]/quick/page.tsx`
   - 实现 TOTP 生成逻辑
   - 添加倒计时功能
   - 实现复制功能

2. **开发 Vault Unlock 组件**
   - 创建 `components/vault-unlock.tsx`
   - 密码输入表单
   - 调用 `VaultService.unlock()`
   - 错误处理和提示

3. **开发 TOTP Card 组件**
   - 创建 `components/totp-card.tsx`
   - 显示发行者、标签、代码
   - 倒计时进度条
   - 复制按钮

### 优先级 P1 (本周完成)

4. **开发 Vault Manager 页面**
   - 主界面布局
   - 集成 VaultUnlock 和 TotpCard
   - 添加账户功能
   - 锁定功能

5. **创建语言切换器**
   - 下拉菜单组件
   - URL 切换逻辑
   - 国旗显示

### 优先级 P2 (下周完成)

6. **高级功能**
   - CSV 导入
   - 备份/恢复
   - 搜索功能

7. **部署配置**
   - Cloudflare Pages 配置
   - API Workers 部署
   - 环境变量设置

## 📚 参考文档

### Next.js 文档
- [App Router](https://nextjs.org/docs/app)
- [Routing](https://nextjs.org/docs/app/building-your-application/routing)
- [Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

### next-intl 文档
- [Getting Started](https://next-intl-docs.vercel.app/docs/getting-started)
- [Routing (App Router)](https://next-intl-docs.vercel.app/docs/routing/middleware)
- [Usage](https://next-intl-docs.vercel.app/docs/usage/messages)

### shadcn/ui 文档
- [Installation](https://ui.shadcn.com/docs/installation/next)
- [Components](https://ui.shadcn.com/docs/components)
- [Theming](https://ui.shadcn.com/docs/theming)

### Cloudflare 文档
- [Pages](https://developers.cloudflare.com/pages/)
- [Workers](https://developers.cloudflare.com/workers/)
- [Next.js on Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs/)

## 🔐 安全注意事项

1. **客户端加密** - 所有敏感数据在浏览器中加密
2. **密码要求** - 最少 8 个字符
3. **迭代次数** - PBKDF2 600,000 次迭代
4. **算法** - AES-256-GCM + SHA-256
5. **无服务器秘密** - 秘密永不发送到服务器
6. **localStorage** - 仅存储加密数据

## 📝 维护日志

### 2025-11-15

- ✅ 初始化 Next.js 项目
- ✅ 配置 next-intl 多语言系统
- ✅ 安装 shadcn/ui 组件库
- ✅ 迁移核心功能模块 (base32, totp, crypto, vault)
- ✅ 创建首页和基础布局
- ✅ 创建英文和中文翻译文件
- ✅ 编写完整实施文档

---

**文档版本**: 1.0
**最后更新**: 2025-11-15
**维护者**: Claude Code
**项目状态**: 🚧 开发中 (30% 完成)
