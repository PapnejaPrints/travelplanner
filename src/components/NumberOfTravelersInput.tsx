import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface NumberOfTravelersInputProps {
  onTravelersSubmit: (count: number) => void;
}

const NumberOfTravelersInput: React.FC<NumberOfTravelersInputProps> = ({ onTravelersSubmit }) => {
  const [travelers, setTravelers] = useState<string>("1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTravelers = parseInt(travelers, 10);
    if (!isNaN(parsedTravelers) && parsedTravelers > 0) {
      onTravelersSubmit(parsedTravelers);
    } else {
      toast.error("Please enter a valid number of travelers (at least 1).");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">How many people are traveling?</CardTitle>
        <CardDescription className="text-center">This will help us tailor your itinerary and costs.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="travelers">Number of Travelers</Label>
            <Input
              id="travelers"
              type="number"
              placeholder="e.g., 2"
              value={travelers}
              onChange={(e) => setTravelers(e.target.value)}
              className="w-full mt-1"
              min="1"
            />
          </div>
          <Button type="submit" className="w-full">
            Confirm Travelers
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NumberOfTravelersInput;