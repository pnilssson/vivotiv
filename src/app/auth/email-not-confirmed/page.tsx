import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Please confirm your email</CardTitle>
        <CardDescription>
          Please verify your email by clicking the link in the message we have
          sent you. No email? Please have a look at your spam folder.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
