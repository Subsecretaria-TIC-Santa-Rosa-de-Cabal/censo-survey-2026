"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps {
  id: string;
  label: string;
  value?: string;
  onChange: (value: string | null) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export function FormSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Seleccione...",
  error,
  required = false,
}: FormSelectProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger id={id} className={error ? "border-destructive" : ""}>
          <span className="flex flex-1 text-left truncate">
            {options.find((o) => o.value === value)?.label ?? placeholder}
          </span>
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
