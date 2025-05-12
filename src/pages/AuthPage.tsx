
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, user } = useAuth();

  // If user is already logged in, redirect to home page
  if (user) {
    navigate("/");
    return null;
  }

  const toggleView = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setMobileNumber("");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate mobile number if provided
      if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
        toast.error("Please enter a valid 10-digit mobile number");
        setLoading(false);
        return;
      }

      // Record login attempt in logins table
      const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

      const { error: loginRecordError } = await supabase
        .from('logins')
        .insert({
          email: email,
          'mobile number': mobileNumber ? Number(mobileNumber) : null,
          date: currentDate
        });

      if (loginRecordError) {
        console.error("Error recording login attempt:", loginRecordError);
        // Continue with auth flow even if recording fails
      }

      if (isLogin) {
        await signIn(email, password);
        toast.success("Login successful!");
      } else {
        await signUp(email, password);
        toast.success("Account created successfully! Please check your email for verification.");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error(error instanceof Error ? error.message : "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      toast.success("Password reset link sent to your email");
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Steganography
          </h1>
          <p className="text-muted-foreground mt-2">
            {isLogin ? "Sign in to access your account" : "Create an account to get started"}
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>{isLogin ? "Login" : "Sign Up"}</CardTitle>
            <CardDescription>
              {isLogin 
                ? "Enter your credentials to access your account" 
                : "Fill in your details to create your account"}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleAuth}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number (optional)</Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {isLogin && (
                    <Button
                      variant="link"
                      className="p-0 h-auto text-xs"
                      type="button"
                      onClick={handleForgotPassword}
                    >
                      Forgot Password?
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Logging in..." : "Signing up..."}
                  </div>
                ) : (
                  isLogin ? "Login" : "Sign Up"
                )}
              </Button>
              
              <div className="text-center text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                {" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  type="button"
                  onClick={toggleView}
                >
                  {isLogin ? "Sign Up" : "Login"}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
