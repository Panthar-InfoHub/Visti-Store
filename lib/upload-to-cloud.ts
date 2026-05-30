"use client";
import {
  upload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
} from "@imagekit/next";

/**
 * Fetch authentication parameters from the server
 */
async function getAuthParams() {
  const response = await fetch("/api/imagekit-auth");
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Auth request failed: ${errorText}`);
  }
  const data = await response.json();
  return data;
}

/**
 * Upload multiple files to ImageKit
 * @param files - Array of File objects to upload
 * @returns Object with successful and failed uploads
 */
export async function uploadFilesToCloud({ files }: { files: File[] }) {
  // Step 1: Upload all files
  const uploadResults = await Promise.allSettled(
    files.map(async (file) => {
      try {
        // Step 2: Get fresh authentication parameters for EACH file
        // ImageKit requires a unique token for each upload request
        const { signature, expire, token, publicKey } = await getAuthParams();

        const uploadResponse = await upload({
          file,
          fileName: file.name,
          signature,
          expire,
          token,
          publicKey,
          folder: "/products", // Upload to products folder
          useUniqueFileName: true, // Auto-generate unique names
        });

        return {
          file,
          path: uploadResponse.url!, // Full ImageKit URL - store this in DB
          url: uploadResponse.url!, // Full ImageKit URL
        };
      } catch (error: any) {
        // Handle different error types
        let errorMessage = "Upload failed";

        if (error instanceof ImageKitAbortError) {
          errorMessage = "Upload aborted";
        } else if (error instanceof ImageKitInvalidRequestError) {
          errorMessage = `Invalid request: ${error.message}`;
        } else if (error instanceof ImageKitUploadNetworkError) {
          errorMessage = `Network error: ${error.message}`;
        } else if (error instanceof ImageKitServerError) {
          errorMessage = `Server error: ${error.message}`;
        } else if (error.message) {
          errorMessage = error.message;
        }

        throw new Error(errorMessage);
      }
    })
  );

  // Step 3: Collect success & failure
  const success: { file: File; path: string; url: string }[] = [];
  const failed: { file: File; error: string }[] = [];

  uploadResults.forEach((result, index) => {
    const originalFile = files[index];
    if (result.status === "fulfilled") {
      success.push(result.value);
    } else {
      failed.push({ file: originalFile, error: result.reason.message });
    }
  });

  return { success, failed };
}

/**
 * Upload a single file to ImageKit
 * @param file - File object to upload
 * @param folder - Folder path in ImageKit (default: "/uploads")
 * @returns Object with success status and URL or error
 */
export async function uploadToCloud(
  file: File,
  folder: string = "/uploads"
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Get authentication parameters
    const authParams = await getAuthParams();
    const { signature, expire, token, publicKey } = authParams;

    // Upload the file
    const uploadResponse = await upload({
      file,
      fileName: file.name,
      signature,
      expire,
      token,
      publicKey,
      folder,
      useUniqueFileName: true,
    });

    return {
      success: true,
      url: uploadResponse.url,
    };
  } catch (error: any) {
    let errorMessage = "Upload failed";

    if (error instanceof ImageKitAbortError) {
      errorMessage = "Upload aborted";
    } else if (error instanceof ImageKitInvalidRequestError) {
      errorMessage = `Invalid request: ${error.message}`;
    } else if (error instanceof ImageKitUploadNetworkError) {
      errorMessage = `Network error: ${error.message}`;
    } else if (error instanceof ImageKitServerError) {
      errorMessage = `Server error: ${error.message}`;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}
