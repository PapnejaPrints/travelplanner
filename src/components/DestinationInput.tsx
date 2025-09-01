import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DestinationInputProps {
  onDestinationSubmit: (destination: string) => void;
}

const DestinationInput: React.FC<DestinationInputProps> = ({ onDestinationSubmit }) => {
  const [destination, setDestination] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination.trim()) {
      onDestinationSubmit(destination.trim());
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Plan Your Trip</CardTitle>
        <CardDescription className="text-center">Enter your desired destination to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder="e.g., Paris, Tokyo, New York"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full"
          />
          <Button type="submit" className="w-full">
            Find Destination
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DestinationInput;