import Link from "next/link";

export default async function Component({
  className = "",
}: {
  className: string;
}) {
  return (
    <Link
      className={className}
      href="https://app.termly.io/policy-viewer/policy.html?policyUUID=c481a7c9-90d4-436b-9f1e-0b20d37117b1">
      Terms
    </Link>
  );
}
