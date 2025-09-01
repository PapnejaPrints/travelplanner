import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button"; // Import Button
import { Link } from "react-router-dom"; // Import Link

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="flex-grow flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">Welcome to Your Travel Planner</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Let's plan your next adventure!
        </p>
        <Link to="/travel-planner">
          <Button size="lg" className="px-8 py-4 text-lg">
            Start Planning
          </Button>
        </Link>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;