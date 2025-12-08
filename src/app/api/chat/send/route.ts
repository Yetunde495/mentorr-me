import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import Pusher from "pusher";

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

// INITIALIZE PUSHER
// Get credentials from environment variables
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

interface ChatMessage {
  id: string;
  channel: string;
  senderId: string;
  receiverId: string;
  senderType: "mentor" | "student";
  type: string; // MessageType
  content?: string;
  fileUrl?: string | null;
  createdAt: string;
  status?: "sending" | "sent" | "delivered" | "read" | "failed";
}

interface ChatSendRequestBody {
  mentorId: string;
  menteeId: string;
  message: ChatMessage;
  initialFormData?: any; // Use a more specific type if possible
}

// Name of the Pusher event to trigger client updates
const CHAT_EVENT = "new-message";

// Name of the Firestore collection for chat documents
const CHAT_COLLECTION = "chats";

export async function POST(request: Request) {
  try {
    const body: ChatSendRequestBody = await request.json();
    const { mentorId, menteeId, message, initialFormData } = body;

    // --- 1. VALIDATE & PREPARE DATA ---
    if (!mentorId || !menteeId || !message || !message.content) {
      return NextResponse.json(
        { error: "Missing required chat parameters." },
        { status: 400 }
      );
    }

    // Generate a consistent ID for the chat document
    // Sorting ensures the ID is the same regardless of who sends the first message
    const chatDocId = [mentorId, menteeId].sort().join("_");
    const chatDocRef = db.collection(CHAT_COLLECTION).doc(chatDocId);

    // Prepare the message for database storage
    const dbMessage: Omit<ChatMessage, "channel" | "status"> = {
      senderId: message.senderId,
      id: message.id,
      receiverId: message.receiverId,
      senderType: message.senderType,
      type: message.type,
      content: message.content || '',
      fileUrl: message.fileUrl || null,
      createdAt: new Date().toISOString(), // Use server time for accuracy
    };

    // --- 2. FIREBASE: PERSIST MESSAGE (Atomic Update) ---
    // This transaction handles both new chat creation and message appending
    await db.runTransaction(async (transaction) => {
      const chatDoc = await transaction.get(chatDocRef);

      if (!chatDoc.exists) {
        // A. NEW CHAT: This is the first message. Fetch user info and create the document.
        if (!initialFormData) {
          throw new Error("Missing initialFormData for a new chat document.");
        }

        // Fetch user data (You need to implement this helper function)
        const [mentorSnap, menteeSnap] = await Promise.all([
          db.collection("users").doc(mentorId).get(),
          db.collection("users").doc(menteeId).get(),
        ]);

        if (!mentorSnap.exists || !menteeSnap.exists) {
          throw new Error("Mentor or Mentee user data not found.");
        }

        const mentorData = mentorSnap.data()!;
        const menteeData = menteeSnap.data()!;

        const newChatData = {
          mentorId,
          menteeId,
          mentorInfo: {
            name: mentorData.name,
            profession: mentorData.profession,
            skillFocus: mentorData.skillFocus,
            bio: mentorData.bio,
            photoUrl: mentorData.photoUrl,
          },
          menteeInfo: {
            name: menteeData.name,
            profession: menteeData.profession,
            skillFocus: menteeData.skillFocus,
            bio: menteeData.bio,
            photoUrl: menteeData.photoUrl,
          },
          formData: initialFormData,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          lastMessageAt: dbMessage.createdAt,
          chats: [dbMessage], // Start the array with the first message
        };

        transaction.set(chatDocRef, newChatData);
      } else {
        // B. EXISTING CHAT: Append the new message to the existing array.
        transaction.update(chatDocRef, {
          chats: admin.firestore.FieldValue.arrayUnion(dbMessage),
          lastMessageAt: dbMessage.createdAt,
        });
      }
    });

    // --- 3. PUSHER: BROADCAST MESSAGE (Real-time update) ---
    // The channel name must match the one used by clients for subscription
    const pusherChannel = `chat-${chatDocId}`;

    // The message sent to Pusher includes the temporary client ID for confirmation
    await pusher.trigger(pusherChannel, CHAT_EVENT, {
      message: dbMessage,
      tempId: message.id,
    });

    // --- 4. RETURN SUCCESS RESPONSE ---
    return NextResponse.json(
      {
        message: "Message sent and broadcasted successfully",
        persistedMessage: dbMessage,
        chatDocId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("CHAT SEND ERROR:", error);
    return NextResponse.json(
      { error: "Failed to send chat message." },
      { status: 500 }
    );
  }
}
