import { BACKEND_URLS } from "@/src/lib/config";

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function gqlFetch(
  query: string,
  variables?: Record<string, unknown>
): Promise<any> {
  const response = await fetch(BACKEND_URLS.local, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();

  // Check for Unauthorized error and redirect to login
  if (result.errors) {
    const message = result.errors[0]?.message || "";
    if (
      message === "Unauthorized" ||
      message.includes("Unauthorized") ||
      message.includes("jwt") ||
      message.includes("token")
    ) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      throw new Error("Unauthorized");
    }
  }

  return result;
}
