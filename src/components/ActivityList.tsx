import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "@/types/travel";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ActivityListProps {
  activities: Activity[];
  onDeleteActivity: (id: string) => void;
}

const ActivityList: React.FC<ActivityListProps> = ({ activities, onDeleteActivity }) => {
  if (activities.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto text-center p-6">
        <CardContent>
          <p className="text-lg text-gray-600 dark:text-gray-400">No activities added yet. Start planning!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">Your Activities</h3>
      {activities.map((activity) => (
        <Card key={activity.id} className="flex items-center justify-between p-4">
          <div>
            <CardTitle className="text-xl">{activity.name}</CardTitle>
            <CardContent className="p-0 text-gray-700 dark:text-gray-300">
              <p>{activity.date} at {activity.time}</p>
              <p className="font-semibold">${activity.cost.toLocaleString()}</p>
            </CardContent>
          </div>
          <Button variant="destructive" size="icon" onClick={() => onDeleteActivity(activity.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </Card>
      ))}
    </div>
  );
};

export default ActivityList;