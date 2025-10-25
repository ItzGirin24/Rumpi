import { cn } from "@/lib/utils";
import rumpiAvatar from "@/assets/rumpi-avatar.png";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

const ChatMessage = ({ role, content, isStreaming }: ChatMessageProps) => {
  const isAssistant = role === "assistant";

  return (
    <div className={cn(
      "flex gap-4 p-4 rounded-2xl mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500",
      isAssistant ? "bg-card" : "bg-muted/50"
    )}>
      {isAssistant && (
        <img 
          src={rumpiAvatar} 
          alt="Rumpi" 
          className="w-10 h-10 rounded-full flex-shrink-0"
        />
      )}
      <div className="flex-1 space-y-2">
        <div className="font-semibold text-sm">
          {isAssistant ? "Rumpi" : "Kamu"}
        </div>
        <div className="text-foreground/90 whitespace-pre-wrap">
          {content}
          {isStreaming && (
            <span className="inline-block w-1 h-4 ml-1 bg-primary animate-pulse" />
          )}
        </div>
      </div>
      {!isAssistant && (
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-xl">👤</span>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
