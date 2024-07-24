"use client";

import useGenerateForm from "@/lib/hooks/useGenerateForm";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Form } from "@/components/ui/form";
import { initialFormState } from "@/lib/constants";
import { useFormState } from "react-dom";
import { generateProgramAction } from "./actions";
import { useRef } from "react";

export default function Provider({ children }: { children: React.ReactNode }) {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction] = useFormState(
    generateProgramAction,
    initialFormState,
  );

  const form = useGenerateForm({
    startDate: formatDate(new Date()),
    sessions: 3,
    time: 15,
    prioritize: [],
    types: [],
    equipment: [],
  });

  return (
    <Form {...form}>
      <form
        ref={formRef}
        action={async () => {
          const valid = await form.trigger();
          if (valid) formAction(form.getValues() as any as FormData);
        }}
        className="flex w-full"
      >
        {children}
      </form>
    </Form>
  );
}
