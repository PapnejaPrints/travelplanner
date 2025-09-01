import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface OriginInputProps {
  onOriginSubmit: (origin: string) => void;
}

const OriginInput: React.FC<OriginInputProps> = ({ onOriginSubmit }) => {
  const [origin, setOrigin] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin.trim()) {
      onOriginSubmit(origin.trim());
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Where are you starting from?</CardTitle>
        <CardDescription className="text-center">Enter your departure city to begin your journey.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder="e.g., London, San Francisco"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full"
          />
          <Button type="submit" className="w-full">
            Set Origin
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OriginInput;