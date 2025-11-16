# Cloudflare Pages Deployment Guide

This document provides complete instructions for deploying the 2FA Manager application to Cloudflare Pages.

## Prerequisites

- Cloudflare account (free tier is sufficient)
- GitHub account
- Git repository for this project

## Table of Contents

- [Quick Deployment](#quick-deployment)
- [Manual Deployment](#manual-deployment)
- [GitHub Actions Deployment](#github-actions-deployment)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## Quick Deployment

The fastest way to deploy is using Cloudflare Pages directly from your GitHub repository:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Cloudflare Pages**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to **Workers & Pages** → **Create Application** → **Pages**
   - Click **Connect to Git**
   - Select your repository
   - Configure build settings:
     - **Framework preset**: `Next.js (Static HTML Export)`
     - **Build command**: `npm run build`
     - **Build output directory**: `out`
   - Click **Save and Deploy**

3. **Wait for deployment** (usually 2-3 minutes)

4. **Access your site** at `https://your-project.pages.dev`

## Manual Deployment

If you prefer to deploy locally using Wrangler:

### Install Wrangler

```bash
npm install -g wrangler
```

### Authenticate

```bash
wrangler login
```

### Build the Application

```bash
npm run build
```

### Deploy

```bash
wrangler pages deploy out
```

### Follow the Prompts

- **Project name**: `2fa-manager` (or your preferred name)
- **Production branch**: `main`

Your site will be available at `https://2fa-manager.pages.dev`

## GitHub Actions Deployment

This project includes a pre-configured GitHub Actions workflow for automatic deployments.

### Setup Steps

1. **Create Cloudflare API Token**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
   - Click **Create Token**
   - Use the **Edit Cloudflare Workers** template
   - Click **Continue to summary** → **Create Token**
   - **Copy the token** (you won't see it again)

2. **Get Account ID**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Select **Workers & Pages**
   - Your Account ID is shown on the right sidebar

3. **Add GitHub Secrets**:
   - Go to your GitHub repository
   - Navigate to **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Add the following secrets:
     - Name: `CLOUDFLARE_API_TOKEN`, Value: `<your-api-token>`
     - Name: `CLOUDFLARE_ACCOUNT_ID`, Value: `<your-account-id>`

4. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Setup deployment"
   git push origin main
   ```

5. **Monitor Deployment**:
   - Go to **Actions** tab in your GitHub repository
   - Watch the deployment progress
   - Once complete, your site is live!

### Workflow Details

The workflow (`.github/workflows/deploy.yml`) automatically:
- Installs dependencies
- Builds the application
- Deploys to Cloudflare Pages
- Runs on every push to `main` branch

## Configuration

### Custom Domain

1. **Add Domain in Cloudflare Pages**:
   - Go to your Pages project
   - Navigate to **Custom domains**
   - Click **Set up a custom domain**
   - Enter your domain name
   - Follow DNS configuration instructions

2. **Update DNS Records**:
   - Add the CNAME record pointing to your Pages URL
   - Wait for DNS propagation (usually 5-15 minutes)

### Environment Variables

If you need to add environment variables:

1. Go to your Pages project in Cloudflare Dashboard
2. Navigate to **Settings** → **Environment variables**
3. Add your variables for Production and Preview environments

**Note**: This application is fully client-side, so no environment variables are needed for basic operation.

### Security Headers

Security headers are automatically configured via `public/_headers`:

- `X-Frame-Options`: Prevents clickjacking
- `X-Content-Type-Options`: Prevents MIME sniffing
- `Content-Security-Policy`: Restricts resource loading
- `Referrer-Policy`: Controls referrer information
- `Permissions-Policy`: Restricts browser features

To modify headers, edit `public/_headers`.

## Build Configuration

### Next.js Configuration

The application uses static export mode (`next.config.ts`):

```typescript
{
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  distDir: 'out',
}
```

### Static Export Details

- **Output directory**: `out/`
- **Generated pages**:
  - `/en/` and `/zh/` (home pages)
  - `/en/quick` and `/zh/quick` (Quick Mode)
  - `/en/vault` and `/zh/vault` (Vault Manager)
- **Total size**: ~170 KB (First Load JS)

## Troubleshooting

### Build Fails with "Page is missing generateStaticParams()"

**Cause**: Dynamic routes need static params for export

**Solution**: Already configured in `app/[locale]/layout.tsx`:
```typescript
export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh' }];
}
```

### 404 Errors on Page Refresh

**Cause**: SPA routing not configured

**Solution**: Already configured in `public/_redirects`:
```
/*    /index.html   200
```

### Images Not Loading

**Cause**: Next.js Image Optimization not available in static export

**Solution**: Already configured in `next.config.ts`:
```typescript
images: { unoptimized: true }
```

### Locale Routes Not Working

**Cause**: Middleware not compatible with static export

**Solution**: Using client-side routing with `localePrefix: 'as-needed'` in `middleware.ts`

### Build Size Too Large

**Current size**: 167 KB (Vault Manager page, largest)

**Optimization tips**:
1. Enable tree-shaking (already enabled)
2. Use dynamic imports for heavy components
3. Remove unused dependencies
4. Optimize images and assets

### Deployment Hangs

1. **Check build logs** in Cloudflare Pages dashboard
2. **Verify build command**: Should be `npm run build`
3. **Verify output directory**: Should be `out`
4. **Check Node version**: Should be 20.x

## Performance

### Lighthouse Scores (Expected)

- **Performance**: 95-100
- **Accessibility**: 95-100
- **Best Practices**: 100
- **SEO**: 95-100

### Optimizations

- Static HTML generation
- Automatic code splitting
- Asset compression (Brotli/Gzip)
- CDN distribution via Cloudflare
- HTTP/3 support
- Automatic HTTPS

## Monitoring

### Analytics

Enable Cloudflare Web Analytics:
1. Go to **Analytics** → **Web Analytics** in Cloudflare
2. Add your domain
3. Copy the script tag
4. Add to `app/[locale]/layout.tsx` (optional)

### Logs

View deployment and function logs:
- Go to your Pages project
- Navigate to **Functions** → **Logs**
- Real-time log streaming available

## Rollback

To rollback to a previous deployment:

1. Go to **Deployments** in Pages dashboard
2. Find the successful deployment you want to restore
3. Click **···** → **Rollback to this deployment**
4. Confirm the rollback

## Local Development vs Production

### Development
```bash
npm run dev
# Runs at http://localhost:3000
# Hot reload enabled
# Development mode optimizations
```

### Production Build (Local Test)
```bash
npm run build
npx serve out
# Test the production build locally
```

### Production (Cloudflare)
- Served from global CDN
- Automatic HTTPS
- DDoS protection
- Analytics available
- 100% uptime SLA

## Cost

**Cloudflare Pages Free Tier**:
- ✅ Unlimited static sites
- ✅ Unlimited requests
- ✅ Unlimited bandwidth
- ✅ 500 builds per month
- ✅ 1 build at a time

**Perfect for this application** - no costs expected!

## Support

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages)
- [Next.js Static Export Documentation](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Troubleshooting Guide](https://developers.cloudflare.com/pages/platform/known-issues)

## Summary

Your 2FA Manager is now deployed with:
- ✅ Global CDN distribution
- ✅ Automatic HTTPS
- ✅ Multi-language support (en, zh)
- ✅ Zero configuration needed
- ✅ Free hosting
- ✅ Automatic deployments via GitHub Actions

**Production URL**: `https://your-project.pages.dev`

**Build status**: Check GitHub Actions tab

**Deployment logs**: Check Cloudflare Pages dashboard
