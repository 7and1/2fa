import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // 支持的语言列表
  locales: ['en', 'zh'],

  // 默认语言
  defaultLocale: 'en',

  // 🚨 关键配置：'as-needed'
  // 效果：默认语言 (en) 不显示前缀，其他语言显示
  localePrefix: 'as-needed',

  // 禁用自动语言检测
  // 不根据浏览器语言自动跳转，用户手动选择语言
  localeDetection: false
});

export const config = {
  // 匹配所有非静态资源路径
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
