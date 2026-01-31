import React from "react";

interface FormFieldProps {
  readonly label: string;
  readonly name: string;
  readonly type?: "text" | "number" | "select" | "textarea" | "datetime-local";
  readonly required?: boolean;
  readonly min?: number;
  readonly rows?: number;
  readonly className?: string;
  readonly children?: React.ReactNode;
  readonly placeholder?: string;
}

export function FormField({
  label,
  name,
  type = "text",
  required = false,
  min,
  rows = 3,
  className,
  children,
  placeholder,
}: FormFieldProps) {
  const baseInputClass = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

  return (
    <div className={className}>
      <label className="text-sm font-medium flex flex-col gap-1">
        <span>{label}</span>
        {type === "select" ? (
          <select name={name} required={required} className={baseInputClass}>
            {children}
          </select>
        ) : type === "textarea" ? (
          <textarea
            name={name}
            required={required}
            className={baseInputClass}
            rows={rows}
            placeholder={placeholder}
          />
        ) : (
          <input
            name={name}
            type={type}
            required={required}
            min={min}
            className={baseInputClass}
            placeholder={placeholder}
          />
        )}
      </label>
    </div>
  );
}
