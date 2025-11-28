import { pusher } from "@/lib/pusher";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { channel, message } = req.body;

  if (!channel || !message) return res.status(400).json({ error: "Missing channel or message" });

  try {
    await pusher.trigger(channel, "new-message", message);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("pusher send error", err);
    return res.status(500).json({ error: "Failed to trigger" });
  }
}

