#!/usr/bin/env node

/**
 * i18n Hardcoded String Detector
 *
 * 自动检测项目中未国际化的硬编码字符串
 * Automatically detects hardcoded strings that should be internationalized
 *
 * Usage: node scripts/check-i18n.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const CONFIG = {
  // 需要检查的目录
  checkDirs: ['app', 'components'],
  // 需要检查的文件扩展名
  fileExtensions: ['.tsx', '.ts', '.jsx', '.js'],
  // 翻译文件路径
  localeFiles: {
    en: 'locales/en.json',
    zh: 'locales/zh.json',
  },
  // 忽略的文件/目录
  ignorePatterns: [
    'node_modules',
    '.next',
    'dist',
    'build',
    '.git',
  ],
  // 需要国际化的字符串模式
  stringPatterns: [
    // JSX文本节点: <div>Text</div>
    /<[^>]+>([^<]{2,})<\/[^>]+>/g,
    // 字符串字面量（单引号）: 'some text'
    /'([^']{3,})'/g,
    // 字符串字面量（双引号）: "some text"
    /"([^"]{3,})"/g,
    // 模板字符串: `some text`
    /`([^`]{3,})`/g,
  ],
  // 白名单：这些字符串不需要翻译
  whitelist: [
    // 技术术语
    'className', 'onClick', 'onChange', 'onSubmit', 'useState', 'useEffect',
    'viewBox', 'strokeWidth', 'strokeLinecap', 'strokeLinejoin',
    'fill', 'stroke', 'currentColor', 'none', 'use client',
    // HTML属性
    'type', 'id', 'name', 'value', 'placeholder', 'disabled', 'required',
    'aria-label', 'role', 'tabIndex',
    // CSS相关
    'px', 'rem', 'em', '%', 'vh', 'vw',
    'flex', 'grid', 'block', 'inline', 'absolute', 'relative',
    // 技术标准
    'UTF-8', 'ISO', 'RFC', 'SHA-1', 'SHA-256', 'AES-256-GCM', 'PBKDF2',
    'Base32', 'JSON', 'otpauth://', 'TOTP', 'HMAC', 'INVALID_PASSWORD',
    // Next.js/React 特定
    'force-static', 'en_US', 'zh_CN', '_blank', 'sr-only',
    // MIME types and file extensions
    'image/svg+xml', 'summary_large_image', 'max-image-preview', 'max-snippet',
    'application/json', '.json,application/json', 'image/*',
    // React displayName patterns
    'Alert', 'Button', 'Card', 'CardHeader', 'CardTitle', 'CardDescription',
    'CardContent', 'CardFooter', 'Input', 'DialogHeader', 'DialogFooter',
    'AlertTitle', 'AlertDescription',
    // Protocol/URL parts
    'otpauth:',
    // App identifiers (in metadata only)
    '2FA2FA', '2fa live', '2fa auth', '2FA manager',
    // Console/Debug messages
    'Unlock failed:',
    // UI Component text (sr-only, etc)
    'Close',
    // HTML IDs and form field names
    'backup-file',
    // Translation function calls (not actual strings)
    'features.encryption', 'features.compliant', 'features.noTracking',
    // SEO keywords (in metadata only)
    'two factor authentication', 'real-time 2fa', 'live authentication',
    '2fa authenticator', 'totp generator', 'otp manager', 'authenticator app',
    '2fa codes', 'time-based otp', 'secure authentication',
    // 单字符和数字
    /^[0-9]+$/, /^[a-zA-Z]$/,
    // URL和路径 (including image paths)
    /^\/[a-z0-9\/.@_-]*\.(svg|ico|png|jpg|webmanifest)$/i,
    /^\/[a-z0-9/-]*$/i,
    /^https?:\/\//,
    // Hex colors
    /^#[0-9a-fA-F]{3,8}$/,
    // CSS classes (Tailwind patterns)
    /^[\w-]+\s+[\w-]+/, // Multi-word classes like "text-center mb-8"
    /^(text|bg|border|p|m|w|h|flex|grid|space|gap|rounded|shadow|hover|animate|opacity|transition|duration|font|leading|sr|pt|pb|pl|pr|mt|mb|ml|mr|accent)-/,
    'hover:bg-accent hover:text-accent-foreground', // Button variant CSS
    // Template literals and variable references
    /^\{[^}]+\}$/,
    /\$\{[^}]+\}/,
    // SVG path data
    /^M[\d\s,.-]+[zZ]?$/,
    /^[Mm][\d\s,.-]+/,
    // 变量名模式 (with restrictions to avoid catching real text)
    /^[a-z][a-zA-Z0-9]*$/, // Only if doesn't contain spaces
    // JavaScript code fragments
    ') || isActive(',
    // 特殊字符
    '•', '→', '✓', '×', '📷', '🎣', '🤖', '📱',
  ],
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 检查字符串是否在白名单中
function isWhitelisted(str) {
  return CONFIG.whitelist.some(pattern => {
    if (pattern instanceof RegExp) {
      return pattern.test(str);
    }
    return str === pattern || str.includes(pattern);
  });
}

// 检查字符串是否已经使用了翻译函数
function isTranslated(line) {
  return /t\(|useTranslations|getTranslations/.test(line);
}

// 提取文件中的硬编码字符串
function findHardcodedStrings(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const issues = [];

  lines.forEach((line, index) => {
    // 跳过已翻译的行
    if (isTranslated(line)) return;

    // 跳过注释
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) return;

    // 检查各种字符串模式
    CONFIG.stringPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const str = match[1]?.trim();

        if (str && str.length > 2 && !isWhitelisted(str)) {
          // 排除导入语句
          if (line.includes('import') || line.includes('from')) return;

          // 排除只有数字、空格、特殊字符的字符串
          if (/^[\s\d\W]+$/.test(str)) return;

          issues.push({
            line: index + 1,
            text: str,
            context: line.trim(),
          });
        }
      }
    });
  });

  return issues;
}

// 扫描目录
function scanDirectory(dir, results = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    // 检查是否应该忽略
    if (CONFIG.ignorePatterns.some(pattern => filePath.includes(pattern))) {
      return;
    }

    if (stat.isDirectory()) {
      scanDirectory(filePath, results);
    } else if (CONFIG.fileExtensions.some(ext => file.endsWith(ext))) {
      const issues = findHardcodedStrings(filePath);
      if (issues.length > 0) {
        results.push({
          file: filePath,
          issues,
        });
      }
    }
  });

  return results;
}

// 检查翻译文件一致性
function checkTranslationConsistency() {
  log('\n📋 检查翻译文件一致性...', 'cyan');

  try {
    const enJson = JSON.parse(fs.readFileSync(CONFIG.localeFiles.en, 'utf-8'));
    const zhJson = JSON.parse(fs.readFileSync(CONFIG.localeFiles.zh, 'utf-8'));

    const issues = [];

    function compareObjects(obj1, obj2, path = '') {
      Object.keys(obj1).forEach(key => {
        const currentPath = path ? `${path}.${key}` : key;

        if (!(key in obj2)) {
          issues.push({
            type: 'missing_zh',
            key: currentPath,
            message: `中文翻译缺失 key: ${currentPath}`,
          });
        } else if (typeof obj1[key] === 'object' && obj1[key] !== null) {
          if (typeof obj2[key] !== 'object') {
            issues.push({
              type: 'type_mismatch',
              key: currentPath,
              message: `类型不匹配: ${currentPath}`,
            });
          } else {
            compareObjects(obj1[key], obj2[key], currentPath);
          }
        }
      });

      Object.keys(obj2).forEach(key => {
        const currentPath = path ? `${path}.${key}` : key;
        if (!(key in obj1)) {
          issues.push({
            type: 'extra_zh',
            key: currentPath,
            message: `英文翻译缺失 key: ${currentPath}`,
          });
        }
      });
    }

    compareObjects(enJson, zhJson);

    if (issues.length === 0) {
      log('✓ 翻译文件一致性检查通过！', 'green');
    } else {
      log(`✗ 发现 ${issues.length} 个一致性问题：`, 'red');
      issues.forEach(issue => {
        log(`  - ${issue.message}`, 'yellow');
      });
    }

    return issues;
  } catch (error) {
    log(`✗ 检查翻译文件时出错: ${error.message}`, 'red');
    return [];
  }
}

// 主函数
function main() {
  log('🔍 开始扫描项目中的硬编码字符串...', 'cyan');
  log(`检查目录: ${CONFIG.checkDirs.join(', ')}`, 'blue');
  log('', 'reset');

  let allResults = [];

  CONFIG.checkDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const results = scanDirectory(dir);
      allResults = allResults.concat(results);
    }
  });

  // 输出结果
  if (allResults.length === 0) {
    log('✓ 未发现硬编码字符串！代码100%国际化。', 'green');
  } else {
    log(`✗ 发现 ${allResults.length} 个文件包含硬编码字符串：\n`, 'red');

    allResults.forEach(({ file, issues }) => {
      log(`📄 ${file}`, 'yellow');
      issues.forEach(({ line, text, context }) => {
        log(`   Line ${line}: "${text}"`, 'red');
        log(`   Context: ${context.substring(0, 100)}...`, 'blue');
      });
      log('', 'reset');
    });

    log(`\n总计: ${allResults.reduce((sum, r) => sum + r.issues.length, 0)} 个硬编码字符串需要国际化`, 'magenta');
  }

  // 检查翻译文件一致性
  const consistencyIssues = checkTranslationConsistency();

  // 生成报告
  const report = {
    timestamp: new Date().toISOString(),
    hardcodedStrings: allResults.length,
    totalIssues: allResults.reduce((sum, r) => sum + r.issues.length, 0),
    consistencyIssues: consistencyIssues.length,
    files: allResults,
  };

  fs.writeFileSync(
    path.join(__dirname, '../.i18n-report.json'),
    JSON.stringify(report, null, 2)
  );

  log('\n📊 报告已生成: .i18n-report.json', 'cyan');

  // 如果有问题，返回非零退出码
  if (allResults.length > 0 || consistencyIssues.length > 0) {
    process.exit(1);
  }
}

// 执行
main();
