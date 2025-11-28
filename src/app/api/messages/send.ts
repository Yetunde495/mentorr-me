import type { NextApiRequest, NextApiResponse } from "next";
import { pusher } from "@/lib/pusher";
import admin from "firebase-admin";

// ───────────────────────────────────────────────────────────
// INITIALIZE FIREBASE ADMIN ON SERVER
// ───────────────────────────────────────────────────────────
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

// ───────────────────────────────────────────────────────────
// SEND MESSAGE ENDPOINT
// ───────────────────────────────────────────────────────────
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // extract ID token from headers
    const idToken = (req.headers.authorization || "").replace("Bearer ", "");
    if (!idToken) return res.status(401).json({ error: "No token provided" });

    // verify Firebase user
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const { chatId, text } = req.body;
    if (!chatId || !text) {
      return res.status(400).json({ error: "chatId and text required" });
    }

    // message structure
    const message = {
      senderId: uid,
      text,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // save message to Firestore (server-side)
    const msgRef = await db
      .collection("chats")
      .doc(chatId)
      .collection("messages")
      .add(message);

    const savedMessage = {
      id: msgRef.id,
      ...message,
    };

    // trigger pusher event for realtime update
    await pusher.trigger(`private-chat-${chatId}`, "new-message", savedMessage);

    return res.status(200).json(savedMessage);
  } catch (error: any) {
    console.error("Send message error:", error);
    return res.status(500).json({ error: error.message });
  }
}

