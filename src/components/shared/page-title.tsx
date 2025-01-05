export default async function Component({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="grid gap-2 mb-8">
      <div className="text-2xl font-semibold leading-none tracking-tight">
        {title}
      </div>
      <div className="text-sm text-muted-foreground">{description}</div>
    </div>
  );
}
