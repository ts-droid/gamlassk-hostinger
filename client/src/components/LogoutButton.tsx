import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export function LogoutButton() {
  const [, setLocation] = useLocation();
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Du har loggats ut");
      setLocation("/");
      // Force page reload to clear all state
      window.location.reload();
    },
    onError: () => {
      toast.error("Kunde inte logga ut");
    },
  });

  return (
    <Button
      variant="outline"
      onClick={() => logout.mutate()}
      disabled={logout.isPending}
      className="w-full sm:w-auto"
    >
      <LogOut className="mr-2 h-4 w-4" />
      {logout.isPending ? "Loggar ut..." : "Logga ut"}
    </Button>
  );
}
