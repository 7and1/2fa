# Internationalization (i18n) Standards

## 🎯 Core Principle: Zero Hardcoded Strings

**All user-visible text must be internationalized.** No exceptions.

This project uses `next-intl` for internationalization with support for English (en) and Chinese (zh) locales.

---

## 📁 File Structure

```
locales/
├── en.json          # English translations
└── zh.json          # Chinese translations (must match en.json structure)

scripts/
└── check-i18n.js    # Automated hardcoded string detector
```

---

## 🔑 Translation Key Naming Conventions

### 1. Namespace Organization

Use **nested namespaces** to prevent key collisions and improve organization:

```json
{
  "common": {
    "cancel": "Cancel",
    "save": "Save",
    "error": "Error",
    "success": "Success"
  },
  "manager": {
    "title": "Account Manager",
    "addAccountDialog": {
      "title": "Add Account",
      "fields": {
        "issuer": "Issuer",
        "secret": "Secret Key"
      },
      "validation": {
        "secretRequired": "Secret is required"
      }
    }
  }
}
```

### 2. Naming Rules

- **Use camelCase** for keys: `passwordRequired`, not `password_required`
- **Be descriptive**: `validation.passwordMinLength` not `val.pwdMin`
- **Group related keys**: All validation messages under `validation.*`
- **Shared text in `common`**: Buttons, errors, status messages used across components

### 3. Namespace Patterns

| Pattern | Example | Usage |
|---------|---------|-------|
| `common.*` | `common.cancel` | Shared UI text (buttons, errors) |
| `[page].*` | `live.title` | Page-specific content |
| `[component].*` | `manager.addAccountDialog.*` | Component-specific text |
| `[section].*` | `live.education.subtitle` | Content sections |
| `*.validation.*` | `manager.unlock.validation.*` | Form validation messages |
| `*.fields.*` | `manager.addAccountDialog.fields.*` | Form field labels/placeholders |

---

## 💻 Usage Patterns

### Single Namespace

```typescript
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('manager.addAccountDialog');

  return (
    <>
      <h2>{t('title')}</h2>
      <p>{t('description')}</p>
      <input placeholder={t('fields.issuerPlaceholder')} />
    </>
  );
}
```

### Multiple Namespaces

When you need text from different namespaces:

```typescript
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('manager.addAccountDialog');
  const tCommon = useTranslations('common');

  return (
    <>
      <h2>{t('title')}</h2>
      <Button onClick={handleCancel}>{tCommon('cancel')}</Button>
      <Button onClick={handleSave}>{tCommon('save')}</Button>
    </>
  );
}
```

### Dynamic Content

For content with variables, use template strings in translations:

```json
{
  "welcome": "Welcome, {name}!",
  "expiresIn": "Expires in {seconds}s"
}
```

```typescript
const t = useTranslations('live');
// Use with variables
<div>{t('expiresIn', { seconds: timeLeft })}</div>
```

---

## 🎨 Component Patterns

### Form Fields

```typescript
<div className="space-y-2">
  <Label htmlFor="issuer">
    {t('fields.issuer')}
  </Label>
  <Input
    id="issuer"
    placeholder={t('fields.issuerPlaceholder')}
    value={issuer}
    onChange={(e) => setIssuer(e.target.value)}
  />
  <p className="text-xs text-gray-500">
    {t('fields.issuerHelp')}
  </p>
</div>
```

**Translation keys needed:**
- `fields.issuer` - Label text
- `fields.issuerPlaceholder` - Placeholder text
- `fields.issuerHelp` - Help text (optional)

### Toast Messages

```typescript
const tCommon = useTranslations('common');

toast({
  title: tCommon('success'),
  description: t('accountAdded'),
});

toast({
  title: tCommon('error'),
  description: error instanceof Error ? error.message : t('error'),
  variant: 'destructive',
});
```

### Loading States

```typescript
<Button disabled={isLoading}>
  {isLoading ? t('adding') : t('addButton')}
</Button>
```

**Pattern:** Use present continuous for loading states:
- `addButton: "Add Account"`
- `adding: "Adding..."`
- `unlockButton: "Unlock"`
- `unlocking: "Unlocking..."`

---

## 🔍 Automated Checking

### Run the i18n Checker

```bash
# Check for hardcoded strings
node scripts/check-i18n.js

# Or use npm script (after setup)
npm run check:i18n
```

### What It Checks

1. **Hardcoded Strings**: Detects strings that should be internationalized
2. **Translation Consistency**: Ensures en.json and zh.json have matching keys
3. **Missing Translations**: Reports keys that exist in one locale but not the other

### Output

The script generates:
- **Console output**: Color-coded report of issues
- **JSON report**: `.i18n-report.json` with detailed findings
- **Exit code**: Non-zero if issues found (CI/CD ready)

### Example Output

```
🔍 开始扫描项目中的硬编码字符串...
检查目录: app, components

✗ 发现 2 个文件包含硬编码字符串：

📄 components/vault/totp-card.tsx
   Line 45: "Copy to clipboard"
   Context: onClick={() => copyToClipboard()}

总计: 5 个硬编码字符串需要国际化

📋 检查翻译文件一致性...
✗ 发现 2 个一致性问题：
  - 中文翻译缺失 key: manager.card.copySuccess
```

