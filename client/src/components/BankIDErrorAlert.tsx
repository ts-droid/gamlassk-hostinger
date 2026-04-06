import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export function BankIDErrorAlert() {
  const [location] = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check for error in URL query params
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');

    if (error) {
      switch (error) {
        case 'bankid_not_member':
          setErrorMessage(
            'Du är inte registrerad som medlem i Gamla SSK-are. BankID-inloggning kräver att ditt personnummer finns i medlemsregistret. Ansök om medlemskap nedan eller kontakta administratören.'
          );
          break;
        case 'bankid_invalid_personnummer':
          setErrorMessage(
            'Kunde inte läsa personnummer från BankID. Kontakta administratören om problemet kvarstår.'
          );
          break;
        case 'bankid_db_error':
          setErrorMessage(
            'Ett tekniskt fel uppstod vid verifiering av medlemskap. Försök igen senare.'
          );
          break;
        case 'bankid_failed':
          setErrorMessage(
            'BankID-inloggning misslyckades. Kontrollera att du har en giltig BankID och försök igen.'
          );
          break;
        case 'bankid_session_missing':
          setErrorMessage(
            'Sessionen har gått ut. Försök logga in igen.'
          );
          break;
        case 'bankid_state_mismatch':
          setErrorMessage(
            'Säkerhetsverifiering misslyckades. Försök logga in igen.'
          );
          break;
        default:
          if (error.startsWith('bankid_')) {
            setErrorMessage(
              'Ett fel uppstod vid BankID-inloggning. Försök igen eller kontakta administratören.'
            );
          }
      }

      // Clear error from URL after showing it
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location]);

  if (!errorMessage) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <XCircle className="h-4 w-4" />
      <AlertTitle>BankID-inloggning misslyckades</AlertTitle>
      <AlertDescription>
        <p className="mb-3">{errorMessage}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setErrorMessage(null)}
          className="bg-white hover:bg-gray-50"
        >
          Stäng
        </Button>
      </AlertDescription>
    </Alert>
  );
}
