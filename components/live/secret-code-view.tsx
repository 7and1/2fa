"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface SecretCodeViewProps {
  secretFromPath: string;
}

interface TotpGenerateResponse {
  data: {
    code: string;
    expiresIn: number;
    counter: number;
  } | null;
  meta: Record<string, unknown> | null;
  error: {
    code: string;
    message: string;
  } | null;
}

function decodeSecret(secret: string): string {
  try {
    return decodeURIComponent(secret);
  } catch {
    return secret;
  }
}

function normalizeSecret(secret: string): string {
  return decodeSecret(secret)
    .trim()
    .toUpperCase()
    .replace(/[\s=-]/g, "");
}

export function SecretCodeView({ secretFromPath }: SecretCodeViewProps) {
  const t = useTranslations("live");
  const tPath = useTranslations("live.pathMode");
  const tCommon = useTranslations("common");
  const { toast } = useToast();

  const normalizedSecret = useMemo(
    () => normalizeSecret(secretFromPath),
    [secretFromPath],
  );
  const isValidSecret = useMemo(
    () => /^[A-Z2-7]+$/.test(normalizedSecret),
    [normalizedSecret],
  );

  const [code, setCode] = useState("");
  const [expiresIn, setExpiresIn] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const requestCode = useCallback(
    async (silent = false) => {
      if (!normalizedSecret) {
        setCode("");
        setError(tPath("invalidSecret"));
        setIsLoading(false);
        return;
      }

      if (!isValidSecret) {
        setCode("");
        setError(tPath("invalidSecret"));
        setIsLoading(false);
        return;
      }

      if (!silent) {
        setIsLoading(true);
      }

      try {
        const response = await fetch("/api/v1/totp/generate", {
          method: "post",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            secret: normalizedSecret,
          }),
        });

        const payload = (await response.json()) as TotpGenerateResponse;
        if (!response.ok || payload.error || !payload.data) {
          throw new Error(payload.error?.message || tCommon("error"));
        }

        setCode(payload.data.code);
        setExpiresIn(payload.data.expiresIn);
        setError(null);
      } catch (requestError) {
        setCode("");
        setError(
          requestError instanceof Error ? requestError.message : tCommon("error"),
        );
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [isValidSecret, normalizedSecret, tCommon, tPath],
  );

  useEffect(() => {
    void requestCode();
  }, [requestCode]);

  useEffect(() => {
    if (isLoading || error || !code) {
      return;
    }

    const timer = setInterval(() => {
      setExpiresIn((previous) => {
        if (previous <= 1) {
          void requestCode(true);
          return previous;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [code, error, isLoading, requestCode]);

  const handleCopy = useCallback(async () => {
    if (!code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: t("copied"),
        description: t("copy"),
      });
    } catch {
      toast({
        title: tCommon("error"),
        description: tCommon("copyError"),
        variant: "destructive",
      });
    }
  }, [code, t, tCommon, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto animate-fade-in">
          <Card className="mb-6 bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {tPath("title")}
              </h1>
              <CardDescription className="text-gray-300 text-base">
                {tPath("description")}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 space-y-6">
              <div>
                <Label htmlFor="path-secret" className="text-gray-300">
                  {tPath("secretFromPath")}
                </Label>
                <Input
                  id="path-secret"
                  value={normalizedSecret}
                  readOnly
                  className="mt-2 bg-gray-900 border-gray-700 text-gray-200"
                />
              </div>

              <div className="text-center space-y-3">
                {isLoading ? (
                  <p className="text-gray-300">{tCommon("loading")}</p>
                ) : error ? (
                  <Alert variant="destructive" className="text-left">
                    <AlertTitle>{tCommon("error")}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <p className="font-mono text-5xl md:text-6xl font-bold text-white tracking-widest">
                      {code}
                    </p>
                    <p className="text-sm text-gray-400">
                      {t("expiresInSeconds", { seconds: expiresIn })}
                    </p>
                  </>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleCopy} disabled={!code} className="flex-1">
                  {t("copy")}
                </Button>
                <Button
                  onClick={() => {
                    void requestCode();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  {t("generate")}
                </Button>
                <Button asChild variant="ghost" className="flex-1">
                  <Link href="/">{tPath("openHome")}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
