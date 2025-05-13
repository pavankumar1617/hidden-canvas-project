
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/FileUpload";
import { PasswordInput } from "@/components/PasswordInput";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, ArrowRight, Share2, Link } from "lucide-react";
import { 
  fileToArrayBuffer, 
  hideMessage, 
  arrayBufferToFile, 
  downloadFile,
  uploadToSupabase,
  generateUniqueFileName
} from "@/lib/steganography";
import { toast } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function EncryptPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    // Reset states when new file is selected
    setProcessedFile(null);
    setPublicUrl(null);
  };
  
  const handleEncrypt = async () => {
    if (!file) {
      toast.error("Please upload a file");
      return;
    }
    
    if (!message) {
      toast.error("Please enter a secret message");
      return;
    }
    
    if (!password) {
      toast.error("Please enter a password");
      return;
    }
    
    setLoading(true);
    
    try {
      // Read the file as an array buffer
      const arrayBuffer = await fileToArrayBuffer(file);
      const imageData = new Uint8Array(arrayBuffer);
      
      // Hide the message in the image
      const resultData = await hideMessage({
        imageData,
        message,
        password,
      });
      
      // Create a new file with the modified data
      const fileName = generateUniqueFileName(file.name);
      const resultFile = arrayBufferToFile(resultData.buffer, fileName, file.type);
      
      // Store the processed file
      setProcessedFile(resultFile);
      
      // Download the file
      downloadFile(resultFile);
      
      toast.success("Your message has been hidden successfully!");
    } catch (error) {
      console.error("Encryption failed:", error);
      toast.error("Failed to hide your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleShareFile = async () => {
    if (!processedFile) {
      toast.error("Please encrypt a message first");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload to Supabase storage
      const url = await uploadToSupabase(processedFile);
      setPublicUrl(url);
      toast.success("File uploaded and ready to share!");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload file for sharing. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };
  
  const copyShareLink = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      toast.success("Share link copied to clipboard!");
    }
  };
  
  const handleShare = async () => {
    if (publicUrl) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Hidden Message",
            text: "I've shared a hidden message with you",
            url: publicUrl
          });
          toast.success("Shared successfully!");
        } catch (error) {
          console.error("Sharing failed:", error);
          copyShareLink();
        }
      } else {
        copyShareLink();
      }
    }
  };
  
  return (
    <div className="container py-12 max-w-4xl">
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Hide Your Secret Message</h1>
        <p className="text-muted-foreground">
          Encrypt your message inside an image file using steganography.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Hide Data</CardTitle>
          <CardDescription>
            Upload an image, enter your message, and secure it with a password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload Image</Label>
            <FileUpload 
              onFileSelected={handleFileSelected} 
              accept="image/*"
              label="Upload an image file"
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: JPG, PNG, GIF, WEBP (max 5MB)
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Secret Message</Label>
            <Textarea 
              id="message"
              placeholder="Enter the secret message you want to hide"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Encryption Password</Label>
            <PasswordInput
              value={password}
              onChange={setPassword}
              showStrength={true}
              placeholder="Create a strong password"
            />
            <p className="text-xs text-muted-foreground">
              You'll need this password to reveal the message later.
            </p>
          </div>

          {processedFile && (
            <div className="rounded-md bg-muted p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">File processed successfully</h4>
                  <p className="text-sm text-muted-foreground">{processedFile.name}</p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadFile(processedFile)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleShareFile}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading
                          </>
                        ) : (
                          <>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Share Your Encrypted File</DialogTitle>
                        <DialogDescription>
                          Copy the link below or use the share button to share your encrypted file.
                        </DialogDescription>
                      </DialogHeader>
                      {publicUrl ? (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Input 
                              value={publicUrl} 
                              readOnly 
                              className="flex-1"
                            />
                            <Button 
                              variant="outline" 
                              onClick={copyShareLink}
                              type="button"
                            >
                              <Link className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex justify-between">
                            <DialogClose asChild>
                              <Button variant="outline">Close</Button>
                            </DialogClose>
                            <Button onClick={handleShare}>
                              Share Now
                              <Share2 className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center p-6">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          <p className="ml-2">Preparing share link...</p>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
          <Button 
            onClick={handleEncrypt} 
            disabled={!file || !message || !password || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              <>
                Encrypt & Download
                <Download className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-12 text-center">
        <p className="mb-4 text-muted-foreground">
          Need to reveal a hidden message instead?
        </p>
        <Button variant="link" asChild>
          <a href="/decrypt">
            Go to Reveal Data
            <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
