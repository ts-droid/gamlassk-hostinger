import { trpc } from "@/lib/trpc";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function MemberVerificationBanner() {
  const { data: memberStatus, isLoading } = trpc.members.verifyStatus.useQuery();

  if (isLoading) {
    return null;
  }

  if (!memberStatus) {
    return null;
  }

  if (memberStatus.isMember && memberStatus.memberInfo) {
    // User is a verified member
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-900">Verifierad medlem</AlertTitle>
        <AlertDescription className="text-green-800">
          Du är registrerad som medlem i Gamla SSK-are.
          {memberStatus.memberInfo.membershipNumber && (
            <span className="block mt-1 font-medium">
              Medlemsnummer: {memberStatus.memberInfo.membershipNumber}
            </span>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // User is not a member
  return (
    <Alert className="border-blue-200 bg-blue-50">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-900">Inte medlem än?</AlertTitle>
      <AlertDescription className="text-blue-800">
        <p className="mb-2">
          Du är inloggad men inte registrerad som medlem i Gamla SSK-are.
        </p>
        <Link href="/#bli-medlem">
          <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
            Ansök om medlemskap
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}
