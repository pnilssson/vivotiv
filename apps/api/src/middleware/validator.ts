import type { Context } from "hono";

export function validationHook(
  result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } },
  c: Context,
) {
  if (!result.success) {
    const issues = result.error!.issues.map((i) => ({
      path: i.path.map(String).join("."),
      message: i.message,
    }));

    return c.json({ error: { message: "Validation failed", issues } }, 400);
  }
}
