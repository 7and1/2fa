import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "2FA Manager - Secure TOTP Vault & Authenticator | 2FA2FA",
  description: "Professional 2FA manager with encrypted vault. Manage 100+ TOTP codes securely. Bulk generation, AES-256 encryption, offline backup.",
};

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
