import React, { useMemo, useEffect } from "react"; // Import useEffect
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO, isBefore } from "date-fns";
import { Activity, CombinedActivity } from "@/types/travel";
import { AIItinerary } from "@/types/ai";
import { ArrowLeft, Plane, Hotel, Utensils, CalendarDays, Users, DollarSign, MapPin, Clock } from "lucide-react";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

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

  // Scroll to top when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const allActivities: CombinedActivity[] = useMemo(() => {
    const userAddedActivities: CombinedActivity[] = userActivities.map((act) => ({
      id: act.id,
      name: act.name,
      description: undefined,
      date: act.date,
      time: act.time,
      cost: act.cost,
      source: 'user',
    }));

    return userAddedActivities.sort((a, b) => {
      const dateA = parseISO(a.date);
      const dateB = parseISO(b.date);
      if (isBefore(dateA, dateB)) return -1;
      if (isBefore(dateB, dateA)) return 1;
      return a.time.localeCompare(b.time);
    });
  }, [userActivities]);

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

  const totalActivitiesCost = allActivities.reduce((sum, activity) => sum + activity.cost, 0);
  const transportationCost = generatedItinerary.transportation.exactCost || generatedItinerary.transportation.estimatedCost;
  const accommodationCost = generatedItinerary.accommodation.exactCost || generatedItinerary.accommodation.estimatedCost;
  const foodCost = generatedItinerary.food.estimatedCost;
  const coreItineraryTotal = transportationCost + accommodationCost + foodCost;
  const grandTotal = coreItineraryTotal + totalActivitiesCost;

  const tripDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Data for the pie chart
  const pieChartData = [
    { name: 'Transportation', value: transportationCost },
    { name: 'Accommodation', value: accommodationCost },
    { name: 'Food', value: foodCost },
    { name: 'Activities', value: totalActivitiesCost },
  ];

  // Colors for the pie chart segments
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']; // Blue, Green, Yellow, Orange

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
              <div className="h-64 w-full"> {/* Added a fixed height for the chart container */}
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
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