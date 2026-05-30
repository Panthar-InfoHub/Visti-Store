import { NextResponse } from "next/server";
import { prisma } from "@/prisma/db";

/**
 * Keep-Alive Endpoint
 * 
 * Purpose: Prevents Supabase from pausing the database after 7 days of inactivity.
 * 
 * Setup Instructions:
 * 1. Go to https://cron-job.org (free service)
 * 2. Create account and add a new cron job
 * 3. URL: https://yourdomain.com/api/keep-alive
 * 4. Schedule: Every 6 days (or use: 0 0 
 * 5. Enable the job
 * 
 * This endpoint performs a simple database query to keep the connection active.
 */
export async function GET() {
  try {
    // Simple query to keep database active
    const result = await prisma.$queryRaw`SELECT 1 as alive`;
    
    const timestamp = new Date().toISOString();
    
    console.log(`✅ Keep-alive ping successful at ${timestamp}`);
    
    return NextResponse.json({ 
      success: true, 
      message: "Database connection is alive",
      timestamp,
      result
    });
  } catch (error: any) {
    console.error("❌ Keep-alive failed:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to ping database",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
