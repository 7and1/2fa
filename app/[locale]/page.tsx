'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateTOTP, getTimeWindow } from '@/lib/core/totp';
import jsQR from 'jsqr';

export default function HomePage() {
  const t = useTranslations('live');
  const navT = useTranslations('nav');
  const tCommon = useTranslations('common');
  const { toast } = useToast();

  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [expiresIn, setExpiresIn] = useState(30);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-refresh code every second
  useEffect(() => {
    if (!secret) return;

    const generateCode = async () => {
      try {
        const generatedCode = await generateTOTP(secret);
        const { expiresIn: expires } = getTimeWindow();
        setCode(generatedCode);
        setExpiresIn(expires);
        setError('');
      } catch (err) {
        setError((err as Error).message);
        setCode('');
      }
    };

    generateCode();
    const interval = setInterval(generateCode, 1000);

    return () => clearInterval(interval);
  }, [secret]);

  const handleCopy = async () => {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: t('copied'),
        description: t('copy'),
      });
    } catch {
      toast({
        title: tCommon('error'),
        description: tCommon('copyError'),
        variant: 'destructive',
      });
    }
  };

  const handleSecretChange = (value: string) => {
    // Remove spaces and convert to uppercase
    const cleaned = value.replace(/\s/g, '').toUpperCase();
    setSecret(cleaned);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const loadExample = () => {
    // Example secret from RFC 6238 test vector
    handleSecretChange(t('demoSecret'));
    toast({
      title: t('exampleLoaded.title'),
      description: t('exampleLoaded.description'),
    });
  };

  const parseOtpauthURI = (uri: string): string => {
    try {
      const url = new URL(uri);
      if (url.protocol !== 'otpauth:') {
        throw new Error('Invalid otpauth:// URI');
      }
      const secret = url.searchParams.get('secret');
      if (!secret) {
        throw new Error('No secret found in URI');
      }
      return secret;
    } catch {
      throw new Error('Failed to parse otpauth:// URI');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast({
        title: tCommon('processing'),
        description: t('qr.processing.description'),
      });

      // Read file as image
      const imageData = await new Promise<ImageData>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Failed to get canvas context'));
              return;
            }
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            resolve(imageData);
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = event.target?.result as string;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      // Scan QR code
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

      if (!qrCode) {
        throw new Error('No QR code found in image');
      }

      const data = qrCode.data;

      // Check if it's an otpauth:// URI
      if (data.startsWith('otpauth://')) {
        const extractedSecret = parseOtpauthURI(data);
        handleSecretChange(extractedSecret);
        toast({
          title: tCommon('success'),
          description: t('qr.success.scanned'),
        });
      } else {
        // Assume it's a raw secret
        handleSecretChange(data);
        toast({
          title: tCommon('success'),
          description: t('qr.success.extracted'),
        });
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      toast({
        title: tCommon('error'),
        description: err instanceof Error ? err.message : t('qr.errors.scanFailed'),
        variant: 'destructive',
      });
    }
  };

  // Calculate progress percentage
  const progress = (expiresIn / 30) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto animate-fade-in">
          {/* H1 + Description Combined */}
          <Card className="mb-6 bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                2FA Live Auth - Real-Time TOTP Authentication
              </h1>
              <CardDescription className="text-gray-300 text-base">
                {t('description')}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Secret Input */}
          <Card className="mb-6 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">{t('secretLabel')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
<div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="secret" className="text-gray-300">
                      {t('secretLabel')}
                    </Label>
                    {!secret && (
                      <button
                        onClick={loadExample}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
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
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        {t('tryExample')}
                      </button>
                    )}
                    {secret && (
                      <button
                        onClick={() => handleSecretChange('')}
                        className="text-xs text-gray-400 hover:text-gray-300 flex items-center gap-1"
                      >
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="secret"
                      type="text"
                      placeholder={t('secretPlaceholder')}
                      value={secret}
                      onChange={(e) => handleSecretChange(e.target.value)}
                      className="flex-1 bg-gray-900 border-gray-600 text-white placeholder:text-gray-500 font-mono"
                    />
                    <Button
                      onClick={handleUploadClick}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      title="Upload QR Code"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {t('secretHelper')}
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-900/20 border border-red-800 rounded text-red-400 text-sm">
                    {error}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* TOTP Code Display */}
          {code && (
            <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700 animate-fade-in hover:shadow-2xl hover:shadow-blue-900/30 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="text-center">
                  {/* Code */}
                  <div className="mb-4">
                    <div className="text-6xl font-mono font-bold text-white tracking-wider mb-2">
                      {code.slice(0, 3)} {code.slice(3)}
                    </div>
                    <div className="text-sm text-blue-300">
                      Expires in {expiresIn}s
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${
                          expiresIn < 5 ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Copy Button */}
                  <Button
                    onClick={handleCopy}
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {t('copy')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!secret && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⚡</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {t('emptyTitle')}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {t('emptyDescription')}
                  </p>
                  <Button
                    onClick={loadExample}
                    variant="outline"
                    className="border-blue-500 text-blue-400 hover:bg-blue-900/20"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    {t('tryDemoExample')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              ⚠️ {t('warningNoSave')}
            </p>
            <p className="mt-2">
              {t('wantToSave')}{' '}
              <Link href="/manager" className="text-blue-400 hover:text-blue-300">
                {navT('manager')} →
              </Link>
            </p>
          </div>

          {/* Educational Content Section */}
          <Card className="mt-6 bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-2xl">
                {t('title')}: Your Instant Security Shield
              </CardTitle>
              <CardDescription className="text-gray-300 text-base">
                Why your password alone is like leaving your front door wide open
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <div className="text-gray-300 space-y-6">
                <p className="text-lg leading-relaxed">
                  Here&apos;s the thing about passwords - they&apos;re basically useless in 2024. I&apos;m not being dramatic.
                  Let me show you the numbers that should scare you, then I&apos;ll show you how to fix it in literally 10 seconds.
                </p>

                <div className="bg-red-900/20 p-6 rounded-lg border border-red-800">
                  <h3 className="text-xl font-bold text-white mb-4">⚠️ The Brutal Reality (2024 Data)</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 p-4 rounded">
                      <div className="text-3xl font-bold text-red-400">99.9%</div>
                      <div className="text-sm text-gray-400">of automated attacks blocked by 2FA (Microsoft 2025)</div>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded">
                      <div className="text-3xl font-bold text-orange-400">24%</div>
                      <div className="text-sm text-gray-400">of consumers hit by account takeover in 2024 (Sift)</div>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded">
                      <div className="text-3xl font-bold text-yellow-400">$43B</div>
                      <div className="text-sm text-gray-400">lost to account takeovers in 2023 (AARP)</div>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded">
                      <div className="text-3xl font-bold text-green-400">80%</div>
                      <div className="text-sm text-gray-400">of breaches preventable with 2FA</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-4">🔐 How It Actually Works (Kid Version)</h3>
                  <p className="mb-4">
                    Imagine your house has a door with a regular lock. That&apos;s your password. Now imagine the lock changes
                    its combination every 30 seconds, and only you have the device that tells you the new combination. That&apos;s 2FA.
                  </p>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">1️⃣</span>
                      <div>
                        <strong className="text-white">You have a secret code</strong>
                        <p className="text-gray-400">We call it a &quot;seed&quot; or &quot;secret key&quot;</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">2️⃣</span>
                      <div>
                        <strong className="text-white">Your device does math</strong>
                        <p className="text-gray-400">With that secret + the current time</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">3️⃣</span>
                      <div>
                        <strong className="text-white">You get a 6-digit number</strong>
                        <p className="text-gray-400">That&apos;s only good for 30 seconds</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">4️⃣</span>
                      <div>
                        <strong className="text-white">Nobody else can guess it</strong>
                        <p className="text-gray-400">They&apos;d need your secret AND perfect timing</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-900/20 p-6 rounded-lg border border-blue-800">
                  <h3 className="text-xl font-bold text-white mb-4">🛡️ Real-World Protection</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Phishing Attacks: 99% Blocked</h4>
                      <p className="text-sm text-gray-400">
                        Even if you type your password into a fake website, the attacker still can&apos;t get in without
                        your 2FA code. And by the time they try to use it, it&apos;s expired. (Google Research)
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Automated Bots: 100% Blocked</h4>
                      <p className="text-sm text-gray-400">
                        Those credential-stuffing attacks where hackers try stolen passwords from other breaches?
                        100% stopped by 2FA. Remember, the average employee has 146 exposed credentials on the dark web. (SpyCloud 2024)
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Targeted Attacks: 66% Blocked</h4>
                      <p className="text-sm text-gray-400">
                        Even sophisticated targeted attacks get blocked 66% of the time with 2FA. Not perfect, but way better than 0%. (Google)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-4">🔒 The Security Science</h3>
                  <p className="mb-4">
                    Your 6-digit code comes from an algorithm called HMAC-SHA1. This is cryptographic-grade mathematics -
                    the same math that protects military communications.
                  </p>
                  <div className="bg-gray-900/50 p-4 rounded space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>1,000,000 possible combinations (000000 to 999999)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>Only 30 seconds to guess = need 33,333 guesses/second</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>Odds of guessing: <strong className="text-white">1 in 1 million</strong> every 30 seconds</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>You&apos;re more likely to get struck by lightning. Twice.</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 p-6 rounded-lg border border-green-700">
                  <h3 className="text-xl font-bold text-white mb-4">⚡ Privacy: What Happens Here</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold text-green-400 mb-2">In Your Browser:</h4>
                      <ul className="space-y-1 text-gray-300">
                        <li>✓ You paste your secret</li>
                        <li>✓ Codes generate locally (in RAM)</li>
                        <li>✓ Nothing sent to servers</li>
                        <li>✓ Zero cloud storage</li>
                        <li>✓ Zero logging</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-400 mb-2">When You Close:</h4>
                      <ul className="space-y-1 text-gray-300">
                        <li>✓ Everything disappears</li>
                        <li>✓ No cookies</li>
                        <li>✓ No local storage</li>
                        <li>✓ No database entries</li>
                        <li>✓ Like you were never here</li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-4">
                    Technical note: We use SubtleCrypto Web API - the same cryptographic engine your browser uses
                    for HTTPS connections. Banks trust it. You should too.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-6 rounded-lg border border-purple-700">
                  <h3 className="text-xl font-bold text-white mb-3">💡 The Bottom Line (No BS)</h3>
                  <div className="space-y-3">
                    <p className="text-lg text-gray-200">
                      Using Live 2FA takes <strong className="text-white">10 seconds</strong>.
                      Not using it makes you <strong className="text-white">99.9% more vulnerable</strong> to automated attacks.
                    </p>
                    <p className="text-gray-300">
                      You&apos;re gambling <strong className="text-yellow-400">$43 billion worth of risk</strong> (2023 total ATO losses)
                      every time you use just a password.
                    </p>
                    <p className="text-lg font-semibold text-white">
                      Is your password alone good enough? The data screams NO.
                    </p>
                  </div>
                </div>

                <div className="text-xs text-gray-500 pt-4 border-t border-gray-800">
                  <p className="font-semibold mb-2">Sources:</p>
                  <p>
                    Microsoft Security Report 2025, Bitwarden 2FA Survey 2024, Sift Global Network 2024,
                    Proofpoint Research 2024, AARP & Javelin Study 2024, IBM Data Breach Report 2024,
                    Google Security Blog 2024, SpyCloud Research 2024
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
