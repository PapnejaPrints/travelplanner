import React, { useState } from "react";
import DestinationInput from "@/components/DestinationInput";
import { MadeWithDyad } from "@/components/made-with-dyad";

const TravelPlanner: React.FC = () => {
  const [currentDestination, setCurrentDestination] = useState<string | null>(null);

  const handleDestinationSubmit = (destination: string) => {
    setCurrentDestination(destination);
    // In a real app, you would fetch data or navigate here
    console.log("Destination submitted:", destination);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="flex-grow flex items-center justify-center w-full">
        {!currentDestination ? (
          <DestinationInput onDestinationSubmit={handleDestinationSubmit} />
        ) : (
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Planning your trip to <span className="text-blue-600 dark:text-blue-400">{currentDestination}</span>!
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Great choice! We'll start building your itinerary for this destination.
            </p>
            <Button onClick={() => setCurrentDestination(null)} className="mt-6">
              Plan Another Trip
            </Button>
          </div>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default TravelPlanner;