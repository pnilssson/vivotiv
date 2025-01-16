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
import { INITIAL_FORM_STATE } from "@/lib/constants";
import {
  ConfigurationResponse,
  ExperienceResponse,
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
import ContentBox from "@/components/shared/content-box";

export default function Component({
  configuration,
  workoutTypes,
  preferredDays,
  experiences,
}: {
  configuration: ConfigurationResponse | null;
  workoutTypes: WorkoutTypeResponse[];
  preferredDays: PreferredDayResponse[];
  experiences: ExperienceResponse[];
}) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(
    setConfiguration,
    INITIAL_FORM_STATE
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
  }, [state, state.message, toast]);

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
      experience_id: configuration
        ? configuration.experience.id
        : experiences.find((e) => e.level == 2)?.id,
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
        }}>
        <div className="grid gap-4">
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
          <ContentBox className="flex flex-col md:flex-row w-full gap-4">
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
                      Length of sessions in minutes.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ErrorMessages name="time" errors={state.errors} />
            </div>
          </ContentBox>
          <ContentBox>
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
                        aria-label={`Toggle ${type.name}`}
                        className="flex-1 px-0 sm:px-2.5">
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
                    Any preferred training days?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </ContentBox>
          <ContentBox>
            <FormField
              control={form.control}
              name="workout_types"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Workout Types</FormLabel>
                  <ToggleGroup
                    variant="outline"
                    type="multiple"
                    className="grid grid-cols-2 md:grid-cols-4"
                    value={field.value!}
                    onValueChange={(value) => {
                      if (value) form.setValue("workout_types", value);
                    }}>
                    {workoutTypes.map((type) => (
                      <ToggleGroupItem
                        key={type.id}
                        value={type.id}
                        size="sm"
                        aria-label={`Toggle ${type.name}`}
                        className="flex-1 px-0 sm:px-2.5">
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
          </ContentBox>
          <ContentBox>
            <FormField
              control={form.control}
              name="experience_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Experience</FormLabel>
                  <ToggleGroup
                    variant="outline"
                    type="single"
                    className=""
                    value={field.value!}
                    onValueChange={(value) => {
                      if (value) form.setValue("experience_id", value);
                    }}>
                    {experiences.map((type) => (
                      <ToggleGroupItem
                        key={type.id}
                        value={type.id}
                        size="sm"
                        aria-label={`Toggle ${type.name}`}
                        className="flex-1 px-0 sm:px-2.5">
                        <span className="capitalize">{type.name}</span>
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <FormDescription>
                    What level of training experience do you consider yourself
                    to have?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </ContentBox>
          <ContentBox>
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
                    Specify available training equipment related to selected
                    workout types separated by commas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </ContentBox>
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
