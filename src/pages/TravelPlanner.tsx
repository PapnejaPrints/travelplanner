import React, { useState } from "react";
import DestinationInput from "@/components/DestinationInput";
import BudgetInput from "@/components/BudgetInput";
import OriginInput from "@/components/OriginInput";
import TravelDatesInput from "@/components/TravelDatesInput";
import NumberOfTravelersInput from "@/components/NumberOfTravelersInput";
import ActivityInput from "@/components/ActivityInput";
import ActivityList from "@/components/ActivityList";
import AIItineraryGenerator from "@/components/AIItineraryGenerator";
import AISuggestions from "@/components/AISuggestions";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "@/types/travel";
import { AIItinerary, AISuggestion } from "@/types/ai";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const TravelPlanner: React.FC = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [currentOrigin, setCurrentOrigin] = useState<string | null>(null);
  const [currentDestination, setCurrentDestination] = useState<string | null>(null);
  const [currentBudget, setCurrentBudget] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [numberOfTravelers, setNumberOfTravelers] = useState<number | null>(null);
  const [generatedItinerary, setGeneratedItinerary] = useState<AIItinerary | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  const handleOriginSubmit = (origin: string) => {
    setCurrentOrigin(origin);
    setCurrentDestination(null);
    setCurrentBudget(null);
    setStartDate(null);
    setEndDate(null);
    setNumberOfTravelers(null);
    setGeneratedItinerary(null);
    setActivities([]);
  };

  const handleDestinationSubmit = (destination: string) => {
    setCurrentDestination(destination);
    setCurrentBudget(null);
    setStartDate(null);
    setEndDate(null);
    setNumberOfTravelers(null);
    setGeneratedItinerary(null);
    setActivities([]);
  };

  const handleBudgetSubmit = (budget: number) => {
    setCurrentBudget(budget);
    setStartDate(null);
    setEndDate(null);
    setNumberOfTravelers(null);
    setGeneratedItinerary(null);
    setActivities([]);
  };

  const handleDatesSubmit = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
    setNumberOfTravelers(null);
    setGeneratedItinerary(null);
    setActivities([]);
  };

  const handleTravelersSubmit = (count: number) => {
    setNumberOfTravelers(count);
    setGeneratedItinerary(null);
    setActivities([]);
  };

  const handleItineraryGenerated = (itinerary: AIItinerary | null) => {
    setGeneratedItinerary(itinerary);
  };

  const handleAddActivity = (activity: Activity) => {
    setActivities((prevActivities) => [...prevActivities, activity]);
  };

  const handleDeleteActivity = (id: string) => {
    setActivities((prevActivities) => prevActivities.filter((activity) => activity.id !== id));
  };

  const handleAddSuggestedActivity = (suggestion: AISuggestion) => {
    const newActivity: Activity = {
      id: Date.now().toString(), // Simple unique ID
      name: suggestion.name,
      date: startDate ? format(startDate, "yyyy-MM-dd") : "TBD", // Use start date as placeholder
      time: "TBD", // Placeholder, user can edit later
      cost: suggestion.estimatedCost,
    };
    handleAddActivity(newActivity);
  };

  const handleReset = () => {
    setCurrentOrigin(null);
    setCurrentDestination(null);
    setCurrentBudget(null);
    setStartDate(null);
    setEndDate(null);
    setNumberOfTravelers(null);
    setGeneratedItinerary(null);
    setActivities([]);
  };

  const handleFinalizeItinerary = () => {
    if (currentOrigin && currentDestination && currentBudget && startDate && endDate && numberOfTravelers && generatedItinerary) {
      navigate("/itinerary-summary", {
        state: {
          origin: currentOrigin,
          destination: currentDestination,
          budget: currentBudget,
          startDate: startDate,
          endDate: endDate,
          numberOfTravelers: numberOfTravelers,
          generatedItinerary: generatedItinerary,
          userActivities: activities,
        },
      });
    }
  };

  // Calculate total cost of all activities added by the user
  const totalActivitiesCost = activities.reduce((sum, activity) => sum + activity.cost, 0);

  // Calculate core itinerary total (transportation, accommodation, food)
  const coreItineraryTotal = generatedItinerary
    ? (generatedItinerary.transportation.exactCost || generatedItinerary.transportation.estimatedCost) +
      (generatedItinerary.accommodation.exactCost || generatedItinerary.accommodation.estimatedCost) +
      generatedItinerary.food.estimatedCost
    : 0;

  const grandTotal = coreItineraryTotal + totalActivitiesCost;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="flex-grow flex flex-col items-center justify-center w-full gap-8">
        {!currentOrigin ? (
          <OriginInput onOriginSubmit={handleOriginSubmit} />
        ) : !currentDestination ? (
          <DestinationInput onDestinationSubmit={handleDestinationSubmit} />
        ) : !currentBudget ? (
          <BudgetInput onBudgetSubmit={handleBudgetSubmit} />
        ) : !startDate || !endDate ? (
          <TravelDatesInput onDatesSubmit={handleDatesSubmit} />
        ) : !numberOfTravelers ? (
          <NumberOfTravelersInput onTravelersSubmit={handleTravelersSubmit} />
        ) : !generatedItinerary ? (
          <AIItineraryGenerator
            origin={currentOrigin}
            destination={currentDestination}
            budget={currentBudget}
            startDate={startDate}
            endDate={endDate}
            numberOfTravelers={numberOfTravelers}
            onItineraryGenerated={handleItineraryGenerated}
          />
        ) : (
          <>
            <Card className="w-full max-w-md mx-auto text-center p-6">
              <CardHeader>
                <CardTitle className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Your Trip from {currentOrigin} to {currentDestination}
                </CardTitle>
                <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
                  Budget: <span className="font-bold text-green-600 dark:text-green-400">${currentBudget.toLocaleString()}</span>
                  <br />
                  Dates: <span className="font-bold">{format(startDate, "MMM dd, yyyy")} - {format(endDate, "MMM dd, yyyy")}</span>
                  <br />
                  Travelers: <span className="font-bold">{numberOfTravelers}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleReset} className="mt-4 mr-2">
                  Start Over
                </Button>
                <Button onClick={handleFinalizeItinerary} className="mt-4 ml-2">
                  Finalize Itinerary
                </Button>
              </CardContent>
            </Card>

            <AIItineraryGenerator
              origin={currentOrigin}
              destination={currentDestination}
              budget={currentBudget}
              startDate={startDate}
              endDate={endDate}
              numberOfTravelers={numberOfTravelers}
              onItineraryGenerated={handleItineraryGenerated}
            />

            <Card className="w-full max-w-md mx-auto bg-blue-100 dark:bg-blue-900/20 border-blue-400 dark:border-blue-700 text-blue-800 dark:text-blue-200 p-4 text-center">
              <CardTitle className="text-2xl font-bold">
                Grand Total: ${grandTotal.toLocaleString()}
              </CardTitle>
              <CardDescription className="mt-1">
                (Core Itinerary + Your Activities)
              </CardDescription>
            </Card>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4 text-center">
              Now, let's plan your activities!
            </h2>

            <AISuggestions
              destination={currentDestination}
              budget={currentBudget}
              onAddSuggestedActivity={handleAddSuggestedActivity}
            />
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