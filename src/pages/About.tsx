import { Github, Mail, MapPin, Calendar, Sparkles, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About <span className="gradient-text">Rumpi</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Learn more about the creator behind Rumpi Entertainment and our mission to provide free unlimited AI tools for everyone.
          </p>
        </div>
      </section>

      {/* Creator Info Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-3xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20">
                <img
                  src="/Logo Girin.webp"
                  alt="Girin Logo"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold mb-4">Girin</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Full-stack developer passionate about AI and creating accessible technology for everyone.
                  Founder of Rumpi Entertainment, dedicated to building free, unlimited AI-powered tools.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Indonesia</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Started 2024</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Github className="w-4 h-4" />
                    <span>@ItzGirin24</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => window.open('https://github.com/ItzGirin24', '_blank')}
                  >
                    <Github className="w-4 h-4 mr-2" />
                    GitHub Profile
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/contact'}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Me
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Mission</h2>
            <p className="text-xl text-muted-foreground">
              Democratizing AI access for everyone, everywhere.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Free & Unlimited</h3>
              <p className="text-muted-foreground">
                All our AI tools are completely free with no usage limits or hidden costs.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community First</h3>
              <p className="text-muted-foreground">
                Built by the community, for the community. Open source and transparent.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cutting Edge</h3>
              <p className="text-muted-foreground">
                Leveraging the latest AI technologies to provide powerful, innovative tools.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
