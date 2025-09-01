import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AIItinerary, AISuggestion } from "@/types/ai";
import { toast } from "sonner";
import { Loader2, Sparkles, Plane, Hotel, Utensils, MapPin } from "lucide-react";
import { format } from "date-fns"; // Import format from date-fns

interface AIItineraryGeneratorProps {
  origin: string;
  destination: string;
  budget: number;
  startDate: Date; // New prop for start date
  endDate: Date;   // New prop for end date
  onAddSuggestedActivity: (suggestion: AISuggestion) => void;
}

const AIItineraryGenerator: React.FC<AIItineraryGeneratorProps> = ({
  origin,
  destination,
  budget,
  startDate,
  endDate,
  onAddSuggestedActivity,
}) => {
  const [itinerary, setItinerary] = useState<AIItinerary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

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
          startDate: format(startDate, "yyyy-MM-dd"), // Format dates for the API
          endDate: format(endDate, "yyyy-MM-dd"),     // Format dates for the API
        },
      });

      if (error) {
        console.error("Error invoking Edge Function:", error);
        const errorMessage = error.message || "Unknown error from Edge Function.";
        const details = error.context?.body?.error || error.context?.body?.details || errorMessage;
        setErrorDetails(details);
        toast.error(`Failed to get AI itinerary: ${details}`);
        return;
      }

      if (data && typeof data === 'object' && 'error' in data) {
        const errorMessage = data.error || "AI response indicated an error.";
        const details = data.details || errorMessage;
        setErrorDetails(details);
        toast.error(`Failed to get AI itinerary: ${details}`);
        return;
      }

      setItinerary(data as AIItinerary);
      toast.success("AI itinerary generated successfully!");
    } catch (error: any) {
      console.error("Unexpected error:", error);
      const errorMessage = error.message || "An unexpected error occurred while generating the itinerary.";
      setErrorDetails(errorMessage);
      toast.error(`An unexpected error occurred: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">AI Itinerary Generator</CardTitle>
        <CardDescription className="text-center">
          Let Gemini plan your full trip from {origin} to {destination} from {format(startDate, "MMM dd")} to {format(endDate, "MMM dd")} with a budget of ${budget.toLocaleString()}.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button onClick={fetchItinerary} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Itinerary...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Full Itinerary
            </>
          )}
        </Button>

        {errorDetails && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{errorDetails}</span>
            <p className="text-sm mt-2">Please check your Supabase Edge Function logs and ensure your `GEMINI_API_KEY` is set correctly in Supabase Environment Variables.</p>
          </div>
        )}

        {itinerary && (
          <div className="space-y-6 mt-4">
            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Your AI-Generated Itinerary:</h4>

            {/* Transportation */}
            <div className="border rounded-md p-4 bg-blue-50 dark:bg-blue-900/20">
              <h5 className="font-semibold text-lg flex items-center mb-2">
                <Plane className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" /> Transportation
              </h5>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">{itinerary.transportation.mode}:</span> {itinerary.transportation.details}
              </p>
              <p className="font-semibold text-blue-700 dark:text-blue-300">
                Estimated Cost: ${itinerary.transportation.estimatedCost.toLocaleString()}
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
              <p className="font-semibold text-purple-700 dark:text-purple-300">
                Estimated Cost: ${itinerary.accommodation.estimatedCost.toLocaleString()}
              </p>
            </div>

            {/* Food */}
            <div className="border rounded-md p-4 bg-orange-50 dark:bg-orange-900/20">
              <h5 className="font-semibold text-lg flex items-center mb-2">
                <Utensils className="mr-2 h-5 w-5 text-orange-600 dark:text-orange-400" /> Food
              </h5>
              <p className="text-gray-700 dark:text-gray-300">{itinerary.food.description}</p>
              <p className="font-semibold text-orange-700 dark:text-orange-300">
                Estimated Cost: ${itinerary.food.estimatedCost.toLocaleString()}
              </p>
            </div>

            {/* Activities */}
            <div className="space-y-3">
              <h5 className="font-semibold text-lg flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" /> Activities
              </h5>
              {itinerary.activities.map((activity, index) => (
                <div key={index} className="border rounded-md p-3 bg-gray-50 dark:bg-gray-800">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{activity.name}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{activity.description}</p>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    ${activity.estimatedCost.toLocaleString()}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => onAddSuggestedActivity(activity)}
                  >
                    Add to My Plan
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIItineraryGenerator;