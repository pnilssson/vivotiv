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
import { startTransition, useActionState, useState } from "react";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { setConfiguration } from "./actions";
import { initialFormState } from "@/lib/constants";
import {
  ConfigurationResponse,
  Environment,
  WorkoutFocus,
  WorkoutType,
} from "@/types/types";
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

const numberOfSessions = [1, 2, 3, 4, 5, 6, 7];

export default function Component({
  configuration,
  workoutFocus,
  workoutTypes,
  workoutEnvironments,
}: {
  configuration: ConfigurationResponse | undefined;
  workoutFocus: WorkoutFocus[];
  workoutTypes: WorkoutType[];
  workoutEnvironments: Environment[];
}) {
  const [state, formAction] = useActionState(
    setConfiguration,
    initialFormState
  );
  console.log(configuration);

  const form = useForm<z.infer<typeof configurationRequestSchema>>({
    resolver: zodResolver(configurationRequestSchema),
    defaultValues: {
      id: configuration ? configuration.id : "",
      sessions: configuration ? configuration.sessions : 3,
      time: configuration ? configuration.time : 30,
      workoutFocuses: configuration
        ? configuration.workoutFocuses.map((focus) => focus.id)
        : [],
      workoutTypes: configuration
        ? configuration.workoutTypes.map((type) => type.id)
        : [],
      environments: configuration
        ? configuration.environments.map((environment) => environment.id)
        : [],
      equipment: configuration ? configuration.equipment : "",
    },
  });

  return (
    <>
      <div className="grid gap-2">
        <div className="text-2xl font-semibold leading-none tracking-tight">
          Configuration
        </div>
        <div className="text-sm text-muted-foreground">
          We will tailor your program to your needs based on the information you
          provide below.
        </div>
      </div>

      <Form {...form}>
        <form
          action={() => {
            formAction(form.getValues() as any as FormData);
          }}>
          <div className="grid gap-8 mt-4">
            <div className="hidden">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        value={field.value!}
                        id="id"
                        name="id"
                        type="text"
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
                          {numberOfSessions.map((sessionNumber) => (
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
                name="workoutFocuses"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Focus</FormLabel>
                    <ToggleGroup
                      variant="outline"
                      type="multiple"
                      className="justify-start flex-wrap"
                      value={field.value!}
                      onValueChange={(value) => {
                        if (value) form.setValue("workoutFocuses", value);
                      }}>
                      {workoutFocus.map((focus) => (
                        <ToggleGroupItem
                          key={focus.id}
                          value={focus.id}
                          aria-label={`Toggle ${focus.name}`}>
                          <span className="capitalize">{focus.name}</span>
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                    <FormDescription>
                      Leave empty to get an all-round program.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="workoutTypes"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Include</FormLabel>
                    <ToggleGroup
                      variant="outline"
                      type="multiple"
                      className="justify-start flex-wrap"
                      value={field.value!}
                      onValueChange={(value) => {
                        if (value) form.setValue("workoutTypes", value);
                      }}>
                      {workoutTypes.map((type) => (
                        <ToggleGroupItem
                          key={type.id}
                          value={type.id}
                          aria-label={`Toggle ${type.name}`}>
                          <span className="capitalize">{type.name}</span>
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="environments"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Environment</FormLabel>
                    <ToggleGroup
                      variant="outline"
                      type="multiple"
                      className="justify-start flex-wrap"
                      value={field.value!}
                      onValueChange={(value) => {
                        if (value) form.setValue("environments", value);
                      }}>
                      {workoutEnvironments.map((environment) => (
                        <ToggleGroupItem
                          key={environment.id}
                          value={environment.id}
                          aria-label={`Toggle ${environment.name}`}>
                          <span className="capitalize">{environment.name}</span>
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
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
                        placeholder="Kettlebell, dumbbell, etc."
                        type="text"
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Specify any kind of equipment you have available separated
                      by a commas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="ml-auto">
              <SubmitButton content="Save" />
            </div>
          </div>
        </form>
      </Form>
    </>
  );
}
