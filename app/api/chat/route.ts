import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message } = await req.json();

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const { data: newBalance, error: creditError } = await supabase.rpc(
    "decrement_credit",
    { p_user_id: user.id }
  );

  if (creditError) {
    if (creditError.message.includes("INSUFFICIENT_CREDITS")) {
      return NextResponse.json(
        { error: "Insufficient credits", code: "NO_CREDITS" },
        { status: 402 }
      );
    }
    return NextResponse.json({ error: "Failed to process credits" }, { status: 500 });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent(message);
    const reply = result.response.text();

    return NextResponse.json({ reply, creditsRemaining: newBalance });
  } catch (err) {
    console.error("Gemini API error:", err);
    return NextResponse.json({ error: "Chatbot failed to respond" }, { status: 500 });
  }
}