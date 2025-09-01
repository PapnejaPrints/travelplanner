import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { SelectRangeEventHandler } from "react-day-picker";
import { toast } from "sonner";

interface TravelDatesInputProps {
  onDatesSubmit: (startDate: Date, endDate: Date) => void;
}

const TravelDatesInput: React.FC<TravelDatesInputProps> = ({ onDatesSubmit }) => {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>(undefined);

  const handleSelect: SelectRangeEventHandler = (range) => {
    setDateRange(range);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dateRange?.from && dateRange?.to) {
      onDatesSubmit(dateRange.from, dateRange.to);
    } else {
      toast.error("Please select both a start and end date for your trip.");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">When are you traveling?</CardTitle>
        <CardDescription className="text-center">Select your trip's start and end dates.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange?.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick your dates</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button type="submit" className="w-full">
            Set Dates
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TravelDatesInput;