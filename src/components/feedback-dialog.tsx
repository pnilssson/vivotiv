"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { MessageCircleIcon } from "lucide-react";
import { SidebarMenuButton } from "./ui/sidebar";
import { INITIAL_FORM_STATE } from "@/lib/constants";
import { useActionState, useEffect, useState } from "react";
import { addFeedback } from "@/lib/actions/sharedActions";
import SubmitButton from "./buttons/submit-button";
import { Textarea } from "./ui/textarea";
import ErrorMessages from "./shared/error-messages";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { feedbackRequestSchema } from "@/lib/zod/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

export default function Component({
  toastAction,
}: {
  toastAction: (
    description: string,
    variant: "success" | "destructive"
  ) => void;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [state, formAction] = useActionState(addFeedback, INITIAL_FORM_STATE);

  const form = useForm<z.infer<typeof feedbackRequestSchema>>({
    resolver: zodResolver(feedbackRequestSchema),
    defaultValues: {
      feedback: "",
    },
  });

  useEffect(() => {
    if (!state) return;

    if (state.message) {
      if (state.success) {
        toastAction(state.message, "success");
        form.reset();
        setOpen(false);
      }
      if (!state.success) {
        toastAction(state.message, "destructive");
      }
    }
  }, [state, state.message, form, toastAction]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarMenuButton size={"default"} asChild>
          <Button
            variant="ghost"
            className="justify-start font-normal hover:font-normal hover:text-primary">
            <MessageCircleIcon />
            Leave feedback
          </Button>
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] top-[30%]">
        <Form {...form}>
          <form
            action={() => {
              formAction(form.getValues() as any as FormData);
            }}>
            <DialogHeader className="text-left">
              <DialogTitle>Leave feedback</DialogTitle>
              <DialogDescription>
                Your feedback means everything to us! It helps us make Vivotiv
                the best experience possible for you. Thank you for sharing your
                thoughts and engaging with us.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 flex flex-col gap-2">
              <FormField
                control={form.control}
                name="feedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Leave your feedback here"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ErrorMessages name="feedback" errors={state.errors} />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
              <SubmitButton content="Submit" loadingContent="Submitting.." />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
