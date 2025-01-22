import Link from "next/link";

export default async function Component({
  className = "",
}: {
  className: string;
}) {
  return (
    <Link
      className={className}
      href="https://app.termly.io/policy-viewer/policy.html?policyUUID=ac803d10-bb55-4406-b4cb-1d42b7754359">
      Cookies
    </Link>
  );
}
