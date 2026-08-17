"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forwardRef } from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, required, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={props.id}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Input ref={ref} {...props} className={error ? "border-destructive" : ""} />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);
FormInput.displayName = "FormInput";
