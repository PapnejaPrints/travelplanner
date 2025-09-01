import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AIItinerary, AISuggestion } from "@/types/ai";
import { toast } from "sonner";
import { Loader2, Sparkles, Plane, Hotel, Utensils } from "lucide-react";
import { format } from "date-fns";

interface AIItineraryGeneratorProps {
  origin: string;
  destination: string;
  budget: number;
  startDate: Date;
  endDate: Date;
  numberOfTravelers: number; // New prop
  onItineraryGenerated: (itinerary: AIItinerary) => void;
}

const AIItineraryGenerator: React.FC<AIItineraryGeneratorProps> = ({
  origin,
  destination,
  budget,
  startDate,
  endDate,
  numberOfTravelers, // Destructure new prop
  onItineraryGenerated,
}) => {
  const [itinerary, setItinerary] = useState<AIItinerary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    const fetchItinerary = async () => {
      setIsLoading(true);
      setItinerary(null); // Clear previous itinerary
      setErrorDetails(null); // Clear previous error details
      try {
        const { data, error } = await supabase.functions.invoke("generate-itinerary", {
          body: {
            origin,
            destination,
            budget,
            startDate: format(startDate, "yyyy-MM-dd"),
            endDate: format(endDate, "yyyy-MM-dd"),
            numberOfTravelers, // Pass to Edge Function
          },
        });

        if (error) {
          console.error("Error invoking Edge Function:", error);
          const errorMessage = error.message || "Unknown error from Edge Function.";
          const details = error.context?.body?.error || error.context?.body?.details || errorMessage;
          setErrorDetails(details);
          toast.error(`Failed to get AI itinerary: ${details}`);
          onItineraryGenerated(null);
          return;
        }

        if (data && typeof data === 'object' && 'error' in data) {
          const errorMessage = data.error || "AI response indicated an error.";
          const details = data.details || errorMessage;
          setErrorDetails(details);
          toast.error(`Failed to get AI itinerary: ${details}`);
          onItineraryGenerated(null);
          return;
        }

        setItinerary(data as AIItinerary);
        onItineraryGenerated(data as AIItinerary);
        toast.success("AI itinerary generated successfully!");
      } catch (error: any) {
        console.error("Unexpected error:", error);
        const errorMessage = error.message || "An unexpected error occurred while generating the itinerary.";
        setErrorDetails(errorMessage);
        toast.error(`An unexpected error occurred: ${errorMessage}`);
        onItineraryGenerated(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if all required props are available and no itinerary is already set
    if (origin && destination && budget && startDate && endDate && numberOfTravelers && !itinerary && !isLoading) {
      fetchItinerary();
    }
  }, [origin, destination, budget, startDate, endDate, numberOfTravelers, onItineraryGenerated, itinerary, isLoading]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto p-6 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500 dark:text-blue-400 mb-4" />
        <CardTitle className="text-xl font-bold">Generating Your Full Itinerary...</CardTitle>
        <CardDescription className="mt-2">This might take a moment as Gemini plans your perfect trip.</CardDescription>
      </Card>
    );
  }

  if (errorDetails) {
    return (
      <Card className="w-full max-w-md mx-auto p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-red-600 dark:text-red-400">Itinerary Generation Failed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{errorDetails}</span>
            <p className="text-sm mt-2">Please check your Supabase Edge Function logs and ensure your `GEMINI_API_KEY` is set correctly in Supabase Environment Variables.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!itinerary) {
    return null;
  }

  // Calculate total for transportation, accommodation, and food
  const coreItineraryTotal =
    (itinerary.transportation.exactCost || itinerary.transportation.estimatedCost) +
    (itinerary.accommodation.exactCost || itinerary.accommodation.estimatedCost) +
    itinerary.food.estimatedCost;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Your AI-Generated Itinerary</CardTitle>
        <CardDescription className="text-center">
          Here's a plan for {numberOfTravelers} people for your trip from {origin} to {destination} from {format(startDate, "MMM dd")} to {format(endDate, "MMM dd")}.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="space-y-6">
          {/* Transportation */}
          <div className="border rounded-md p-4 bg-blue-50 dark:bg-blue-900/20">
            <h5 className="font-semibold text-lg flex items-center mb-2">
              <Plane className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" /> Transportation
            </h5>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">{itinerary.transportation.mode}:</span> {itinerary.transportation.details}
            </p>
            <p className="font-bold text-blue-800 dark:text-blue-200 mt-1">
              Exact Cost: ${itinerary.transportation.exactCost?.toLocaleString() || itinerary.transportation.estimatedCost.toLocaleString()}
            </p>
          </div>

          {/* Accommodation */}
          <div className="border rounded-md p-4 bg-purple-50 dark:bg-purple-900/20">
            <h5 className="font-semibold text-lg flex items-center mb-2">
              <Hotel className="mr-2 h-5 w-5 text-purple-600 dark:text-purple-400" /> Accommodation
            </h5>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">{itinerary.accommodation.type} - {itinerary.accommodation.name}:</span> {itinerary.accommodation.description}
            </p>
            <p className="font-bold text-purple-800 dark:text-purple-200 mt-1">
              Exact Cost: ${itinerary.accommodation.exactCost?.toLocaleString() || itinerary.accommodation.estimatedCost.toLocaleString()}
            </p>
          </div>

          {/* Food */}
          <div className="border rounded-md p-4 bg-orange-50 dark:bg-orange-900/20">
            <h5 className="font-semibold text-lg flex items-center mb-2">
              <Utensils className="mr-2 h-5 w-5 text-orange-600 dark:text-orange-400" /> Food
            </h5>
            <p className="text-gray-700 dark:text-gray-300">{itinerary.food.description}</p>
            <p className="font-bold text-orange-700 dark:text-orange-300">
              Exact Cost: ${itinerary.food.estimatedCost.toLocaleString()}
            </p>
          </div>

          {/* Core Itinerary Total */}
          <Card className="bg-green-100 dark:bg-green-900/20 border-green-400 dark:border-green-700 text-green-800 dark:text-green-200 p-4 text-center">
            <CardTitle className="text-xl font-bold">
              Core Itinerary Total: ${coreItineraryTotal.toLocaleString()}
            </CardTitle>
            <CardDescription className="mt-1">
              (Transportation, Accommodation, and Food)
            </CardDescription>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIItineraryGenerator;