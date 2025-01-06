export default async function Component({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="grid gap-2 mb-8">
      <h3 className="text-2xl font-semibold leading-none tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
