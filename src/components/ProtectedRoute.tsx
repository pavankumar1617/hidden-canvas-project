
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const EmailVerificationRequired = () => (
  <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
    <div className="w-full max-w-md">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>Email Verification Required</CardTitle>
          <CardDescription>
            Please check your email and click the verification link to access the steganography app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertTitle>Check Your Inbox</AlertTitle>
            <AlertDescription>
              We've sent a verification email to your address. Click the link in the email to verify your account and gain access to all features.
            </AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.href = '/auth'}
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
);

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if email is verified
  if (!user.email_confirmed_at) {
    return <EmailVerificationRequired />;
  }

  return <Outlet />;
};
