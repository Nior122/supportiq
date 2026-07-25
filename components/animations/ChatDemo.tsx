"use client";

import React, { useEffect, useState, useRef } from "react";
import anime from "animejs";
import { User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const DEMO_CONVO: ChatMessage[] = [
  { id: 1, role: "user", content: "Can I upgrade my plan?" },
  { id: 2, role: "assistant", content: "Yes! You can upgrade to our Pro or Enterprise plans anytime from your billing settings." },
  { id: 3, role: "user", content: "Does it support multilingual chat?" },
  { id: 4, role: "assistant", content: "SupportIQ automatically detects over 90 languages and responds with native-level proficiency." },
];

export function ChatDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let step = 0;

    const playStep = () => {
      if (step >= DEMO_CONVO.length) {
        timeoutId = setTimeout(() => {
          setMessages([]);
          step = 0;
          playStep();
        }, 5000);
        return;
      }

      const msg = DEMO_CONVO[step];
      if (!msg) return;
      
      if (msg.role === "assistant") {
        setIsTyping(true);
        timeoutId = setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, msg]);
          step++;
          timeoutId = setTimeout(playStep, 3000);
        }, 1500);
      } else {
        setMessages(prev => [...prev, msg]);
        step++;
        timeoutId = setTimeout(playStep, 2000);
      }
    };

    playStep();

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      
      anime({
        targets: ".demo-message:last-child",
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        easing: "easeOutQuad",
      });
    }
  }, [messages, isTyping]);

  return (
    <div className="w-full max-w-md h-[400px] border border-white/10 bg-card/50 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col group transition-all hover:border-primary/30">
      {/* Header */}
      <div className="p-5 border-b border-white/5 bg-white/5 flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
           Live_Preview // Neural_Sync
        </span>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth no-scrollbar"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "demo-message flex gap-3",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={cn(
              "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-glow",
              msg.role === "assistant" ? "bg-ai-gradient" : "bg-white/5"
            )}>
              {msg.role === "assistant" ? <Bot className="h-4 w-4 text-white" /> : <User className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div className={cn(
              "px-4 py-2.5 rounded-2xl text-sm max-w-[80%] shadow-sm border",
              msg.role === "user" 
                ? "bg-primary text-white border-primary/20 rounded-tr-none" 
                : "bg-white/5 text-foreground border-white/5 rounded-tl-none"
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3 animate-fade-in">
             <div className="h-8 w-8 rounded-xl bg-ai-gradient flex items-center justify-center shadow-glow">
                <Bot className="h-4 w-4 text-white" />
             </div>
             <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/5 rounded-tl-none flex gap-1 items-center">
                {[0, 150, 300].map(d => (
                  <div key={d} className="h-1 w-1 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
             </div>
          </div>
        )}
      </div>

      {/* Input Placeholder */}
      <div className="p-4 border-t border-white/5 bg-white/5">
        <div className="h-10 w-full rounded-xl bg-white/5 border border-white/10 px-4 flex items-center">
           <div className="h-1 w-12 bg-white/10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
