import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/site-nav";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-[#0F1115] text-[#EDEFF3]">
      <div className="flex-1 w-full flex flex-col items-center">
        <SiteNav />

        <section className="w-full max-w-5xl px-5 py-24 grid md:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-6">
            <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl leading-tight">
              Every message spends a credit. Every credit is tracked.
            </h1>

            <p className="text-[#8B92A3] text-base leading-relaxed max-w-md">
              Sign up and start with 10 free credits. Ask the assistant
              anything, your balance follows you across devices, and stays
              exactly where you left it when you come back.
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                asChild
                size="lg"
                className="bg-[#F2B84B] text-[#0F1115] hover:bg-[#e0a83c]"
              >
                <Link href="/chatbot">Open the chatbot</Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-[#2A2E38] text-[#EDEFF3]"
              >
                <Link href="/auth/sign-up">Create an account</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-md border border-[#2A2E38] bg-[#171A21] p-6">
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-sm text-[#8B92A3]">Balance on New Account</span>

              <span className="font-[family-name:var(--font-mono)] text-2xl text-[#F2B84B]">
                10 credits
              </span>
            </div>

            <div className="flex flex-col gap-2 font-[family-name:var(--font-mono)] text-xs text-[#8B92A3]">
              <div className="flex justify-between border-b border-[#2A2E38] py-2">
                <span>Message sent</span>
                <span>-1</span>
              </div>

              <div className="flex justify-between border-b border-[#2A2E38] py-2">
                <span>Account created</span>
                <span className="text-[#F2B84B]">+10</span>
              </div>
            </div>
          </div>
        </section>

        <footer className="w-full flex items-center justify-center border-t border-[#2A2E38] mx-auto text-center text-xs py-10 text-[#8B92A3]">
          <p>
            Built on{" "}
            <a
              href="https://supabase.com"
              target="_blank"
              className="hover:text-[#EDEFF3] hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}