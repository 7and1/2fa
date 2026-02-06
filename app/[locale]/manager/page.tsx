"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VaultUnlock } from "@/components/vault/vault-unlock";
import { TotpBoard } from "@/components/vault/totp-board";
import { AddAccountDialog } from "@/components/vault/add-account-dialog";
import { BackupManager } from "@/components/vault/backup-manager";
import { useVault } from "@/hooks/use-vault";
import { VaultService } from "@/lib/core/vault";

export default function ManagerPage() {
  const t = useTranslations("manager");

  const vault = useVault();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [hasExistingVault, setHasExistingVault] = useState(false);

  // Check if vault exists
  useEffect(() => {
    if (typeof window !== "undefined") {
      const vaultService = new VaultService();
      setHasExistingVault(vaultService.hasData());
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* H1 SEO Title - Always Visible */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2">
            {t("h1")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {t("subtitle")}
          </p>
        </div>

        {!vault.isUnlocked ? (
          // Unlock Screen
          <VaultUnlock
            onUnlock={vault.unlock}
            isLoading={vault.isLoading}
            error={vault.error}
            hasExistingVault={hasExistingVault}
          />
        ) : (
          // Unlocked State
          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            {/* Page Header with Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t("title")}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t("description")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBackupDialog(true)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  {t("backupRestore")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => vault.lock()}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  {t("lock")}
                </Button>
              </div>
            </div>

            {/* Stats and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {vault.stats.count}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {t("stats.totalAccounts")}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
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
                    </div>
                    <div>
                      <div className="text-xs text-green-400 font-semibold">
                        {t("stats.unlocked")}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {t("stats.vaultSecured")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                {t("addAccount")}
              </Button>
            </div>

            {/* TOTP Codes Board */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  {t("board.title")}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {t("board.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TotpBoard
                  codes={vault.codes}
                  onDelete={vault.removeEntry}
                  showDelete={true}
                />
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-blue-400 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {t("securityInfo.title")}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {t("securityInfo.description")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Educational Content Section - Always Visible */}
        <div className="max-w-7xl mx-auto mt-8">
          <Card className="dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">
                {t("title")}: {t("content.mainTitle")}
              </CardTitle>
              <CardDescription className="text-base text-gray-600 dark:text-gray-300">
                {t("content.mainSubtitle")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 text-gray-700 dark:text-gray-300">
                <p className="text-lg leading-relaxed">{t("content.intro")}</p>

                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {t("content.securityScience.title")}
                  </h3>
                  <p className="mb-4">{t("content.securityScience.intro")}</p>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li>
                      <strong className="text-gray-900 dark:text-white">
                        {t("content.securityScience.aes")}
                      </strong>{" "}
                      {t("content.securityScience.aesDesc")}
                    </li>
                    <li>
                      <strong className="text-gray-900 dark:text-white">
                        {t("content.securityScience.pbkdf2")}
                      </strong>{" "}
                      {t("content.securityScience.pbkdf2Desc")}
                    </li>
                    <li>
                      <strong className="text-gray-900 dark:text-white">
                        {t("content.securityScience.clientSide")}
                      </strong>{" "}
                      {t("content.securityScience.clientSideDesc")}
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {t("content.stats.title")}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800/50 p-4 rounded border border-gray-200 dark:border-gray-700">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {t("content.stats.stat1")}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t("content.stats.stat1Desc")}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800/50 p-4 rounded border border-gray-200 dark:border-gray-700">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {t("content.stats.stat2")}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t("content.stats.stat2Desc")}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800/50 p-4 rounded border border-gray-200 dark:border-gray-700">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {t("content.stats.stat3")}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t("content.stats.stat3Desc")}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800/50 p-4 rounded border border-gray-200 dark:border-gray-700">
                      <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                        {t("content.stats.stat4")}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t("content.stats.stat4Desc")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {t("content.whyManager.title")}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {t("content.whyManager.feature1Title")}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t("content.whyManager.feature1Desc")}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {t("content.whyManager.feature2Title")}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t("content.whyManager.feature2Desc")}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {t("content.whyManager.feature3Title")}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t("content.whyManager.feature3Desc")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {t("content.threats.title")}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🎣</span>
                      <div>
                        <strong className="text-gray-900 dark:text-white">
                          {t("content.threats.phishing")}
                        </strong>
                        <span className="text-gray-600 dark:text-gray-400">
                          {" "}
                          {t("content.threats.phishingDesc")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🤖</span>
                      <div>
                        <strong className="text-gray-900 dark:text-white">
                          {t("content.threats.stuffing")}
                        </strong>
                        <span className="text-gray-600 dark:text-gray-400">
                          {" "}
                          {t("content.threats.stuffingDesc")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">📱</span>
                      <div>
                        <strong className="text-gray-900 dark:text-white">
                          {t("content.threats.sim")}
                        </strong>
                        <span className="text-gray-600 dark:text-gray-400">
                          {" "}
                          {t("content.threats.simDesc")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {t("content.bottomLine.title")}
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-200 mb-4">
                    {t("content.bottomLine.description")}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      {t("content.bottomLine.cost")}{" "}
                      <strong className="text-green-700 dark:text-green-400">
                        {t("content.bottomLine.costValue")}
                      </strong>
                    </div>
                    <div>
                      {t("content.bottomLine.setup")}{" "}
                      <strong className="text-blue-700 dark:text-blue-400">
                        {t("content.bottomLine.setupValue")}
                      </strong>
                    </div>
                    <div>
                      {t("content.bottomLine.protection")}{" "}
                      <strong className="text-purple-700 dark:text-purple-400">
                        {t("content.bottomLine.protectionValue")}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <p className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {t("content.sources.title")}
                  </p>
                  <p>{t("content.sources.description")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Account Dialog */}
      <AddAccountDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={vault.addEntry}
      />

      {/* Backup Manager Dialog */}
      <BackupManager
        open={showBackupDialog}
        onOpenChange={setShowBackupDialog}
        onExport={vault.exportBackup}
        onImport={vault.restoreBackup}
        accountCount={vault.stats.count}
      />
    </div>
  );
}