---

## ⚪ Whitelist System

### What's Whitelisted

Technical terms and code-level strings that should NOT be translated:

**Categories:**
- **React/Next.js APIs**: `useState`, `useEffect`, `onClick`, `className`
- **SVG attributes**: `viewBox`, `strokeWidth`, `fill`, `currentColor`
- **HTML attributes**: `type`, `id`, `name`, `role`, `aria-label`
- **CSS units**: `px`, `rem`, `em`, `%`, `vh`, `vw`
- **Crypto standards**: `SHA-1`, `SHA-256`, `AES-256-GCM`, `PBKDF2`, `Base32`
- **Protocols**: `otpauth://`, `https://`, `JSON`
- **Single characters**: Individual letters, numbers, symbols
- **Variable names**: camelCase identifiers

### Adding to Whitelist

Edit `scripts/check-i18n.js`:

```javascript
whitelist: [
  // Add your technical term here
  'newTechnicalTerm',
  'API-CONSTANT',

  // Or regex pattern
  /^custom-pattern-\d+$/,

  // Existing whitelist...
]
```

### When NOT to Whitelist

❌ **Don't whitelist:**
- User-facing labels: "Add Account", "Cancel"
- Error messages: "Password is required"
- Help text: "Enter your secret key"
- Content: Any text the user reads

✅ **Do whitelist:**
- Code identifiers: `className`, `onClick`
- Standards: `RFC 6238`, `ISO-8601`
- Technical constants: `UTF-8`, `Base32`

---

## 📋 Checklist: Adding New Components

When creating or modifying a component:

### 1. Identify All User-Visible Text

- [ ] Page titles and headings
- [ ] Button labels
- [ ] Form field labels and placeholders
- [ ] Help text and tooltips
- [ ] Error and success messages
- [ ] Loading states
- [ ] Empty states
- [ ] Toast/notification messages

### 2. Add Translation Keys

- [ ] Add keys to `locales/en.json`
- [ ] Add matching keys to `locales/zh.json`
- [ ] Follow namespace conventions
- [ ] Use descriptive key names

### 3. Update Component

```typescript
// ✅ Good
import { useTranslations } from 'next-intl';

const t = useTranslations('myComponent');
<button>{t('saveButton')}</button>

// ❌ Bad
<button>Save</button>
```

### 4. Run Checks

```bash
# Check for hardcoded strings
npm run check:i18n

# Test both locales
# Visit http://localhost:3003/en and http://localhost:3003/zh
```

---

## 🌐 Translation Style Guide

### English (en)

- **Tone**: Direct, conversational (Elon Musk style)
- **Voice**: Active voice, second person ("you")
- **Length**: Concise but complete
- **Example**: "Your vault is encrypted with AES-256-GCM. Nobody can access it but you."

### Chinese (zh)

- **Tone**: Same conversational style in Chinese
- **Formality**: 使用"你"而不是"您" (use informal "你")
- **Style**: 直接、无废话 (direct, no BS)
- **Example**: "你的保险库使用 AES-256-GCM 加密。除了你，谁都打不开。"

### Key Differences

| English | Chinese | Notes |
|---------|---------|-------|
| "Password" | "密码" | Direct translation |
| "Account Manager" | "账户管理器" | Not "账户管理员" |
| "Add Account" | "添加账户" | Action-oriented |
| "Coming Soon..." | "即将推出..." | Keep ellipsis |
| "Unlock" | "解锁" | Not "开锁" |

---

## 🔧 Common Patterns Reference

### Default Values

```typescript
// When user doesn't provide input, use translated defaults
issuer: issuer.trim() || t('defaultIssuer'),  // "Unknown"
label: label.trim() || t('defaultLabel'),     // "Account"
```

### Conditional Messages

```typescript
// Different messages based on state
{hasExistingVault ? t('title') : t('createVault')}
```

### Inline JSX

```typescript
// Keep structure, translate content
<span className="text-red-400">*</span>  // Keep asterisk, it's universal
<p className="text-xs">{t('helpText')}</p>  // Translate help text
```

### Lists and Bullets

```json
{
  "securityNotes": {
    "title": "Security Notes",
    "encryption": "AES-256-GCM encryption with 256-bit keys",
    "pbkdf2": "PBKDF2 key derivation with 600,000 iterations",
    "storage": "All data stored locally in your browser",
    "warning": "Never forget your password - it cannot be recovered"
  }
}
```

```typescript
<ul>
  <li>• {t('securityNotes.encryption')}</li>
  <li>• {t('securityNotes.pbkdf2')}</li>
  <li>• {t('securityNotes.storage')}</li>
  <li>• {t('securityNotes.warning')}</li>
</ul>
```

---

## 🚨 Anti-Patterns (Don't Do This)

### ❌ Hardcoded Strings

```typescript
// BAD
<button>Save</button>
<p>Password is required</p>
const message = "Account added successfully";
```

