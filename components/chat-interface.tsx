"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = {
  role: "user" | "bot";
  content: string;
};

export default function ChatInterface({ initialCredits }: { initialCredits: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [credits, setCredits] = useState(initialCredits);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    if (credits <= 0) {
      setError("You're out of credits.");
      return;
    }

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

            if (res.status === 401) {
        window.location.href = "/auth/login";
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "NO_CREDITS") {
          setError("You're out of credits.");
          setCredits(0);
        } else {
          setError(data.error || "Something went wrong.");
        }
        return;
      }

      setMessages((prev) => [...prev, { role: "bot", content: data.reply }]);
      setCredits(data.creditsRemaining);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">Credits remaining:</span>
        <span className={`font-semibold ${credits <= 2 ? "text-red-500" : ""}`}>
          {credits}
        </span>
      </div>

      <div className="border rounded-md h-96 overflow-y-auto p-4 flex flex-col gap-3 bg-background">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-sm text-center my-auto">
            Send a message to get started.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
              m.role === "user"
                ? "bg-primary text-primary-foreground self-end"
                : "bg-muted self-start"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="bg-muted self-start px-3 py-2 rounded-lg text-sm animate-pulse">
            Thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={credits <= 0 ? "Out of credits" : "Type a message..."}
          disabled={loading || credits <= 0}
        />
        <Button onClick={sendMessage} disabled={loading || credits <= 0}>
          Send
        </Button>
      </div>
    </div>
  );
}