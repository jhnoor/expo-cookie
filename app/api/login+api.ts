export function GET(request: Request) {
  return new Response(JSON.stringify({ message: "Hello, world!" }), {
    headers: {
      "content-type": "application/json",
      "set-cookie": "om=nom",
    },
  });
}
