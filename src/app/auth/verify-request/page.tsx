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
          We have sent you an email with further instructions. No email? Please
          have a look at your spam folder.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
