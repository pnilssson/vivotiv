import Link from "next/link";

export default async function Component({
  className = "",
}: {
  className: string;
}) {
  return (
    <Link
      className={className}
      href="https://app.termly.io/policy-viewer/policy.html?policyUUID=996ecca7-9102-4a89-87f3-dd48589b2419">
      Policy
    </Link>
  );
}
