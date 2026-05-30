"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

export type TimeFilter = "today" | "30days" | "90days" | "lifetime";

interface TimeFilterProps {
  value: TimeFilter;
  onValueChange: (value: TimeFilter) => void;
}

export function TimeFilter({ value, onValueChange }: TimeFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={(v) => onValueChange(v as TimeFilter)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="30days">Last 30 Days</SelectItem>
          <SelectItem value="90days">Last 90 Days</SelectItem>
          <SelectItem value="lifetime">All Time</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
