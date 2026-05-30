import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserStats } from "@/actions/admin/user.actions";
import { Users, ShieldCheck, UserCheck } from "lucide-react";

export async function UserStats() {
    const result = await getUserStats();

    if (!result.success || !result.data) {
        return null;
    }

    const { totalUsers, adminCount, userCount } = result.data;

    const stats = [
        {
            title: "Total Users",
            value: totalUsers,
            icon: Users,
            description: "Total registered accounts",
            color: "text-blue-600",
            bg: "bg-blue-100 dark:bg-blue-900/20",
        },
        {
            title: "Customers",
            value: userCount,
            icon: UserCheck,
            description: "Active customer accounts",
            color: "text-emerald-600",
            bg: "bg-emerald-100 dark:bg-emerald-900/20",
        },
        {
            title: "Admins",
            value: adminCount,
            icon: ShieldCheck,
            description: "Privileged accounts",
            color: "text-purple-600",
            bg: "bg-purple-100 dark:bg-purple-900/20",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat) => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <div className={`p-2 rounded-md ${stat.bg}`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function UserStatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-3 w-32" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
