import { useState } from "@/lib/react";
import { usePortfolios } from "../../hooks/usePortfolios";
import { PortfolioForm } from "./PortfolioForm";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import type { Portfolio, CreatePortfolioData } from "@/types/portfolio";

export function PortfolioList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const { portfolios, createPortfolio, updatePortfolio, deletePortfolio } = usePortfolios();

  const handleCreatePortfolio = async (data: CreatePortfolioData) => {
    try {
      await createPortfolio({
        ...data,
        initial_balance: 0, // Set default initial balance
      });
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error creating portfolio:", error);
    }
  };

  const handleUpdatePortfolio = async (data: CreatePortfolioData) => {
    if (!editingPortfolio) return;

    try {
      await updatePortfolio(editingPortfolio.id, data);
      setEditingPortfolio(null);
    } catch (error) {
      console.error("Error updating portfolio:", error);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    try {
      await deletePortfolio(id);
    } catch (error) {
      console.error("Error deleting portfolio:", error);
    }
  };

  const handleEditPortfolio = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Portfolios</h2>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Portfolio
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {portfolios.map((portfolio) => (
          <div
            key={portfolio.id}
            className="p-4 rounded-lg border border-border bg-card"
          >
            <h3 className="font-medium">{portfolio.name}</h3>
            <p className="text-sm text-muted-foreground">
              {portfolio.description}
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditPortfolio(portfolio)}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-600"
                onClick={() => handleDeletePortfolio(portfolio.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <PortfolioForm
          onSubmit={handleCreatePortfolio}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      {editingPortfolio && (
        <PortfolioForm
          initialData={editingPortfolio}
          onSubmit={handleUpdatePortfolio}
          onCancel={() => setEditingPortfolio(null)}
        />
      )}
    </div>
  );
}
