"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Users } from "lucide-react";
import { useTransition, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface UsersTableFiltersProps {
  totalUsers: number;
}

export function UsersTableFilters({ totalUsers }: UsersTableFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset to first page on filter change

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const debouncedSearch = useCallback(
    (value: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        updateFilters("search", value);
      }, 500); // 500ms debounce
    },
    [searchParams]
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                defaultValue={searchParams.get("search") || ""}
                onChange={(e) => debouncedSearch(e.target.value)}
                className="pl-9"
                disabled={isPending}
              />
            </div>

            {/* Role Filter */}
            <Select
              defaultValue={searchParams.get("role") || "all"}
              onValueChange={(value) => updateFilters("role", value === "all" ? "" : value)}
              disabled={isPending}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="USER">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Total Count */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="font-medium">{totalUsers}</span>
            <span>users found</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
