
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="container py-12 max-w-4xl">
      <div className="space-y-4 text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight">About Steganography</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The art and science of hiding messages in plain sight.
        </p>
      </div>
      
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4">What is Steganography?</h2>
          <p className="text-muted-foreground mb-4">
            Steganography is the practice of concealing a message within another message or physical object.
            In the digital world, steganography typically involves hiding information within a file, message,
            image, or video in such a way that it is not detectable to the casual observer.
          </p>
          <p className="text-muted-foreground mb-4">
            Unlike cryptography, which scrambles a message so it cannot be understood, steganography 
            hides the message so it cannot be seen. A successful steganographic technique embeds information
            without significantly changing the appearance or function of the carrier file.
          </p>
        </section>
        
        <section className="bg-secondary p-8 rounded-xl">
          <h2 className="text-2xl font-semibold mb-4">How Does It Work?</h2>
          <p className="text-muted-foreground mb-4">
            Our platform uses the Least Significant Bit (LSB) technique to embed your message within image files.
            Here's a simplified explanation:
          </p>
          
          <div className="space-y-4 mb-4">
            <div className="flex items-start gap-4">
              <div className="bg-primary/20 rounded-full p-2 mt-1">
                <span className="text-primary font-medium">1</span>
              </div>
              <div>
                <h3 className="font-medium">Converting Text to Binary</h3>
                <p className="text-muted-foreground">
                  Your secret message is converted into binary code (a series of 0s and 1s).
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-primary/20 rounded-full p-2 mt-1">
                <span className="text-primary font-medium">2</span>
              </div>
              <div>
                <h3 className="font-medium">Encrypting with Password</h3>
                <p className="text-muted-foreground">
                  The binary data is encrypted using your password, adding an extra layer of security.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-primary/20 rounded-full p-2 mt-1">
                <span className="text-primary font-medium">3</span>
              </div>
              <div>
                <h3 className="font-medium">Embedding in Image Pixels</h3>
                <p className="text-muted-foreground">
                  Each bit of your encrypted message is stored in the least significant bit of image pixel 
                  data, making changes imperceptible to the human eye.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-primary/20 rounded-full p-2 mt-1">
                <span className="text-primary font-medium">4</span>
              </div>
              <div>
                <h3 className="font-medium">Extraction Process</h3>
                <p className="text-muted-foreground">
                  To reveal the message, the process is reversed - extracting the hidden bits, 
                  combining them, and decrypting using the password.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Applications of Steganography</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-border p-6 rounded-lg">
              <h3 className="font-medium text-lg mb-2">Private Communication</h3>
              <p className="text-muted-foreground">
                Share sensitive information through seemingly innocent files, ensuring that only the 
                intended recipient knows of the hidden message's existence.
              </p>
            </div>
            
            <div className="border border-border p-6 rounded-lg">
              <h3 className="font-medium text-lg mb-2">Digital Watermarking</h3>
              <p className="text-muted-foreground">
                Artists and content creators can embed copyright information or ownership details 
                invisibly within their digital works.
              </p>
            </div>
            
            <div className="border border-border p-6 rounded-lg">
              <h3 className="font-medium text-lg mb-2">Data Integrity</h3>
              <p className="text-muted-foreground">
                Hidden checksums or verification data can be used to detect if a file has been 
                tampered with.
              </p>
            </div>
            
            <div className="border border-border p-6 rounded-lg">
              <h3 className="font-medium text-lg mb-2">Secure Storage</h3>
              <p className="text-muted-foreground">
                Store sensitive information in plain sight, providing an extra layer of security 
                beyond encryption.
              </p>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Our Approach to Steganography</h2>
          <p className="text-muted-foreground mb-6">
            At Stegano, we've built an intuitive platform that makes steganography accessible to everyone.
            Our focus is on providing a secure, easy-to-use tool that requires no technical expertise.
            We prioritize:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <path d="m21 15-5-5L5 21"></path>
                </svg>
              </div>
              <h3 className="font-medium mb-2">Visual Quality</h3>
              <p className="text-sm text-muted-foreground">
                Our algorithms preserve the visual quality of your carrier files.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3 className="font-medium mb-2">Strong Security</h3>
              <p className="text-sm text-muted-foreground">
                Password-based encryption for an additional security layer.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"></path>
                  <path d="M12 7c1.5 0 2.5.5 3 2"></path>
                </svg>
              </div>
              <h3 className="font-medium mb-2">Ease of Use</h3>
              <p className="text-sm text-muted-foreground">
                Simple interface designed for users of all technical abilities.
              </p>
            </div>
          </div>
        </section>
        
        <div className="text-center pt-6">
          <h2 className="text-2xl font-semibold mb-4">Ready to Try Steganography?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Experience the power of steganography with our easy-to-use platform. 
            Hide your messages securely or extract hidden information from files.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/encrypt">
                Hide a Message <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/decrypt">
                Reveal a Message
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
