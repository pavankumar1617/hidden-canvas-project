
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const [signupSuccess, setSignupSuccess] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, user } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to home page
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const toggleView = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setMobileNumber("");
    setSignupSuccess(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setLoading(true);

    try {
      // Validate mobile number if provided
      if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
        toast.error("Please enter a valid 10-digit mobile number");
        setLoading(false);
        return;
      }

      if (isLogin) {
        // Login flow
        await signIn(email, password);
      } else {
        // Registration flow
        await signUp(email, password);
        
        // If signup was successful, show success state
        setSignupSuccess(true);
        
        // Only record login attempt if signup was successful
        const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
        
        try {
          const { error: loginRecordError } = await supabase
            .from('logins')
            .insert({
              email: email,
              'mobile number': mobileNumber ? Number(mobileNumber) : null,
              date: currentDate
            });

          if (loginRecordError) {
            console.error("Error recording login attempt:", loginRecordError);
            // Continue even if recording fails
          }
        } catch (error) {
          console.error("Error recording login data:", error);
          // Don't show this error to the user as it's not critical
        }
      }
    } catch (error) {
      // Errors are already handled in the Auth context
      console.error("Authentication handling error:", error);
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

  // Show success message after signup
  if (signupSuccess && !isLogin) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Check Your Email
            </h1>
          </div>

          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle>Registration Successful!</CardTitle>
              <CardDescription>
                We've sent a verification email to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  Please check your email and click the verification link to complete your account setup. 
                  You'll need to verify your email before you can access the steganography features.
                </AlertDescription>
              </Alert>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSignupSuccess(false);
                  setIsLogin(true);
                }}
              >
                Back to Login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

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
              
              {!isLogin && (
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
              )}
              
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

              {!isLogin && (
                <Alert>
                  <AlertDescription>
                    You'll receive a verification email after registration. Please check your inbox and click the verification link to complete your account setup.
                  </AlertDescription>
                </Alert>
              )}
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
