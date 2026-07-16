"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Send,
  User,
  FileText,
  Mail,
  Briefcase,
  TrendingUp,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestedPrompts = [
  { icon: FileText, text: "Analyze this job description", color: "text-blue-500" },
  { icon: Mail, text: "Generate a cold email for Google", color: "text-violet-500" },
  { icon: TrendingUp, text: "How can I improve my resume?", color: "text-emerald-500" },
  { icon: Briefcase, text: "Should I apply to this role?", color: "text-amber-500" },
];

const demoConversation: Message[] = [
  {
    id: "1",
    role: "user",
    content: "Can you help me write a cold email to a recruiter at Stripe?",
    timestamp: new Date(),
  },
  {
    id: "2",
    role: "assistant",
    content: `Of course! Here's a professional cold email for a Stripe recruiter:

**Subject:** Experienced Full-Stack Engineer — Passionate About Stripe's Mission

Hi [Recruiter Name],

I hope this message finds you well. I'm a full-stack engineer with 4+ years of experience building scalable web applications, and I've been following Stripe's work on payment infrastructure with great interest.

I'm particularly impressed by Stripe's recent launch of Stripe Connect improvements and the emphasis on developer experience. My background in React, Node.js, and PostgreSQL aligns well with your engineering stack, and I've built payment processing systems that handle 100K+ transactions daily.

I'd love to explore how my skills could contribute to Stripe's mission of increasing the GDP of the internet. Would you be open to a brief chat?

Best regards,
[Your Name]

---

*Would you like me to:*
- Create a shorter version?
- Adjust the tone?
- Generate a LinkedIn message variant?`,
    timestamp: new Date(),
  },
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>(demoConversation);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'd be happy to help with that! Let me analyze your request and provide a detailed response. In production, this would be powered by OpenAI's GPT-4o model, providing real-time career assistance, email generation, resume optimization, and job analysis.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <PageHeader
        title="AI Assistant"
        description="Your intelligent career companion"
      />

      <Card className="flex flex-1 flex-col overflow-hidden">
        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-1 text-lg font-semibold">
                How can I help you today?
              </h3>
              <p className="mb-8 text-sm text-muted-foreground">
                Ask me anything about your job search
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-lg">
                {suggestedPrompts.map((prompt, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto justify-start gap-3 p-3 text-left"
                    onClick={() => setInput(prompt.text)}
                  >
                    <prompt.icon className={cn("h-4 w-4 shrink-0", prompt.color)} />
                    <span className="text-xs">{prompt.text}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "justify-end" : ""
                  )}
                >
                  {msg.role === "assistant" && (
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-[10px] text-white">
                        AI
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3.5 py-2.5 text-sm",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                  {msg.role === "user" && (
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="text-[10px]">
                        <User className="h-3.5 w-3.5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-[10px] text-white">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg bg-muted px-4 py-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="Ask anything about your job search..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="shrink-0 bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Nova can make mistakes. Verify important information.
          </p>
        </div>
      </Card>
    </div>
  );
}
