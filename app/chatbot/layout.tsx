import { SiteNav } from "@/components/site-nav";

export default function ChatbotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center bg-[#0F1115] text-[#EDEFF3]">
      <div className="flex-1 w-full flex flex-col items-center">
        <SiteNav />
        {children}
      </div>
    </main>
  );
}