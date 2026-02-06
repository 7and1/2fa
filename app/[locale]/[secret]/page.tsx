import type { Metadata } from "next";
import { SecretCodeView } from "@/components/live/secret-code-view";
import { routing } from "@/i18n/routing";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export function generateStaticParams() {
  // Return empty array - secrets are dynamic user input
  // This allows the route to exist for static export
  return routing.locales.flatMap(() => []);
}

export default async function SecretPage({
  params,
}: {
  params: Promise<{ secret: string }>;
}) {
  const { secret } = await params;

  return <SecretCodeView secretFromPath={secret} />;
}
