import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface BudgetInputProps {
  onBudgetSubmit: (budget: number) => void;
}

const BudgetInput: React.FC<BudgetInputProps> = ({ onBudgetSubmit }) => {
  const [budget, setBudget] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBudget = parseFloat(budget);
    if (!isNaN(parsedBudget) && parsedBudget > 0) {
      onBudgetSubmit(parsedBudget);
    } else {
      // Optionally, add a toast notification for invalid input
      console.error("Please enter a valid budget.");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Set Your Budget</CardTitle>
        <CardDescription className="text-center">How much do you plan to spend on this trip?</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="budget">Total Budget</Label>
            <Input
              id="budget"
              type="number"
              placeholder="e.g., 1500"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full mt-1"
              min="0"
            />
          </div>
          <Button type="submit" className="w-full">
            Set Budget
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BudgetInput;