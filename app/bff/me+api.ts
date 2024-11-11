import { API_SERVER } from "@/constants/paths";
import { getBFFTokenFromCookie } from "@/utils/helpers";

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie");
  const token = getBFFTokenFromCookie(cookie);

  if (!token) {
    console.error("No cookie found!");
    return Response.json(null, { status: 401 });
  }

  const response = await fetch(`${API_SERVER}/api/me`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  if (!response.ok) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json(await response.json());
}
