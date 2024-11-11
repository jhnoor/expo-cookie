export async function GET(request: Request) {
  try {
    const cookie = request.headers.get("cookie");
    if (!cookie?.includes("om=nom")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch("http://localhost:3000/api/users", {
      method: "GET",
      headers: {
        authorization: "foo",
        "Content-Type": "application/json",
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
