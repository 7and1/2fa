import type { Metadata } from "next";
import { SecretCodeView } from "@/components/live/secret-code-view";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SecretPage({
  params,
}: {
  params: Promise<{ secret: string }>;
}) {
  const { secret } = await params;

  return <SecretCodeView secretFromPath={secret} />;
}
