
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  showStrength?: boolean;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function PasswordInput({
  value,
  onChange,
  showStrength = false,
  placeholder = "Enter password",
  className,
  required = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const calculateStrength = (password: string): number => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character type checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return Math.min(Math.floor((strength / 6) * 4), 4);
  };
  
  const passwordStrength = calculateStrength(value);
  
  const getStrengthLabel = (strength: number): string => {
    if (strength === 0) return "Very Weak";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
  };
  
  const getStrengthColor = (strength: number): string => {
    if (strength === 0) return "bg-destructive/50";
    if (strength === 1) return "bg-destructive";
    if (strength === 2) return "bg-yellow-500";
    if (strength === 3) return "bg-green-500/70";
    return "bg-green-500";
  };
  
  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn("pr-10", className)}
          required={required}
        />
        <button
          type="button"
          onClick={toggleShowPassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      
      {showStrength && value && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all",
                  level <= passwordStrength
                    ? getStrengthColor(passwordStrength)
                    : "bg-muted"
                )}
              />
            ))}
          </div>
          
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              {getStrengthLabel(passwordStrength)}
            </span>
            <div className="flex gap-3">
              {[
                { label: "8+ chars", valid: value.length >= 8 },
                { label: "Uppercase", valid: /[A-Z]/.test(value) },
                { label: "Number", valid: /[0-9]/.test(value) },
                { label: "Symbol", valid: /[^A-Za-z0-9]/.test(value) },
              ].map((criteria, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1"
                  title={criteria.label}
                >
                  {criteria.valid ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <X className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className="hidden sm:inline text-muted-foreground">
                    {criteria.label}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
