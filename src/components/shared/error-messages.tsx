"use client";

import React from "react";
import { ZodIssue } from "zod";

export default function Component({
  name,
  errors,
}: {
  name: string;
  errors: ZodIssue[];
}) {
  if (errors.length === 0) return null;

  const issues = errors
    .filter((item) => {
      return item.path.includes(name);
    })
    .map((item) => item.message);

  if (issues.length === 0) return null;

  return (
    <React.Fragment>
      {issues.map((error, index) => (
        <p className="text-sm text-destructive" key={index}>
          {error}
        </p>
      ))}
    </React.Fragment>
  );
}
