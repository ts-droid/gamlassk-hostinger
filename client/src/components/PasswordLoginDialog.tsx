import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface PasswordLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PasswordLoginDialog({ open, onOpenChange }: PasswordLoginDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);

  const loginMutation = trpc.auth.loginWithPassword.useMutation({
    onSuccess: () => {
      toast.success("Inloggning lyckades!");
      window.location.reload(); // Reload to update auth state
    },
    onError: (error) => {
      toast.error(error.message || "Inloggning misslyckades");
    },
  });

  const resetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setForgotPassword(false);
      setEmail("");
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte skicka återställningsmail");
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Fyll i både e-post och lösenord");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Ange din e-postadress");
      return;
    }
    resetMutation.mutate({ email });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {forgotPassword ? "Återställ lösenord" : "Logga in"}
          </DialogTitle>
          <DialogDescription>
            {forgotPassword
              ? "Ange din e-postadress så skickar vi en återställningslänk"
              : "Logga in med din registrerade e-postadress"}
          </DialogDescription>
        </DialogHeader>

        {forgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">E-postadress</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="din@email.se"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={resetMutation.isPending}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full"
                disabled={resetMutation.isPending}
              >
                {resetMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Skickar...
                  </>
                ) : (
                  "Skicka återställningslänk"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setForgotPassword(false)}
                disabled={resetMutation.isPending}
              >
                Tillbaka till inloggning
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-postadress</Label>
              <Input
                id="email"
                type="email"
                placeholder="din@email.se"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loginMutation.isPending}
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Lösenord</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loginMutation.isPending}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loggar in...
                  </>
                ) : (
                  "Logga in"
                )}
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={() => setForgotPassword(true)}
                disabled={loginMutation.isPending}
                className="text-sm"
              >
                Glömt lösenord?
              </Button>
            </div>
          </form>
        )}

        <div className="text-center text-xs text-gray-500">
          <p>
            Har du inget konto?{" "}
            <a href="/#bli-medlem" className="underline hover:text-gray-700" onClick={() => onOpenChange(false)}>
              Bli medlem
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
