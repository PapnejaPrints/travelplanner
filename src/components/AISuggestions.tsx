import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AISuggestion } from "@/types/ai";
import { toast } from "sonner";
import { Loader2 } from "lucide-react"; // Removed Sparkles as button is removed

interface AISuggestionsProps {
  destination: string;
  budget: number;
  onAddSuggestedActivity: (suggestion: AISuggestion) => void;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({ destination, budget, onAddSuggestedActivity }) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const fetchSuggestions = async (numToFetch: number | null = null, append: boolean = false) => {
    setIsLoading(true);
    if (!append) {
      setSuggestions([]); // Clear previous suggestions if not appending
    }
    try {
      const body: { destination: string; budget: number; count?: number } = { destination, budget };
      if (numToFetch !== null) {
        body.count = numToFetch;
      }

      const { data, error } = await supabase.functions.invoke("suggest-activities", {
        body,
      });

      if (error) {
        console.error("Error invoking Edge Function:", error);
        toast.error("Failed to get AI suggestions. Please try again.");
        return;
      }

      const newSuggestions = data as AISuggestion[];
      if (append) {
        setSuggestions((prev) => [...prev, ...newSuggestions]);
      } else {
        setSuggestions(newSuggestions);
      }
      // toast.success("AI suggestions loaded!"); // Removed for automatic loading to avoid spamming toasts
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred while fetching suggestions.");
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically fetch suggestions when destination or budget changes
  useEffect(() => {
    if (destination && budget) {
      fetchSuggestions(3); // Fetch 3 suggestions initially
    }
  }, [destination, budget]);

  const handleAddAndReplace = async (addedSuggestion: AISuggestion) => {
    setIsAdding(true);
    onAddSuggestedActivity(addedSuggestion); // Add to parent's list

    // Remove the added suggestion from the local state
    setSuggestions((prev) => prev.filter((s) => s.name !== addedSuggestion.name || s.description !== addedSuggestion.description));

    // Fetch one new suggestion to replace it
    try {
      const { data, error } = await supabase.functions.invoke("suggest-activities", {
        body: { destination, budget, count: 1 }, // Request only 1 new suggestion
      });

      if (error) {
        console.error("Error fetching replacement suggestion:", error);
        toast.error("Failed to get a new AI suggestion.");
        return;
      }

      const newSuggestion = (data as AISuggestion[])[0]; // Assuming it returns an array with one item
      if (newSuggestion) {
        setSuggestions((prev) => [...prev, newSuggestion]);
      }
    } catch (error) {
      console.error("Unexpected error fetching replacement:", error);
      toast.error("An unexpected error occurred while fetching a new suggestion.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">AI Activity Suggestions</CardTitle>
        <CardDescription className="text-center">
          Here are some activities Gemini suggests for your trip to {destination}.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading && suggestions.length === 0 ? ( // Show loader only if no suggestions are loaded yet
          <div className="flex justify-center items-center p-4">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-blue-500 dark:text-blue-400" />
            <span className="text-lg text-gray-600 dark:text-gray-400">Getting Suggestions...</span>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-3 mt-4">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Suggested Activities:</h4>
            {suggestions.map((suggestion, index) => (
              <div key={suggestion.name + index} className="border rounded-md p-3 bg-gray-50 dark:bg-gray-800">
                <p className="font-medium text-gray-900 dark:text-gray-100">{suggestion.name}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion.description}</p>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">${suggestion.estimatedCost.toLocaleString()}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => handleAddAndReplace(suggestion)}
                  disabled={isAdding}
                >
                  {isAdding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Add to My Plan"
                  )}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">No suggestions available. Try adjusting your budget or destination.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AISuggestions;