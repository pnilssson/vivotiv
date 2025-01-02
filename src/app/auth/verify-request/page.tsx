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
          We have sent you an email! No email? Please check your spam folder.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
