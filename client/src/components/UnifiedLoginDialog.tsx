import { PasswordLoginDialog } from "./PasswordLoginDialog";

interface UnifiedLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Password-only login (Manus OAuth and Google OAuth removed)
export function UnifiedLoginDialog({ open, onOpenChange }: UnifiedLoginDialogProps) {
  return (
    <PasswordLoginDialog
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
