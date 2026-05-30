"use client";

import React from "react";
import { useDashboard } from "./dashboard-context";

interface DashboardTransitionWrapperProps {
    children: React.ReactNode;
    fallback: React.ReactNode;
}

export function DashboardTransitionWrapper({
    children,
    fallback,
}: DashboardTransitionWrapperProps) {
    const { isPending } = useDashboard();

    if (isPending) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
