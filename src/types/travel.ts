export interface Activity {
  id: string;
  name: string;
  date: string; // Using string for simplicity, format as 'YYYY-MM-DD'
  time: string;
  cost: number;
}