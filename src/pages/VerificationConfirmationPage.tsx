
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export default function VerificationConfirmationPage() {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailVerification = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      
      if (!token || type !== 'signup') {
        setVerificationStatus('error');
        setErrorMessage('Invalid verification link');
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });

        if (error) {
          console.error('Verification error:', error);
          setVerificationStatus('error');
          setErrorMessage(error.message);
        } else {
          setVerificationStatus('success');
          toast.success('Email verified successfully!');
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setErrorMessage('Failed to verify email. Please try again.');
      }
    };

    handleEmailVerification();
  }, [searchParams]);

  const handleContinue = () => {
    navigate("/");
  };

  const handleResendVerification = () => {
    navigate("/auth");
    toast.info("Please sign up again to receive a new verification email");
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Email Verification
          </h1>
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            {verificationStatus === 'loading' && (
              <>
                <div className="flex justify-center mb-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
                <CardTitle>Verifying your email...</CardTitle>
                <CardDescription>
                  Please wait while we verify your email address
                </CardDescription>
              </>
            )}
            
            {verificationStatus === 'success' && (
              <>
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <CardTitle>Email Verified Successfully!</CardTitle>
                <CardDescription>
                  You are now ready to use the steganography app
                </CardDescription>
              </>
            )}
            
            {verificationStatus === 'error' && (
              <>
                <div className="flex justify-center mb-4">
                  <AlertCircle className="h-12 w-12 text-red-500" />
                </div>
                <CardTitle>Verification Failed</CardTitle>
                <CardDescription>
                  {errorMessage || "There was an error verifying your email"}
                </CardDescription>
              </>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            {verificationStatus === 'success' && (
              <Button onClick={handleContinue} className="w-full" size="lg">
                Continue to App
              </Button>
            )}
            
            {verificationStatus === 'error' && (
              <div className="space-y-2">
                <Button onClick={handleResendVerification} className="w-full" size="lg">
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/")} 
                  className="w-full"
                >
                  Go Home
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
