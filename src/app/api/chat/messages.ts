import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { chatId } = req.query;

    if (!chatId || typeof chatId !== "string") {
      return res.status(400).json({ error: "chatId is required" });
    }

    // fetch messages ordered by timestamp
    const snap = await db
      .collection("chats")
      .doc(chatId)
      .collection("messages")
      .orderBy("createdAt", "asc")
      .get();

    const messages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return res.status(200).json(messages);
  } catch (error: any) {
    console.error("Get chat messages error:", error);
    return res.status(500).json({ error: error.message });
  }
}
