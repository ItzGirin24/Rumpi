import { Sparkles } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/Rumpi Transparant.webp"
              alt="Rumpi Logo"
              className="w-10 h-10"
            />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Rumpi
              </h1>
              <p className="text-xs text-muted-foreground">AI Design Generator</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-green-400 font-medium">
              ✨ Unlimited & Free Forever
            </span>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Powered by Rumpi
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
