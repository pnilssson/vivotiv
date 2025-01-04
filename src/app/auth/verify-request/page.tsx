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
        <CardTitle className="text-2xl">Please check your email</CardTitle>
        <CardDescription>
          We have sent you an email to confirm that the provided email is yours.
          Clicking the link in the email will confirm your email and log you in.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
