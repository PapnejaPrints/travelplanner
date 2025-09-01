export interface AISuggestion {
  name: string;
  description: string;
  estimatedCost: number;
}

export interface AIItinerary {
  transportation: {
    mode: string;
    details: string;
    estimatedCost: number;
  };
  accommodation: {
    type: string;
    name: string;
    description: string;
    estimatedCost: number;
  };
  food: {
    description: string;
    estimatedCost: number;
  };
  activities: AISuggestion[];
}