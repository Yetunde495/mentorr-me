// pages/api/pusher/typing.ts
import { pusher } from "@/lib/pusher";
import type { NextApiRequest, NextApiResponse } from "next";

// Replace with your real auth
function getUser(req: NextApiRequest) {
  return { id: "user-123", name: "Yetunde" };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const user = getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { channel } = req.body;
  if (!channel) return res.status(400).json({ error: "Missing channel" });

  try {
    // you can throttle this endpoint on server if needed
    await pusher.trigger(channel, "typing", {
      userId: user.id,
      name: user.name,
      at: new Date().toISOString(),
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed" });
  }
}
