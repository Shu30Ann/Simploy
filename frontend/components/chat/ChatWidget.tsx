"use client";

import { FormEvent, useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";

type ChatMessage = {
  sender: "assistant" | "user";
  text: string;
};

type ChatWidgetProps = {
  title: string;
  assistantName: string;
  intro: string;
  placeholder: string;
  quickPrompts: string[];
};

export function ChatWidget({
  title,
  assistantName,
  intro,
  placeholder,
  quickPrompts,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "assistant",
      text: intro,
    },
  ]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();

    if (!trimmed) return;

    setMessages((current) => [
      ...current,
      { sender: "user", text: trimmed },
      {
        sender: "assistant",
        text: `Thanks for sharing that. I can help you think through "${trimmed}" and suggest a practical next step.`,
      },
    ]);
    setDraft("");
    setIsOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(draft);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {isOpen && (
        <section
          className="w-[min(calc(100vw-2.5rem),380px)] overflow-hidden rounded-lg border border-[#EAE3D3] bg-white shadow-[0_24px_70px_rgba(26,16,51,0.22)]"
          aria-label={`${title} chat`}
        >
          <div className="flex items-start justify-between gap-3 bg-[#1E2A44] px-4 py-4 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#B08A44]">
                <Bot size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold">{title}</h2>
                <p className="mt-0.5 truncate text-xs font-semibold text-white/65">{assistantName}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/75 hover:bg-white/10 hover:text-white"
              aria-label={`Close ${title} chat`}
            >
              <X size={18} />
            </button>
          </div>

          <div className="max-h-[360px] space-y-3 overflow-y-auto bg-[#F7F3EA] px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.sender}-${index}`}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[82%] rounded-lg px-3 py-2 text-sm leading-6 ${
                    message.sender === "user"
                      ? "bg-[#B08A44] text-white"
                      : "border border-[#EAE3D3] bg-white text-[#1E2A44]"
                  }`}
                >
                  {message.text}
                </p>
              </div>
            ))}

            <div className="flex flex-wrap gap-2 pt-1">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-[#DFD6BE] bg-white px-3 py-1.5 text-xs font-bold text-[#17694F] hover:border-[#B08A44] hover:text-[#B08A44]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-[#EAE3D3] bg-white p-3">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="min-h-11 flex-1 rounded-lg border border-[#DFD6C2] px-3 text-sm font-semibold text-[#1E2A44] outline-none placeholder:text-[#9CA3AF] focus:border-[#B08A44]"
              placeholder={placeholder}
            />
            <button
              type="submit"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#17694F] text-white shadow-sm"
              aria-label={`Send message to ${title}`}
            >
              <Send size={18} />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-[#B08A44] text-white shadow-[0_12px_30px_rgba(70,60,35,0.32)] transition hover:-translate-y-0.5 hover:bg-[#97742F]"
        aria-label={isOpen ? `Close ${title} chat` : `Open ${title} chat`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={25} />}
      </button>
    </div>
  );
}
