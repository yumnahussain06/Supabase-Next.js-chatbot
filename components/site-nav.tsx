import Link from "next/link";
import { Suspense } from "react";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";

export function SiteNav() {
  return (
    <nav className="w-full flex justify-center border-b border-[#2A2E38] h-16">
      <div className="w-full max-w-5xl flex justify-between items-center px-5 text-sm">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] font-medium text-base"
        >
          Ledger
        </Link>

        <div className="flex items-center gap-4">
          {!hasEnvVars ? (
            <EnvVarWarning />
          ) : (
            <Suspense>
              <AuthButton />
            </Suspense>
          )}
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
}