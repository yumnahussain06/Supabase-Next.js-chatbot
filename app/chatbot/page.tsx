import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserCredits } from "@/lib/credits";
import ChatInterface from "@/components/chat-interface";

export const instant = false;

export default async function ChatbotPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const initialCredits = await getUserCredits(user.id);

  return (
    <div className="flex-1 w-full flex flex-col gap-6 max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold">Chatbot</h1>
      <ChatInterface initialCredits={initialCredits} />
    </div>
  );
}