import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import * as admin from "firebase-admin";
import Pusher from "pusher";
import { v4 as uuidv4 } from "uuid";


// Ensure Firebase Admin is initialized once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

// Pusher Initialization
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

const MESSAGE_EVENT = "new-message"; // Pusher event name for new messages
const db = admin.firestore();

// --- Main POST Handler ---

export async function POST(request: NextRequest) {
  try {
    const headersList = headers();
    const authorization = (await headersList).get("authorization") || "";
    const idToken = authorization.replace("Bearer ", "");

    if (!idToken) {
      return NextResponse.json(
        { error: "Authorization token missing" },
        { status: 401 }
      );
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const user = userDoc.data();
    if (!user) {
      return NextResponse.json({ error: "User data invalid" }, { status: 400 });
    }

    // 2. Input Validation and Message Data Setup
    const body = await request.json();
    const {
      channelId, // The Firestore document ID (e.g., mentorId_menteeId)
      messageContent,
      messageType = "text", // 'text', 'image', 'audio', etc.
      fileUrl,
      senderType, // 'mentor' or 'mentee'
      partnerId, // The ID of the other user in the chat
      tempMessageId, // The ID created optimistically on the client
    } = body;

    // Basic required fields
    if (
      !channelId ||
      !messageContent ||
      !senderType ||
      !partnerId ||
      !tempMessageId
    ) {
      return NextResponse.json(
        { error: "Missing required message fields" },
        { status: 400 }
      );
    }

    const messageId = uuidv4();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const sentAt = new Date().toISOString();

    const newMessage = {
      id: messageId,
      tempId: tempMessageId,
      content: messageContent,
      type: messageType,
      fileUrl: fileUrl || null,
      senderId: uid,
      senderName: user.name,
      senderType: senderType,
      channelId: channelId,
      timestamp: timestamp,
      read: false,
      readBy: [uid],
    };

    // 4. Persistence (Firestore Transaction)
    const messagesRef = db
      .collection("chats")
      .doc(channelId)
      .collection("messages");
    const chatDocRef = db.collection("chats").doc(channelId);

    await db.runTransaction(async (transaction) => {
      const messageDocRef = messagesRef.doc(messageId);
      transaction.set(messageDocRef, newMessage);

      transaction.set(
        chatDocRef,
        {
          lastMessage: {
            senderId: uid,
            content:
              messageType === "text"
                ? messageContent
                : `${senderType} sent a ${messageType}.`,
            timestamp: timestamp,
            read: false,
          },
          [uid]: {
            lastRead: timestamp,
          },
          [partnerId]: {
            lastRead: admin.firestore.FieldValue.delete(),
          },
        },
        { merge: true }
      );
    });

    // 5. Pusher Broadcast
    const pusherChannelName = `presence-chat-${channelId}`;

    const broadcastPayload = {
      ...newMessage,
      timestamp: sentAt,
    };

    await pusher.trigger(pusherChannelName, MESSAGE_EVENT, broadcastPayload, {
      socket_id: body.socket_id,
    });

    // 6. Response
    return NextResponse.json(
      {
        ok: true,
        messageId: messageId,
        tempMessageId: tempMessageId,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Failed to send message:", err);
    return NextResponse.json(
      { error: "Failed to broadcast or persist message" },
      { status: 500 }
    );
  }
}
