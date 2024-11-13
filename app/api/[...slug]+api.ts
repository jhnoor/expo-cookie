import { API_SERVER } from "@/constants/paths";
import { getBFFTokenFromCookie } from "@/utils/helpers";

// 5.2. The AuthBFF forwards the request to the API server
// This file is a catch-all for all API requests that are headed towards the backend server
// It forwards the request - after adding the access token - to the API server and returns the response to the client
// The filepath api/[..slug]+api.ts is special and tells Expo to match all paths that start with /api

// Common handler function
async function handleRequest(request: Request) {
  console.log(`${request.method} request to ${request.url}`);
  const url = new URL(request.url);

  // Extract the path after /api to append to the new URL
  const apiPath = url.pathname.replace(/^\/api/, "");

  const forwardUrl = `${API_SERVER}/api${apiPath}${url.search}`;
  console.log(`Forwarding request from ${url.pathname} to ${forwardUrl}`);

  const cookie = request.headers.get("cookie");
  const token = getBFFTokenFromCookie(cookie);

  const headers = new Headers(request.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.delete("cookie"); // Remove cookie header to avoid forwarding it

  // Create the init object for the fetch request
  const init: RequestInit = {
    method: request.method,
    headers: headers,
    redirect: "follow",
  };

  // For methods that have a body, include the body
  if (request.method !== "GET" && request.method !== "HEAD") {
    // Read the body and pass it along
    const body = await request.text();
    init.body = body;
  }

  // Forward the request to the backend server
  const response = await fetch(forwardUrl, init);

  // Return the response back to the client
  return response;
}

// Export functions for each HTTP method
export async function GET(request: Request) {
  return handleRequest(request);
}

export async function POST(request: Request) {
  return handleRequest(request);
}

export async function PUT(request: Request) {
  return handleRequest(request);
}

export async function DELETE(request: Request) {
  return handleRequest(request);
}

export async function PATCH(request: Request) {
  return handleRequest(request);
}
