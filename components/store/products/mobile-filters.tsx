"use client";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import { ProductFilters } from "./product-filters";

interface MobileFiltersProps {
    categories: { id: string; name: string; slug: string }[];
}

export function MobileFilters({ categories }: MobileFiltersProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 overflow-y-auto">
                <SheetHeader className="px-4 py-4 border-b border-gray-100">
                    <SheetTitle>Filter Products</SheetTitle>
                </SheetHeader>
                <div className="overflow-y-auto">
                    <ProductFilters categories={categories} isMobile />
                </div>
            </SheetContent>
        </Sheet>
    );
}
