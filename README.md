# 2FA Live Auth

> Professional-grade bulk 2FA workspace built with Next.js

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

## ✨ Features

- 🚀 **Quick Mode** - Stateless single-code generator for one-off usage
- 🔐 **Encrypted Vault** - PBKDF2 + AES-256-GCM with per-user salt
- 🔄 **Batch TOTP Engine** - RFC 6238 compliant generator
- 📎 **Clipboard Workflows** - Copy individual or whole batches
- 🧳 **Backup & Restore** - Export/import encrypted vault snapshots with one click
- 🔍 **Search & Filter** - Quickly find accounts in your vault
- 🎯 **Auto-Refresh** - All codes update in real-time every second
- 🌍 **Multi-language** - English (default) and Chinese support
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS
- ⚡ **Local-First** - All encryption happens in your browser
- 📦 **Lightweight** - Only 167 KB total bundle size

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/)
- **Crypto**: Web Crypto API
- **Storage**: localStorage (encrypted)

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- A modern browser (Chrome/Safari/Firefox ≥ 2023)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd 2fa

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the app.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## 🌐 Multi-language Support

The app uses **next-intl** with a "clean URL" approach:

- **English (Default)**: `/` `/quick` `/vault`
- **Chinese**: `/zh` `/zh/quick` `/zh/vault`

The default language has no prefix, while other languages use a prefix.

### Adding a New Language

1. Create translation file: `locales/ja.json`
2. Update `middleware.ts`:
   ```typescript
   locales: ['en', 'zh', 'ja']
   ```
3. Update `i18n.ts` with the same locale list
4. Translate all keys from `locales/en.json`

## 📖 Usage

### Quick Mode

1. Navigate to `/quick`
2. Enter your Base32 TOTP secret
3. Click "Generate Code"
4. Copy the code (updates every 30 seconds)

### Vault Manager

1. Navigate to `/vault`
2. Create or unlock your vault with a master password (8+ characters)
3. Add accounts manually or import from CSV
4. Copy codes individually or in bulk
5. Backup your encrypted vault
6. Lock the vault when done

## 🔐 Security

- ✅ Client-side encryption only (AES-256-GCM)
- ✅ PBKDF2 with 600,000 iterations
- ✅ No server-side secrets storage
- ✅ Master password never leaves your browser
- ✅ Encrypted data stored in localStorage
- ✅ No analytics or tracking

⚠️ **Important**: Losing your master password means permanent data loss by design.

## 🏗️ Project Structure

```
/
├── app/
│   ├── [locale]/           # Internationalized pages
│   │   ├── layout.tsx      # Root layout with i18n
│   │   ├── page.tsx        # Home page
│   │   ├── quick/          # Quick Mode
│   │   └── vault/          # Vault Manager
│   └── globals.css
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── ...                 # Custom components
├── lib/
│   ├── core/               # Core functionality
│   │   ├── base32.ts       # Base32 codec
│   │   ├── totp.ts         # TOTP generator
│   │   ├── crypto.ts       # Encryption
│   │   └── vault.ts        # Vault service
│   └── utils.ts
├── locales/
│   ├── en.json             # English translations
│   └── zh.json             # Chinese translations
├── middleware.ts           # next-intl routing
├── i18n.ts                 # i18n config
└── next.config.ts
```

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm test

# Run type checking
npx tsc --noEmit
```

## 📦 Deployment

This application is configured for **static export** and deploys to Cloudflare Pages.

### Cloudflare Pages (Recommended)

**Quick Deploy via Dashboard:**

1. Push code to GitHub
2. Connect repository in [Cloudflare Pages](https://dash.cloudflare.com/)
3. Configure:
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
4. Deploy

**Manual Deploy via Wrangler:**

```bash
# Install Wrangler CLI
npm install -g wrangler

# Authenticate
wrangler login

# Build the app
npm run build

# Deploy
wrangler pages deploy out
```

**GitHub Actions (Automated):**

The project includes automatic deployment via GitHub Actions. Set up secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

See [CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md) for detailed instructions.

### Other Static Hosts

The app exports to static HTML in the `out/` directory. Deploy to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

```bash
# Build
npm run build

# The 'out/' directory contains all static files
```

## 🤝 Contributing

Contributions are welcome! Please read the [IMPLEMENTATION.md](./IMPLEMENTATION.md) for development guidelines.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🙏 Credits

- Original project: [2fa2fa](https://github.com/...)
- UI components: [shadcn/ui](https://ui.shadcn.com/)
- Icons: [Lucide Icons](https://lucide.dev/)
- Framework: [Next.js](https://nextjs.org/)

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check [IMPLEMENTATION.md](./IMPLEMENTATION.md) for technical details
- Review [Cloudflare deployment guide](./DEPLOYMENT.md)

---

**Built with ❤️ using Next.js and TypeScript**
