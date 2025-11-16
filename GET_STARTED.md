# 🚀 快速开始指南

欢迎使用 2FA Manager！这是一个完全重构的专业级 2FA TOTP 管理工具。

## ✅ 项目状态

**当前进度**: 70% 完成
**核心功能**: ✅ 已完成
**可用功能**: Quick Mode

---

## 📦 立即开始

### 1. 启动开发服务器

```bash
cd /Volumes/SSD/dev/new/2fa
npm run dev
```

服务器将在 `http://localhost:3000` 启动

### 2. 访问功能页面

**首页** - 模式选择
```
http://localhost:3000/
http://localhost:3000/zh  (中文版)
```

**Quick Mode** - TOTP 代码生成器 ✅
```
http://localhost:3000/quick
http://localhost:3000/zh/quick  (中文版)
```

**Vault Manager** - 保险库管理 ⏳
```
http://localhost:3000/vault  (开发中)
```

---

## 🧪 测试 Quick Mode

1. 访问 `http://localhost:3000/quick`
2. 输入测试密钥: `JBSWY3DPEHPK3PXP`
3. 查看实时生成的 6 位 TOTP 代码
4. 观察倒计时和进度条
5. 点击复制按钮测试复制功能

---

## 📚 文档索引

1. **README.md** - 项目说明和功能介绍
2. **IMPLEMENTATION.md** - 完整实施文档（技术细节）
3. **DEPLOYMENT.md** - Cloudflare 部署指南
4. **PROJECT_STATUS.md** - 项目状态报告
5. **SUMMARY.md** - 项目总结
6. **GET_STARTED.md** - 本快速开始指南

---

## 🛠️ 可用命令

```bash
# 开发
npm run dev          # 启动开发服务器 (Turbopack)
npm run build        # 构建生产版本
npm start            # 启动生产服务器
npm run lint         # 运行 ESLint

# 构建已测试通过 ✅
# 类型检查通过 ✅
# 无 ESLint 错误 ✅
```

---

## 📁 项目结构

```
/Volumes/SSD/dev/new/2fa/
├── app/[locale]/          # 多语言页面
│   ├── page.tsx           # ✅ 首页
│   └── quick/
│       └── page.tsx       # ✅ Quick Mode
│
├── lib/core/              # ✅ 核心功能
│   ├── base32.ts          # Base32 编解码
│   ├── totp.ts            # TOTP 生成引擎
│   ├── crypto.ts          # AES-256-GCM 加密
│   └── vault.ts           # 保险库服务
│
├── components/ui/         # ✅ shadcn/ui 组件
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
│
├── locales/               # ✅ 翻译文件
│   ├── en.json            # 英文
│   └── zh.json            # 中文
│
└── [配置文件]             # ✅ 所有配置完成
```

---

## 🎯 下一步开发计划

### 优先级 P0（立即）

- [ ] 开发 Vault Manager 页面
- [ ] 创建 Vault Unlock 组件
- [ ] 创建 TOTP Card 组件

### 优先级 P1（本周）

- [ ] 添加账户功能
- [ ] 语言切换器
- [ ] 搜索和过滤

### 优先级 P2（下周）

- [ ] CSV 导入
- [ ] 备份/恢复
- [ ] Cloudflare 部署

---

## 🔧 开发提示

### 添加新页面

```bash
# 创建新页面
mkdir -p app/[locale]/your-page
touch app/[locale]/your-page/page.tsx

# 页面自动支持多语言路由
# /your-page      (英文)
# /zh/your-page   (中文)
```

### 添加翻译

在 `locales/en.json` 和 `locales/zh.json` 中添加：

```json
{
  "yourSection": {
    "title": "Your Title",
    "description": "Your description"
  }
}
```

在组件中使用：

```typescript
const t = useTranslations('yourSection');
<h1>{t('title')}</h1>
```

### 添加 shadcn 组件

```bash
npx shadcn@latest add [component-name]

# 例如:
npx shadcn@latest add select
npx shadcn@latest add dropdown-menu
```

---

## 🐛 常见问题

### Q: 构建失败？

```bash
# 清除缓存重新构建
rm -rf .next node_modules
npm install
npm run build
```

### Q: 类型错误？

确保安装了所有依赖：
```bash
npm install
```

### Q: 路由不工作？

检查 `middleware.ts` 和 `i18n.ts` 配置。

---

## 📞 获取帮助

- 查看 `IMPLEMENTATION.md` 了解技术细节
- 查看 `DEPLOYMENT.md` 了解部署流程
- 查看 `PROJECT_STATUS.md` 了解项目进度

---

## ✨ 核心功能演示

### TOTP 生成示例

```typescript
import { generateTOTP } from '@/lib/core/totp';

// 生成单个代码
const code = await generateTOTP('JBSWY3DPEHPK3PXP');
console.log(code); // "123456" (示例)

// 批量生成
import { generateBatch } from '@/lib/core/totp';

const entries = [
  { id: '1', issuer: 'Google', label: 'user@example.com', secret: 'ABC...', digits: 6, period: 30, algorithm: 'SHA-1' },
  // ...
];

const codes = await generateBatch(entries);
```

### 保险库使用示例

```typescript
import { VaultService } from '@/lib/core/vault';

const vault = new VaultService();

// 解锁保险库
await vault.unlock('my-password');

// 添加账户
await vault.addEntry({
  issuer: 'Google',
  label: 'user@example.com',
  secret: 'JBSWY3DPEHPK3PXP',
  digits: 6,
  period: 30,
  algorithm: 'SHA-1'
});

// 获取所有账户
const entries = vault.getEntries();
```

---

**准备好了吗？** 运行 `npm run dev` 开始探索！ 🚀

**文档更新**: 2025-11-15
**项目状态**: 🟢 运行良好
