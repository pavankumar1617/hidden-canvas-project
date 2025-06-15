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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'mobile'>('email');
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [phoneForVerification, setPhoneForVerification] = useState("");
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, user, signUpWithPhone, verifyPhoneOtp } = useAuth();

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
    setAwaitingOtp(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      if (!email || !password) {
        toast.error("Please fill in all required fields");
        return;
      }
      setLoading(true);
      try {
        await signIn(email, password);
      } catch (error) {
        // error handled in context
      } finally {
        setLoading(false);
      }
      return;
    }

    // Signup flow
    setLoading(true);
    if (authMethod === 'email') {
      if (!email || !password) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }
      try {
        await signUp(email, password);
        setSignupSuccess(true);
        // Record login attempt
        const currentDate = new Date().toISOString().split('T')[0];
        await supabase
          .from('logins')
          .insert({ email: email, 'mobile number': null, date: currentDate });
      } catch (error) {
        // error handled in context
      } finally {
        setLoading(false);
      }
    } else { // mobile signup
      if (!mobileNumber || !password) {
        toast.error("Please provide a mobile number and password.");
        setLoading(false);
        return;
      }
      if (!/^\+[1-9]\d{1,14}$/.test(mobileNumber)) {
        toast.error("Please use E.164 format (e.g., +14155552671).");
        setLoading(false);
        return;
      }
      try {
        await signUpWithPhone(mobileNumber, password);
        setPhoneForVerification(mobileNumber);
        setAwaitingOtp(true);
      } catch (error) {
        setLoading(false);
      }
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      await verifyPhoneOtp(phoneForVerification, otp);
      // On success, user is logged in via onAuthStateChange.
      // Now, record the signup/login.
      const currentDate = new Date().toISOString().split('T')[0];
      const numericPhone = phoneForVerification.replace(/\D/g, '');
      await supabase.from('logins').insert({
        email: null,
        'mobile number': Number(numericPhone),
        date: currentDate,
      });
      // Navigation is handled by the main useEffect hook watching the user state.
    } catch (error) {
      setOtp("");
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

  if (awaitingOtp) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Verify Your Phone
            </h1>
          </div>
          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle>Enter OTP</CardTitle>
              <CardDescription>
                We've sent a 6-digit code to <strong>{phoneForVerification}</strong>.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleOtpVerification}>
              <CardContent className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify &amp; Sign Up
                </Button>
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  type="button"
                  onClick={() => {
                    setAwaitingOtp(false);
                    setLoading(false);
                  }}
                >
                  Back
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  // Show success message after email signup
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
                : "Choose a method to create your account"}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleAuth}>
            <CardContent className="space-y-4">
              {isLogin ? (
                <>
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
                </>
              ) : (
                <Tabs defaultValue="email" className="w-full" onValueChange={(v) => setAuthMethod(v as 'email' | 'mobile')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="mobile">Mobile</TabsTrigger>
                  </TabsList>
                  <TabsContent value="email" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required={authMethod === 'email'}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="mobile" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="mobileNumber">Mobile Number</Label>
                      <Input
                        id="mobileNumber"
                        type="tel"
                        placeholder="+14155552671"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        required={authMethod === 'mobile'}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
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

              {!isLogin && authMethod === 'email' && (
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
                  isLogin ? "Login" : (authMethod === 'mobile' ? "Send OTP" : "Sign Up")
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
