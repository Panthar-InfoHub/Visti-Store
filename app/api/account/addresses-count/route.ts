import { NextResponse } from "next/server";
import { prisma } from "@/prisma/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 });
    }

    const count = await prisma.address.count({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching address count:", error);
    return NextResponse.json({ count: 0 });
  }
}
