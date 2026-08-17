"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { forwardRef } from "react";

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, required, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={props.id}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Textarea ref={ref} {...props} className={error ? "border-destructive" : ""} />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);
FormTextarea.displayName = "FormTextarea";
