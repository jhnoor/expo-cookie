import { getBFFTokenFromCookie } from "@/utils/helpers";

export async function GET(request: Request) {
  try {
    const cookie = request.headers.get("cookie");
    const token = getBFFTokenFromCookie(cookie);

    if (!token) {
      console.error("No cookie found!");
      return Response.json(null, { status: 401 });
    }

    const response = await fetch("http://localhost:3000/api/users", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (!response.ok) {
      return CreateErrorResponse({ message: response.statusText } as Error);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return CreateErrorResponse(error as Error);
  }
}

function CreateErrorResponse(error: Error) {
  console.error(error);
  return Response.json(
    { error: error.message || "An error occurred." },
    {
      status: 500,
    }
  );
}
