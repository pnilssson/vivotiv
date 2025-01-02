import { getPreferredSignInView } from "@/lib/server-utils";
import { redirect } from "next/navigation";

export default async function Page() {
  const defaultView = await getPreferredSignInView();

  return redirect(`/auth/signin/${defaultView}`);
}
