
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to clean up auth state
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        }
        
        // Handle email confirmation
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if this is coming from email verification
          if (window.location.pathname === '/verify') {
            // Let the verification page handle the success message
            return;
          }
          
          if (!session.user.email_confirmed_at) {
            toast.info("Please check your email and click the verification link to complete your registration");
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Clean up existing auth state
      cleanupAuthState();
      
      // Attempt to sign out first (to clean up any existing sessions)
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Login error:", error);
        if (error.message.includes("Invalid login")) {
          toast.error("Incorrect email or password");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Please verify your email before logging in. Check your inbox for the verification link.");
        } else {
          toast.error(error.message || "Failed to sign in. Please check your credentials.");
        }
        throw error;
      }
      
      if (data && data.user) {
        // Check if email is verified
        if (!data.user.email_confirmed_at) {
          toast.error("Please verify your email before logging in. Check your inbox for the verification link.");
          await supabase.auth.signOut();
          return;
        }
        
        toast.success("Successfully logged in!");
        navigate("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      // Error is already handled above
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Clean up existing auth state
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify`
        }
      });
      
      if (error) {
        console.error("Signup error:", error);
        if (error.message.includes("User already registered")) {
          toast.error("An account with this email already exists. Please log in instead.");
        } else {
          toast.error(error.message || "Failed to sign up. Please try again.");
        }
        throw error;
      }
      
      if (data.user && !data.user.email_confirmed_at) {
        toast.success("Registration successful! Please check your email and click the verification link to complete your account setup.");
      } else if (data.user && data.user.email_confirmed_at) {
        toast.success("Registration successful! You can now log in.");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      // Error is already handled above
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      // Clean up auth state
      cleanupAuthState();
      
      // Attempt global sign out
      await supabase.auth.signOut({ scope: 'global' });
      
      toast.success("Successfully logged out");
      // Force page reload for a clean state
      window.location.href = '/auth';
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Failed to sign out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`
      });
      if (error) throw error;
      toast.success("Password reset email sent. Please check your inbox.");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to send reset email. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="mt-2 text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};
