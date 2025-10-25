import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Image as ImageIcon, Sparkles } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import ImageGenerator from "@/components/ImageGenerator";
import heroBg from "@/assets/hero-bg.jpg";
import rumpiAvatar from "@/assets/rumpi-avatar.png";

const Index = () => {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-border">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <img 
              src={rumpiAvatar} 
              alt="Rumpi AI" 
              className="w-16 h-16 rounded-full shadow-lg"
            />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Rumpi AI
              </h1>
              <p className="text-muted-foreground mt-1">
                AI Assistant yang Powerful & Gratis Selamanya
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Chat AI
            </TabsTrigger>
            <TabsTrigger value="image" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Buat Gambar
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 border border-border rounded-2xl overflow-hidden bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
            <TabsContent value="chat" className="h-full m-0">
              <ChatInterface />
            </TabsContent>
            
            <TabsContent value="image" className="h-full m-0">
              <ImageGenerator />
            </TabsContent>
          </div>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Dibuat dengan Rumpi AI - Gratis Selamanya</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
