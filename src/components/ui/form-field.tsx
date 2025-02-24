import { Input, type InputProps } from "./input";
import { Select, SelectTrigger, SelectContent, SelectItem } from "./select";
import { cn } from "@/lib/utils";
import { type ChangeEvent } from "react";

type FormFieldBaseProps = Omit<InputProps, 'type' | 'onChange' | 'value'>;

interface FormFieldSelectProps extends FormFieldBaseProps {
  type: 'select';
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
}

interface FormFieldInputProps extends FormFieldBaseProps {
  type?: Exclude<string, 'select'>;
  options?: never;
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

type FormFieldProps = (FormFieldSelectProps | FormFieldInputProps) & {
  label: string;
  error?: string;
};

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  type = "text",
  options,
  className,
  value,
  onChange,
  ...props
}) => {
  const inputClasses = cn(
    className,
    error && "border-red-500 focus:ring-red-500",
  );

  if (type === "select" && options) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">{label}</label>
        <Select 
          value={value?.toString()} 
          onValueChange={(val) => onChange?.(val)}
        >
          <SelectTrigger className={inputClasses}>
            <span>
              {options.find((opt) => opt.value === value)?.label ||
                "Select..."}
            </span>
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <Input 
        type={type} 
        className={inputClasses} 
        value={value} 
        onChange={onChange as FormFieldInputProps['onChange']}
        {...props} 
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
