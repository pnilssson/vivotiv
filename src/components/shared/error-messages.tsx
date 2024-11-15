import { ZodIssue } from "zod";

export default function Component({
  name,
  errors,
}: {
  name: string;
  errors: ZodIssue[];
}) {
  if (errors.length === 0) return null;

  const issues = errors
    .filter((item) => {
      return item.path.includes(name);
    })
    .map((item) => item.message);

  if (issues.length === 0) return null;

  return (
    <>
      {issues.map((error, index) => (
        <p className="ml-2 mt-2 text-sm text-destructive" key={index}>
          {error}
        </p>
      ))}
    </>
  );
}
