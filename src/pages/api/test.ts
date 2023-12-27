import type { APIRoute } from "astro";

export async function GET() {
  return new Response(JSON.stringify({ msg: "Hello world!" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
export const POST: APIRoute = async ({ params, request }) => {
  const body = await request.json();
  console.log(params);
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
