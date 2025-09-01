export interface Activity {
  id: string;
  name: string;
  date: string; // Using string for simplicity, format as 'YYYY-MM-DD'
  time: string;
  cost: number;
}

export interface CombinedActivity {
  id: string;
  name: string;
  description?: string; // Optional, for AI suggestions
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  cost: number;
  source: 'ai' | 'user'; // To distinguish between AI and user-added activities
}