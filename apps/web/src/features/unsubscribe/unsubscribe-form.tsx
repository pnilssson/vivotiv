"use client";

import { Button } from "@/components/ui/button";

import { useUnsubscribe } from "./use-unsubscribe";

type UnsubscribeFormProps = {
  token: string;
};

export function UnsubscribeForm({ token }: UnsubscribeFormProps) {
  const mutation = useUnsubscribe();

  if (mutation.isSuccess) {
    return (
      <>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Klart</h1>
        <p className="mt-4 text-muted-foreground">
          Er prenumeration har avslutats. Ni kommer inte längre ta emot mail från oss.
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="font-heading text-2xl font-bold tracking-tight">
        Avsluta prenumeration
      </h1>
      <p className="mt-4 text-center text-muted-foreground">
        Klicka på knappen nedan för att sluta ta emot mail från Vivotiv.
      </p>
      <Button
        onClick={() => mutation.mutate(token)}
        disabled={mutation.isPending}
        className="mt-8"
      >
        {mutation.isPending ? "Bearbetar..." : "Avsluta prenumeration"}
      </Button>
      {mutation.isError && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          Något gick fel. Försök igen eller kontakta oss på hello@vivotiv.com.
        </p>
      )}
    </>
  );
}
