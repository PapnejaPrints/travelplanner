import React, { useState } from "react";
import DestinationInput from "@/components/DestinationInput";
import BudgetInput from "@/components/BudgetInput";
import ActivityInput from "@/components/ActivityInput"; // Import the new ActivityInput component
import ActivityList from "@/components/ActivityList"; // Import the new ActivityList component
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "@/types/travel"; // Import the Activity type

const TravelPlanner: React.FC = () => {
  const [currentDestination, setCurrentDestination] = useState<string | null>(null);
  const [currentBudget, setCurrentBudget] = useState<number | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  const handleDestinationSubmit = (destination: string) => {
    setCurrentDestination(destination);
    setCurrentBudget(null); // Reset budget when destination changes
    setActivities([]); // Reset activities when destination changes
    console.log("Destination submitted:", destination);
  };

  const handleBudgetSubmit = (budget: number) => {
    setCurrentBudget(budget);
    console.log("Budget submitted:", budget);
  };

  const handleAddActivity = (activity: Activity) => {
    setActivities((prevActivities) => [...prevActivities, activity]);
  };

  const handleDeleteActivity = (id: string) => {
    setActivities((prevActivities) => prevActivities.filter((activity) => activity.id !== id));
  };

  const handleReset = () => {
    setCurrentDestination(null);
    setCurrentBudget(null);
    setActivities([]);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="flex-grow flex flex-col items-center justify-center w-full gap-8">
        {!currentDestination ? (
          <DestinationInput onDestinationSubmit={handleDestinationSubmit} />
        ) : !currentBudget ? (
          <BudgetInput onBudgetSubmit={handleBudgetSubmit} />
        ) : (
          <>
            <Card className="w-full max-w-md mx-auto text-center p-6">
              <CardHeader>
                <CardTitle className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Your Trip to {currentDestination}
                </CardTitle>
                <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
                  Budget: <span className="font-bold text-green-600 dark:text-green-400">${currentBudget.toLocaleString()}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleReset} className="mt-4">
                  Start Over
                </Button>
              </CardContent>
            </Card>
            <ActivityInput onAddActivity={handleAddActivity} />
            <ActivityList activities={activities} onDeleteActivity={handleDeleteActivity} />
          </>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default TravelPlanner;