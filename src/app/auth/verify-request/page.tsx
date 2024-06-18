import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex flex-col p-4">
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Please check your email</CardTitle>
          <CardDescription>
            We have sent a sign-in link to your email address. No email? Please
            check your spam folder.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
