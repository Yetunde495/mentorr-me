// pages/api/pusher/receipt.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { pusher } from "@/lib/pusher";

// Replace with your real auth
function getUser(req: NextApiRequest) {
  return { id: "user-123", name: "Yetunde" };
}

/**
 * Expected body:
 * {
 *   channel: string,
 *   messageId: string,
 *   type: 'delivered' | 'read'
 * }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { channel, messageId, type } = req.body;
  if (!channel || !messageId || !type) return res.status(400).json({ error: "Missing fields" });

  try {
    await pusher.trigger(channel, "message-receipt", {
      messageId,
      type,
      userId: user.id,
      at: new Date().toISOString(),
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send receipt" });
  }
}
