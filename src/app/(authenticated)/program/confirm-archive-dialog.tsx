"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../components/ui/alert-dialog";
import { PROGRAM_GENERATION_LIMIT } from "@/lib/constants";

export default function ConfirmDialog({
  action,
  children,
  currentGeneratedProgramsCount,
}: {
  action: () => void;
  children: React.ReactNode;
  currentGeneratedProgramsCount: number;
}) {
  function getArchiveDialogText() {
    return currentGeneratedProgramsCount >= PROGRAM_GENERATION_LIMIT
      ? `You have reached your weekly limit of ${PROGRAM_GENERATION_LIMIT} program generations. You will be able to generate your next program when one week has passed since generating the first of these ${PROGRAM_GENERATION_LIMIT} programs.`
      : `This will archive the current program and you will have to generate a new one. You can generate a maximum of ${PROGRAM_GENERATION_LIMIT} programs per week. You've generated ${currentGeneratedProgramsCount} programs in the last seven days.`;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="top-[30%]">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {getArchiveDialogText()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={action}
            disabled={
              currentGeneratedProgramsCount >= PROGRAM_GENERATION_LIMIT
            }>
            Archive
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
