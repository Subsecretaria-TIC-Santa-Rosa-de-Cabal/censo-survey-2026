"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Option {
  value: string;
  label: string;
}

interface FormSearchableSelectProps {
  id: string;
  label: string;
  value?: string;
  onChange: (value: string | null) => void;
  options: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  loading?: boolean;
  loadingMessage?: string;
  otherValue?: string;
  otherLabel?: string;
  error?: string;
  required?: boolean;
}

const DEFAULT_OTHER_VALUE = "__OTHER__";

export function FormSearchableSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Seleccione...",
  searchPlaceholder = "Buscar...",
  loading = false,
  loadingMessage = "Cargando...",
  otherValue = DEFAULT_OTHER_VALUE,
  otherLabel = "Otro",
  error,
  required = false,
}: FormSearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const allOptions: Option[] = [
    ...options,
    { value: otherValue, label: otherLabel },
  ];

  const filteredOptions =
    search.trim() === ""
      ? allOptions
      : allOptions.filter((opt) =>
          opt.label.toLowerCase().includes(search.toLowerCase())
        );

  const selectedLabel = loading
    ? loadingMessage
    : allOptions.find((o) => o.value === value)?.label ?? placeholder;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setSearch("");
    setOpen(false);
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <button
        type="button"
        id={id}
        disabled={loading}
        onClick={() => !loading && setOpen(!open)}
        className={`flex h-8 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 ${
          error ? "border-destructive" : ""
        }`}
      >
        <span className="flex flex-1 text-left truncate">{selectedLabel}</span>
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && !loading && (
        <div className="relative z-50">
          <div className="absolute mt-1 w-full rounded-lg border border-input bg-white shadow-md">
            <div className="p-2">
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8"
                autoFocus
              />
            </div>
            <ul className="max-h-60 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <li className="px-2.5 py-2 text-sm text-muted-foreground">
                  No se encontraron resultados
                </li>
              ) : (
                filteredOptions.map((opt) => (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`w-full px-2.5 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground ${
                        opt.value === value ? "bg-accent text-accent-foreground" : ""
                      }`}
                    >
                      {opt.label}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export { DEFAULT_OTHER_VALUE as OTHER_VALUE };