### ❌ Mixing Languages

```typescript
// BAD - mixing English key with Chinese default
const name = data.name || "未知";

// GOOD
const name = data.name || t('defaultName');
```

### ❌ English-only Keys

```typescript
// BAD - only English gets the message
if (!password) {
  setError("Password is required");
}

// GOOD
if (!password) {
  setError(t('validation.passwordRequired'));
}
```

### ❌ Incomplete Translations

```json
// BAD - en.json has more keys than zh.json
// en.json
{ "button": "Click me", "title": "Welcome" }

// zh.json
{ "button": "点击我" }  // Missing "title"
```

The checker will catch this automatically.

---

## 🎯 Best Practices

### 1. Plan Translation Keys First

Before writing JSX, list all text that needs translation:

```typescript
// Planning phase:
// Needs: title, description, cancelButton, saveButton,
//        validation.nameRequired, validation.emailInvalid

// Then add to en.json and zh.json before coding
```

### 2. Use Semantic Key Names

```typescript
// ✅ Good - self-documenting
t('validation.passwordMinLength')
t('fields.secretPlaceholder')
t('securityNotes.encryption')

// ❌ Bad - unclear meaning
t('error1')
t('msg')
t('txt3')
```

### 3. Group Related Keys

```json
{
  "addAccountDialog": {
    "fields": {
      "issuer": "...",
      "secret": "...",
      "label": "..."
    },
    "validation": {
      "secretRequired": "...",
      "invalidFormat": "..."
    }
  }
}
```

### 4. Keep Translations in Sync

When adding a key to `en.json`, immediately add it to `zh.json`:

```bash
# After editing both files, run check
npm run check:i18n
```

### 5. Test Both Locales

Always test your changes in both locales:

- English: http://localhost:3003/en
- Chinese: http://localhost:3003/zh

---

## 🔄 CI/CD Integration

### Pre-commit Hook (Recommended)

Create `.husky/pre-commit`:

```bash
#!/bin/sh
npm run check:i18n
```

This ensures no hardcoded strings get committed.

### GitHub Actions

```yaml
name: i18n Check
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run check:i18n
```

---

## 📊 Maintenance

### Monthly Review

- [ ] Run `npm run check:i18n`
- [ ] Review `.i18n-report.json` for patterns
- [ ] Update whitelist if needed
- [ ] Check for unused translation keys
- [ ] Verify translations are still accurate

### Adding New Locales

To add a new language (e.g., Spanish):

1. Copy `locales/en.json` → `locales/es.json`
2. Translate all values (keep keys in English)
3. Update `i18n.ts` config:
   ```typescript
   locales: ['en', 'zh', 'es']
   ```
4. Update checker script:
   ```javascript
   localeFiles: {
     en: 'locales/en.json',
     zh: 'locales/zh.json',
     es: 'locales/es.json',
   }
   ```

---

## 🆘 Troubleshooting

### "Translation key not found"

**Error:** `t('someKey')` returns the key instead of translated text

**Solutions:**
1. Check key exists in `locales/[locale].json`
2. Verify namespace matches: `useTranslations('correctNamespace')`
3. Run `npm run check:i18n` to find missing keys
4. Clear `.next` cache: `rm -rf .next && npm run dev`

### "Hardcoded strings detected"

**Error:** `npm run check:i18n` reports hardcoded strings

**Solutions:**
1. Review reported file and line number
2. If it's user-visible text: add translation key
3. If it's technical term: add to whitelist in `scripts/check-i18n.js`
4. Re-run checker to verify

### "Translation consistency error"

**Error:** Checker reports missing keys between locales

**Solutions:**
1. Check the reported key path
2. Add missing key to the locale that's missing it
3. Ensure value is properly translated, not copied from English
4. Run checker again

---

## 📚 Examples from Codebase

### VaultUnlock Component

**Translation keys used:**
- `manager.unlock.title`
- `manager.unlock.password`
- `manager.unlock.validation.passwordRequired`
- `manager.unlock.securityNotes.encryption`
- `common.error`

**Pattern:** Validation messages nested under `validation.*`

### AddAccountDialog Component

**Translation keys used:**
- `manager.addAccountDialog.title`
- `manager.addAccountDialog.fields.issuer`
- `manager.addAccountDialog.fields.issuerPlaceholder`
- `manager.addAccountDialog.tabs.manual`
- `common.cancel`

**Pattern:** Multiple namespaces (dialog + common)

---

## 📖 Additional Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://formatjs.io/docs/core-concepts/icu-syntax/)
- [i18n Best Practices](https://www.w3.org/International/i18n-drafts/nav/about)

---

## ✅ Summary

**Golden Rules:**
1. **Zero hardcoded strings** - all user-visible text must use `t()`
2. **Consistent structure** - en.json and zh.json must match
3. **Semantic naming** - use descriptive, namespaced keys
4. **Run checks** - `npm run check:i18n` before commits
5. **Test both locales** - verify in /en and /zh routes

**Remember:** 建立一个系统，后面的改动都要按新系统和新标准
(Establish a system, all future changes must follow the new system and standards)
