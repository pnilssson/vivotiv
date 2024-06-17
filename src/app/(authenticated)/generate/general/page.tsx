"use client";

import { useRouter } from "next/navigation";
import FormWrapper from "../formWrapper";
import FormActions from "../formActions";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatDate } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "@/components/ui/calendar";
import useGenerateFormContext from "@/lib/hooks/useGenerateFormContext";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function InfoPage() {
  const router = useRouter();
  const { trigger, formState, setValue, control } = useGenerateFormContext();
  const numberOfSessions = [1, 2, 3, 4, 5, 6, 7];

  function formatAndSetDate(date: Date | undefined) {
    if (!date) {
      setValue("startDate", formatDate(new Date()));
      return;
    }
    date = formatDate(date);
    setValue("startDate", date);
  }

  const { isValid, errors } = formState;

  const validateStep = async () => {
    await trigger();
    if (isValid) {
      router.push("/generate/personalize");
    }
  };

  return (
    <FormWrapper
      heading="General"
      description="Specify start date and session specifications.">
      <div className="flex flex-col mt-6">
        <FormField
          control={control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}>
                      <CalendarIcon className="mr-2" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a start date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={formatAndSetDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                On what date would you like the start program to start?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="flex flex-col md:flex-row w-full gap-2 mt-6">
        <div className="mb-2 w-full md:w-1/2">
          <FormField
            control={control}
            name="sessions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sessions per week</FormLabel>
                <Select onValueChange={field.onChange} defaultValue="3">
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {numberOfSessions.map((sessionNumber) => (
                      <SelectItem
                        key={sessionNumber}
                        value={sessionNumber.toString()}>
                        {sessionNumber.toString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="mb-2 w-full md:w-1/2">
          <FormField
            control={control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Session length</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Time"
                    id="time"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Please provide length in minutes.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      <FormActions>
        <div></div>
        <Button type="button" onClick={validateStep}>
          Continue
        </Button>
      </FormActions>
    </FormWrapper>
  );
}
