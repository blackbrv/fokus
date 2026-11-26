import { IMAGE_TYPES } from "@/hooks/timer/shared";

// Serves an uploaded task image (stored in Firestore images/{id}) as a plain
// image URL, so <img>, link previews and AI agents can all fetch it.
// Public read by id is allowed by firestore.rules; images never change, so cache forever.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!/^[a-f0-9]{32}$/.test(id) || !project) return new Response("Not found", { status: 404 });

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/images/${id}` +
      `?mask.fieldPaths=type&mask.fieldPaths=data&key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
    { cache: "no-store" },
  );
  if (!res.ok) return new Response("Not found", { status: 404 });
  const { fields } = await res.json();
  const type: string | undefined = fields?.type?.stringValue;
  const data: string | undefined = fields?.data?.bytesValue;
  if (!type || !data || !IMAGE_TYPES.includes(type)) return new Response("Not found", { status: 404 });

  return new Response(Buffer.from(data, "base64"), {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
