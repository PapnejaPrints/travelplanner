import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AISuggestion } from "@/types/ai";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

interface AISuggestionsProps {
  destination: string;
  budget: number;
  onAddSuggestedActivity: (suggestion: AISuggestion) => void;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({ destination, budget, onAddSuggestedActivity }) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    setSuggestions([]); // Clear previous suggestions
    try {
      const { data, error } = await supabase.functions.invoke("suggest-activities", {
        body: { destination, budget },
      });

      if (error) {
        console.error("Error invoking Edge Function:", error);
        toast.error("Failed to get AI suggestions. Please try again.");
        return;
      }

      setSuggestions(data as AISuggestion[]);
      toast.success("AI suggestions loaded!");
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred while fetching suggestions.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">AI Activity Suggestions</CardTitle>
        <CardDescription className="text-center">
          Let Gemini suggest some activities for your trip to {destination}.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button onClick={fetchSuggestions} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting Suggestions...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Get AI Suggestions
            </>
          )}
        </Button>

        {suggestions.length > 0 && (
          <div className="space-y-3 mt-4">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Suggested Activities:</h4>
            {suggestions.map((suggestion, index) => (
              <div key={index} className="border rounded-md p-3 bg-gray-50 dark:bg-gray-800">
                <p className="font-medium text-gray-900 dark:text-gray-100">{suggestion.name}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion.description}</p>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">${suggestion.estimatedCost.toLocaleString()}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => onAddSuggestedActivity(suggestion)}
                >
                  Add to My Plan
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AISuggestions;