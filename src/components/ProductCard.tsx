import { Button } from "@/components/ui/button";
import { ExternalLink, LucideIcon } from "lucide-react";

interface ProductCardProps {
  title: string;
  description: string;
  features: string[];
  url: string;
  icon: LucideIcon;
  gradient: string;
}

const ProductCard = ({ title, description, features, url, icon: Icon, gradient }: ProductCardProps) => {
  return (
    <div className="group relative glass-card rounded-3xl p-8 hover:scale-[1.02] transition-all duration-300 animate-slide-up">
      <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300`} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className={`p-3 rounded-2xl ${gradient} bg-opacity-10`}>
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => window.open(url, '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
        
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        
        <div className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>
        
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
          onClick={() => window.open(url, '_blank')}
        >
          Launch App
          <ExternalLink className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
