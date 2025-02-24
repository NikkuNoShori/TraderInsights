import { Input, InputProps } from "./input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectProps } from "./select";
import { cn } from "../../lib/utils";

interface FormFieldProps extends Omit<InputProps, 'type'> {
  label: string;
  error?: string;
  type?: 'text' | 'select' | string;
  options?: { value: string; label: string }[];
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  type = "text",
  options,
  className,
  value,
  ...props
}) => {
  const inputClasses = cn(
    className,
    error && "border-red-500 focus:ring-red-500",
  );

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      {type === "select" && options ? (
        <Select 
          value={typeof value === 'string' ? value : value?.toString()} 
          {...(props as Omit<SelectProps, 'value'>)}
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
      ) : (
        <Input type={type} className={inputClasses} value={value} {...props} />
      )}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
