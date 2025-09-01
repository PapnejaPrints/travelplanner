export interface Activity {
  id: string;
  name: string;
  date: string; // Using string for simplicity, could be Date object later
  time: string;
  cost: number;
}