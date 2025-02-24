import { useState, type ChangeEvent, type FormEvent } from "@/lib/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type {
  Portfolio,
  CreatePortfolioData,
  PortfolioType,
  PortfolioCurrency,
} from "@/types/portfolio";

interface PortfolioFormProps {
  onSubmit: (portfolio: CreatePortfolioData) => void;
  onCancel: () => void;
  initialData?: Partial<Portfolio>;
}

export function PortfolioForm({
  onSubmit,
  onCancel,
  initialData,
}: PortfolioFormProps) {
  const [formData, setFormData] = useState<CreatePortfolioData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    type: initialData?.type || "personal",
    currency: initialData?.currency || "USD",
    is_public: initialData?.is_public || false,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange =
    (field: keyof CreatePortfolioData) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const value =
        e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const handleTextAreaChange =
    (field: keyof CreatePortfolioData) =>
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Portfolio Name
        </label>
        <Input
          id="name"
          value={formData.name}
          onChange={handleInputChange("name")}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={handleTextAreaChange("description")}
          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="type" className="text-sm font-medium">
          Type
        </label>
        <Select
          value={formData.type}
          onValueChange={(value: PortfolioType) => {
            setFormData((prev) => ({ ...prev, type: value }));
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="investment">Investment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="currency" className="text-sm font-medium">
          Currency
        </label>
        <Select
          value={formData.currency}
          onValueChange={(value: PortfolioCurrency) => {
            setFormData((prev) => ({ ...prev, currency: value }));
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="EUR">EUR</SelectItem>
            <SelectItem value="GBP">GBP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_public"
          checked={formData.is_public}
          onChange={handleInputChange("is_public")}
          className="rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="is_public" className="text-sm">
          Make portfolio public
        </label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? "Update Portfolio" : "Create Portfolio"}
        </Button>
      </div>
    </form>
  );
}
