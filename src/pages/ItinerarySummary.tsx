import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO, isSameDay, isBefore } from "date-fns";
import { Activity, CombinedActivity } from "@/types/travel";
import { AIItinerary, AISuggestion } from "@/types/ai";
import { ArrowLeft, Plane, Hotel, Utensils, CalendarDays, Users, DollarSign, MapPin, Clock } from "lucide-react";

interface ItinerarySummaryState {
  origin: string;
  destination: string;
  budget: number;
  startDate: Date;
  endDate: Date;
  numberOfTravelers: number;
  generatedItinerary: AIItinerary;
  userActivities: Activity[];
}

const ItinerarySummary: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ItinerarySummaryState;

  if (!state) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 text-center">
        <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">No Itinerary Data Found</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">Please go back and plan your trip first.</p>
        <Button onClick={() => navigate("/travel-planner")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Planner
        </Button>
      </div>
    );
  }

  const {
    origin,
    destination,
    budget,
    startDate,
    endDate,
    numberOfTravelers,
    generatedItinerary,
    userActivities,
  } = state;

  // Combine AI activities and user activities
  const allActivities: CombinedActivity[] = useMemo(() => {
    const aiActivities: CombinedActivity[] = generatedItinerary.activities.map((act) => ({
      id: `ai-${act.name}-${Math.random().toString(36).substring(7)}`, // Unique ID for AI activities
      name: act.name,
      description: act.description,
      date: startDate ? format(startDate, "yyyy-MM-dd") : "TBD", // Placeholder, AI doesn't provide specific dates
      time: "12:00", // Placeholder, AI doesn't provide specific times
      cost: act.estimatedCost,
      source: 'ai',
    }));

    const userAddedActivities: CombinedActivity[] = userActivities.map((act) => ({
      id: act.id,
      name: act.name,
      date: act.date,
      time: act.time,
      cost: act.cost,
      source: 'user',
    }));

    // For simplicity, AI activities are placed on the start date.
    // In a more complex app, AI might suggest dates or user could assign them.
    return [...aiActivities, ...userAddedActivities].sort((a, b) => {
      const dateA = parseISO(a.date);
      const dateB = parseISO(b.date);
      if (isBefore(dateA, dateB)) return -1;
      if (isBefore(dateB, dateA)) return 1;
      // If same day, sort by time
      return a.time.localeCompare(b.time);
    });
  }, [generatedItinerary.activities, userActivities, startDate]);

  // Group activities by day
  const activitiesByDay = useMemo(() => {
    const days: { [key: string]: CombinedActivity[] } = {};
    allActivities.forEach(activity => {
      const dateKey = activity.date;
      if (!days[dateKey]) {
        days[dateKey] = [];
      }
      days[dateKey].push(activity);
    });
    return days;
  }, [allActivities]);

  // Calculate totals
  const totalActivitiesCost = allActivities.reduce((sum, activity) => sum + activity.cost, 0);
  const coreItineraryTotal =
    (generatedItinerary.transportation.exactCost || generatedItinerary.transportation.estimatedCost) +
    (generatedItinerary.accommodation.exactCost || generatedItinerary.accommodation.estimatedCost) +
    generatedItinerary.food.estimatedCost;
  const grandTotal = coreItineraryTotal + totalActivitiesCost;

  const tripDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end day

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-3xl mx-auto my-8">
        <Button onClick={() => navigate("/travel-planner")} variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Planner
        </Button>

        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
              Your Trip to {destination}
            </CardTitle>
            <CardDescription className="text-xl text-gray-700 dark:text-gray-300">
              A detailed summary of your adventure!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
              <p className="flex items-center"><MapPin className="mr-2 h-5 w-5 text-blue-500" /> <strong>Origin:</strong> {origin}</p>
              <p className="flex items-center"><MapPin className="mr-2 h-5 w-5 text-green-500" /> <strong>Destination:</strong> {destination}</p>
              <p className="flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-purple-500" /> <strong>Dates:</strong> {format(startDate, "MMM dd, yyyy")} - {format(endDate, "MMM dd, yyyy")} ({tripDuration} days)</p>
              <p className="flex items-center"><Users className="mr-2 h-5 w-5 text-orange-500" /> <strong>Travelers:</strong> {numberOfTravelers}</p>
              <p className="flex items-center"><DollarSign className="mr-2 h-5 w-5 text-red-500" /> <strong>Budget:</strong> ${budget.toLocaleString()}</p>
            </div>
            <div className="border-t pt-4 mt-4">
              <h3 className="text-2xl font-bold text-center mb-4">Cost Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
                <p className="flex items-center"><Plane className="mr-2 h-5 w-5 text-blue-600" /> <strong>Transportation:</strong> ${generatedItinerary.transportation.exactCost?.toLocaleString() || generatedItinerary.transportation.estimatedCost.toLocaleString()}</p>
                <p className="flex items-center"><Hotel className="mr-2 h-5 w-5 text-purple-600" /> <strong>Accommodation:</strong> ${generatedItinerary.accommodation.exactCost?.toLocaleString() || generatedItinerary.accommodation.estimatedCost.toLocaleString()}</p>
                <p className="flex items-center"><Utensils className="mr-2 h-5 w-5 text-orange-600" /> <strong>Food:</strong> ${generatedItinerary.food.estimatedCost.toLocaleString()}</p>
                <p className="flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-teal-600" /> <strong>Activities:</strong> ${totalActivitiesCost.toLocaleString()}</p>
              </div>
              <Card className="mt-6 bg-green-100 dark:bg-green-900/20 border-green-400 dark:border-green-700 text-green-800 dark:text-green-200 p-4 text-center">
                <CardTitle className="text-3xl font-bold">
                  Grand Total: ${grandTotal.toLocaleString()}
                </CardTitle>
              </Card>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">Day-by-Day Timeline</h2>

        {Object.keys(activitiesByDay).length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-lg text-gray-600 dark:text-gray-400">No activities planned for this trip yet.</p>
          </Card>
        ) : (
          Object.keys(activitiesByDay).sort().map((dateKey) => (
            <Card key={dateKey} className="mb-6">
              <CardHeader className="bg-gray-100 dark:bg-gray-800 border-b">
                <CardTitle className="text-xl font-semibold flex items-center">
                  <CalendarDays className="mr-2 h-5 w-5 text-indigo-500" />
                  {format(parseISO(dateKey), "EEEE, MMM dd, yyyy")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {activitiesByDay[dateKey].map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-md bg-white dark:bg-gray-700 shadow-sm">
                    <Clock className="h-5 w-5 text-gray-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {activity.time} - {activity.name}
                        {activity.source === 'ai' && <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200">AI Suggestion</span>}
                      </p>
                      {activity.description && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">{activity.description}</p>
                      )}
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">${activity.cost.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ItinerarySummary;