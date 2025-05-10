
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="w-full border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Stegano
            </span>
          </Link>
          <div className="hidden md:flex gap-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/encrypt" className="text-muted-foreground hover:text-foreground transition-colors">
              Hide Data
            </Link>
            <Link to="/decrypt" className="text-muted-foreground hover:text-foreground transition-colors">
              Reveal Data
            </Link>
            <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {user ? (
            <Button variant="outline" size="sm" onClick={handleSignOut} className="hidden md:flex">
              Sign Out
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild className="hidden md:flex">
              <Link to="/auth">
                <User className="h-4 w-4 mr-2" />
                Login
              </Link>
            </Button>
          )}
          
          <Button variant="default" asChild className="hidden md:flex">
            <Link to="/encrypt">Get Started</Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleMenu} className="md:hidden">
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="container md:hidden py-4 flex flex-col gap-2 animate-fade-in">
          <Link to="/" className="px-4 py-2 hover:bg-accent rounded-md" onClick={toggleMenu}>
            Home
          </Link>
          <Link to="/encrypt" className="px-4 py-2 hover:bg-accent rounded-md" onClick={toggleMenu}>
            Hide Data
          </Link>
          <Link to="/decrypt" className="px-4 py-2 hover:bg-accent rounded-md" onClick={toggleMenu}>
            Reveal Data
          </Link>
          <Link to="/about" className="px-4 py-2 hover:bg-accent rounded-md" onClick={toggleMenu}>
            About
          </Link>
          <Link to="/contact" className="px-4 py-2 hover:bg-accent rounded-md" onClick={toggleMenu}>
            Contact
          </Link>
          {user ? (
            <Button variant="outline" className="mt-2" onClick={() => {
              handleSignOut();
              toggleMenu();
            }}>
              Sign Out
            </Button>
          ) : (
            <Link to="/auth" className="px-4 py-2 hover:bg-accent rounded-md" onClick={toggleMenu}>
              Login
            </Link>
          )}
          <Button variant="default" asChild className="mt-2">
            <Link to="/encrypt" onClick={toggleMenu}>Get Started</Link>
          </Button>
        </div>
      )}
    </nav>
  );
}
