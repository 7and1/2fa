"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function Footer() {
  const appT = useTranslations("app");
  const navT = useTranslations("nav");
  const footerT = useTranslations("footer");

  return (
    <footer className="border-t border-gray-800 bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2">
              <svg
                className="h-6 w-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span className="font-bold text-white">{appT("name")}</span>
            </div>
            <p className="text-sm text-gray-400">{appT("tagline")}</p>
            <p className="text-xs text-gray-500">{footerT("subtitle")}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-3">
              {footerT("quickLinks")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                >
                  {navT("live")}
                </Link>
              </li>
              <li>
                <Link
                  href="/manager"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                >
                  {navT("manager")}
                </Link>
              </li>
              <li>
                <Link
                  href="/api"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                >
                  {navT("api")}
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/7and1/2FA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors inline-flex items-center gap-1"
                >
                  {footerT("github")}
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </li>
            </ul>
          </div>

          {/* Security Info */}
          <div>
            <h3 className="font-semibold text-white mb-3">
              {footerT("security")}
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{footerT("features.encryption")}</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{footerT("features.clientSide")}</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{footerT("features.compliant")}</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{footerT("features.noTracking")}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} {footerT("copyright")}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg
                  className="w-3 h-3 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                {footerT("browserNotice")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
