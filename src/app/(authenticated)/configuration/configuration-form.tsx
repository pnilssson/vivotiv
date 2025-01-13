"use client";

import SubmitButton from "@/components/buttons/submit-button";
import ErrorMessages from "@/components/shared/error-messages";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useActionState, useEffect } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { setConfiguration } from "./actions";
import { initialFormState } from "@/lib/constants";
import {
  ConfigurationResponse,
  PreferredDayResponse,
  WorkoutTypeResponse,
} from "@/lib/types";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { configurationRequestSchema } from "@/lib/zod/schema";
import { useToast } from "@/lib/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

export default function Component({
  configuration,
  workoutTypes,
  preferredDays,
}: {
  configuration: ConfigurationResponse | null;
  workoutTypes: WorkoutTypeResponse[];
  preferredDays: PreferredDayResponse[];
}) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(
    setConfiguration,
    initialFormState
  );

  useEffect(() => {
    if (state) {
      if (state.message && state.success) {
        toast({ description: state.message, variant: "success" });
      }
      if (state.message && !state.success) {
        toast({ description: state.message, variant: "destructive" });
      }
    }
  }, [state, state.message]);

  const form = useForm<z.infer<typeof configurationRequestSchema>>({
    resolver: zodResolver(configurationRequestSchema),
    defaultValues: {
      id: configuration ? configuration.id : "",
      sessions: configuration ? configuration.sessions : 3,
      time: configuration ? configuration.time : 30,
      workout_types: configuration
        ? configuration.workout_types.map((type) => type.id)
        : [],
      equipment: configuration ? configuration.equipment : "",
      preferred_days: configuration
        ? configuration.preferred_days.map((day) => day.id)
        : [],
      generate_automatically: configuration
        ? configuration?.generate_automatically
        : false,
    },
  });

  return (
    <Form {...form}>
      <form
        action={() => {
          formAction(form.getValues() as any as FormData);
        }}
        className="bg-slate-50/50 border border-slate-100 rounded-lg p-4">
        <div className="grid gap-8">
          <div className="hidden">
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      id="id"
                      name="id"
                      type="text"
                      value={field.value!}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col md:flex-row w-full gap-4">
            <div className="mb-2 w-full md:w-1/2">
              <FormField
                control={form.control}
                name="sessions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sessions</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7].map((sessionNumber) => (
                          <SelectItem
                            key={sessionNumber}
                            value={sessionNumber.toString()}>
                            {sessionNumber.toString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Numbers of sessions per week.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ErrorMessages name="sessions" errors={state.errors} />
            </div>
            <div className="mb-2 w-full md:w-1/2">
              <FormField
                control={form.control}
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
              <ErrorMessages name="time" errors={state.errors} />
            </div>
          </div>
          <div>
            <FormField
              control={form.control}
              name="preferred_days"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Preferred days</FormLabel>
                  <ToggleGroup
                    variant="outline"
                    type="multiple"
                    className="justify-start flex-wrap"
                    value={field.value!}
                    onValueChange={(value) => {
                      if (value) form.setValue("preferred_days", value);
                    }}>
                    {preferredDays.map((type) => (
                      <ToggleGroupItem
                        key={type.id}
                        value={type.id}
                        size="sm"
                        aria-label={`Toggle ${type.name}`}>
                        <span className="capitalize sm:hidden">
                          {type.name.slice(0, 3)}
                        </span>
                        <span className="capitalize hidden sm:flex">
                          {type.name}
                        </span>
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <FormDescription>
                    Select preferred training days.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormField
              control={form.control}
              name="workout_types"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Workout Types</FormLabel>
                  <ToggleGroup
                    variant="outline"
                    type="multiple"
                    className="justify-start flex-wrap"
                    value={field.value!}
                    onValueChange={(value) => {
                      if (value) form.setValue("workout_types", value);
                    }}>
                    {workoutTypes.map((type) => (
                      <ToggleGroupItem
                        key={type.id}
                        value={type.id}
                        size="sm"
                        aria-label={`Toggle ${type.name}`}>
                        <span className="capitalize">{type.name}</span>
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <FormDescription>
                    What type of training would you like included in your
                    program? Leave empty to get an all-round program.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormField
              control={form.control}
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipment</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value!}
                      id="equipment"
                      name="equipment"
                      placeholder="Kettlebell, pull up bar, jump rope etc."
                      type="text"
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Specify any kind of training equipment you have available
                    separated by a commas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* <div>
            <FormField
              control={form.control}
              name="generate_automatically"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel>Generate automatically</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    By checking this we will automatically generate a new
                    program for you when your current program is completed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div> */}
          <div className="ml-auto">
            <SubmitButton
              content="Save"
              loadingContent="Saving.."
              classes="md:w-36"
            />
          </div>
        </div>
      </form>
    </Form>
  );
}
