/**
 * Image upload service — connects to your backend API.
 * Replace API_BASE_URL with your actual backend endpoint.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface UploadedImage {
  url: string;
  name: string;
  size: number;
  createdAt: string;
}

/**
 * Upload a single image blob to the server.
 * Falls back to blob URL if backend is unavailable.
 */
export async function uploadImage(blob: Blob): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", blob);

    const response = await fetch(`${API_BASE_URL}/api/upload-image`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.warn("Image upload failed, using local blob URL:", error);
    // Fallback to local blob URL
    return URL.createObjectURL(blob);
  }
}

/**
 * Fetch list of previously uploaded images from server.
 */
export async function fetchImageLibrary(): Promise<UploadedImage[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/images`);
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Save template to backend.
 */
export async function saveTemplate(
  id: string,
  data: Record<string, any>,
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/templates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Send test email via backend.
 */
export async function sendTestEmail(
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/send-test-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, html }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
