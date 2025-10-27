import ProductCard from "./ProductCard";
import { Smartphone, Wand2, MessageCircle, Sparkles } from "lucide-react";

const Products = () => {
  const products = [
    {
      title: "RumpiApps",
      description: "Transform screenshots into fully functional applications instantly",
      features: [
        "Screenshot to app conversion",
        "AI-powered design recognition",
        "Instant deployment"
      ],
      url: "https://rumpiapps.vercel.app",
      icon: Smartphone,
      gradient: "bg-gradient-to-br from-purple-500 to-pink-500"
    },
    {
      title: "RumpiAI2",
      description: "Professional AI-powered photo editing and enhancement suite",
      features: [
        "Instagram Grid Generator",
        "Background Removal",
        "Enhance 2K - 4K - 8K"
      ],
      url: "https://rumpiai2.vercel.app",
      icon: Wand2,
      gradient: "bg-gradient-to-br from-blue-500 to-purple-500"
    },
    {
      title: "RumpiChat",
      description: "Connect with anyone using just their email - no phone number needed",
      features: [
        "Google account login",
        "Email-based connections",
        "Private & secure messaging"
      ],
      url: "https://rumpichat.vercel.app",
      icon: MessageCircle,
      gradient: "bg-gradient-to-br from-green-500 to-blue-500"
    },
    {
      title: "RumpiAI",
      description: "Your personal AI assistant for conversations and image generation",
      features: [
        "Advanced AI conversations",
        "Image generation",
        "Unlimited free usage"
      ],
      url: "https://rumpiai.vercel.app",
      icon: Sparkles,
      gradient: "bg-gradient-to-br from-orange-500 to-pink-500"
    }
  ];

  return (
    <section id="products" className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Explore Our <span className="gradient-text">AI Products</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Four powerful tools, one ecosystem. All free, all unlimited.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {products.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;
