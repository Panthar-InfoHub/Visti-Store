import { getUploadAuthParams } from "@imagekit/next/server";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

/**
 * API route to generate ImageKit upload authentication parameters
 * This is called by the client before uploading files
 * Only admins can upload images
 */
export async function GET() {
  try {
    // Check if user is admin
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    const { token, expire, signature } = getUploadAuthParams({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
      // expire: 30 * 60, // Optional: token expires in 30 minutes (default is 1 hour)
    });

    return NextResponse.json({
      token,
      expire,
      signature,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    });
  } catch (error) {
    console.error("ImageKit auth error:", error);
    return NextResponse.json({ error: "Failed to generate upload credentials" }, { status: 500 });
  }
}
