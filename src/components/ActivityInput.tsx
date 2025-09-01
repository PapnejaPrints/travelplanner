import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Activity } from "@/types/travel";
import { toast } from "sonner";

interface ActivityInputProps {
  onAddActivity: (activity: Activity) => void;
}

const ActivityInput: React.FC<ActivityInputProps> = ({ onAddActivity }) => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [cost, setCost] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedCost = parseFloat(cost);

    if (!name.trim() || !date.trim() || !time.trim() || isNaN(parsedCost) || parsedCost < 0) {
      toast.error("Please fill in all activity details correctly.");
      return;
    }

    const newActivity: Activity = {
      id: Date.now().toString(), // Simple unique ID
      name: name.trim(),
      date: date.trim(),
      time: time.trim(),
      cost: parsedCost,
    };

    onAddActivity(newActivity);
    setName("");
    setDate("");
    setTime("");
    setCost("");
    toast.success("Activity added successfully!");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Add an Activity</CardTitle>
        <CardDescription className="text-center">Plan what you'll do on your trip.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="activity-name">Activity Name</Label>
            <Input
              id="activity-name"
              type="text"
              placeholder="e.g., Eiffel Tower Visit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1"
            />
          </div>
          <div>
            <Label htmlFor="activity-date">Date</Label>
            <Input
              id="activity-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1"
            />
          </div>
          <div>
            <Label htmlFor="activity-time">Time</Label>
            <Input
              id="activity-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full mt-1"
            />
          </div>
          <div>
            <Label htmlFor="activity-cost">Estimated Cost ($)</Label>
            <Input
              id="activity-cost"
              type="number"
              placeholder="e.g., 50"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full mt-1"
              min="0"
            />
          </div>
          <Button type="submit" className="w-full">
            Add Activity
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ActivityInput;