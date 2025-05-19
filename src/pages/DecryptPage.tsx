
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileUpload } from "@/components/FileUpload";
import { PasswordInput } from "@/components/PasswordInput";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowRight } from "lucide-react";
import { fileToArrayBuffer, revealMessage } from "@/lib/steganography";
import { toast } from "@/components/ui/sonner";

export default function DecryptPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [revealedMessage, setRevealedMessage] = useState<string | null>(null);
  
  const handleFileSelected = (selectedFile: File) => {
    // Check if the file is an image
    if (!selectedFile.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }
    
    setFile(selectedFile);
    setRevealedMessage(null);
  };
  
  const handleDecrypt = async () => {
    if (!file) {
      toast.error("Please upload an image file");
      return;
    }
    
    if (!password) {
      toast.error("Please enter the password");
      return;
    }
    
    setLoading(true);
    setRevealedMessage(null);
    
    try {
      // Read the file as an array buffer
      const arrayBuffer = await fileToArrayBuffer(file);
      const imageData = new Uint8Array(arrayBuffer);
      
      // Reveal the hidden message
      const message = await revealMessage({
        imageData,
        password,
      });
      
      setRevealedMessage(message);
      toast.success("Hidden message revealed successfully!");
    } catch (error) {
      console.error("Decryption failed:", error);
      if (error instanceof Error) {
        if (error.message === "Incorrect password") {
          toast.error("Incorrect password. Please try again.");
        } else if (error.message === "No steganographic data found in this image") {
          toast.error("This image doesn't contain any hidden message.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("Failed to reveal hidden message");
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopyMessage = () => {
    if (revealedMessage) {
      navigator.clipboard.writeText(revealedMessage);
      toast.success("Message copied to clipboard!");
    }
  };
  
  return (
    <div className="container py-12 max-w-4xl">
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Reveal Hidden Message</h1>
        <p className="text-muted-foreground">
          Extract secret messages from steganographic files.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Reveal Data</CardTitle>
          <CardDescription>
            Upload a file with a hidden message and enter the password to reveal it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload File</Label>
            <FileUpload 
              onFileSelected={handleFileSelected} 
              accept="image/*"
              label="Upload a file with hidden data"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Decryption Password</Label>
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="Enter the password"
            />
          </div>
          
          {revealedMessage && (
            <Alert className="mt-6">
              <AlertTitle>Hidden Message:</AlertTitle>
              <AlertDescription className="mt-2">
                <div className="bg-accent/50 p-3 rounded-md whitespace-pre-wrap break-words">
                  {revealedMessage}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopyMessage}
                  className="mt-2"
                >
                  Copy to Clipboard
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
          <Button 
            onClick={handleDecrypt} 
            disabled={!file || !password || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              "Reveal Message"
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-12 text-center">
        <p className="mb-4 text-muted-foreground">
          Want to hide a message instead?
        </p>
        <Button variant="link" asChild>
          <a href="/encrypt">
            Go to Hide Data
            <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
