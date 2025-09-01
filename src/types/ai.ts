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
    exactCost?: number; // New field for exact flight cost
  };
  accommodation: {
    type: string;
    name: string;
    description: string;
    estimatedCost: number;
    exactCost?: number; // New field for exact accommodation cost
  };
  food: {
    description: string;
    estimatedCost: number;
  };
  activities: AISuggestion[];
}