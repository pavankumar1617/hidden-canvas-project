
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, Eye, FileImage } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="py-20 md:py-32 container">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h1 className="font-bold tracking-tighter">
              Hide Secret Messages in Plain Sight
            </h1>
            <p className="text-xl text-muted-foreground">
              Stegano uses advanced steganography to embed your private messages 
              into ordinary images, audio, and video files.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" onClick={() => navigate("/encrypt")}>
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/about")}>
                Learn More
              </Button>
            </div>
          </div>
          <div className="flex-1 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
            <div className="aspect-video rounded-lg bg-card shadow-lg flex items-center justify-center p-6">
              <Lock className="h-20 w-20 text-primary opacity-50" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-semibold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Using steganography, we can hide information within digital files 
              in a way that prevents detection. Here's how you can use our platform:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Hide Your Data",
                description: "Upload an image and enter your secret message with a password.",
                icon: FileImage,
                link: "/encrypt",
              },
              {
                title: "Share Securely",
                description: "Share the image normally - it looks unchanged to the naked eye.",
                icon: Lock,
                link: "/about",
              },
              {
                title: "Reveal When Needed",
                description: "Recipients can extract your message using the password.",
                icon: Eye,
                link: "/decrypt",
              },
            ].map((feature, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center p-8 rounded-xl bg-card border border-border shadow-sm hover:shadow transition-shadow"
              >
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                <p className="text-center text-muted-foreground mb-6">
                  {feature.description}
                </p>
                <Button variant="link" className="mt-auto" onClick={() => navigate(feature.link)}>
                  Learn More <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="container py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="font-semibold">Ready to hide your secrets?</h2>
          <p className="text-muted-foreground">
            Start encrypting your private messages with our easy-to-use platform. 
            No technical knowledge required.
          </p>
          <div className="pt-4">
            <Button size="lg" onClick={() => navigate("/encrypt")}>
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
