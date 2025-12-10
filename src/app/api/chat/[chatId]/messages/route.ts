import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/firebase-server";

// Name of the Firestore collection for chat documents
const CHAT_COLLECTION = "chats";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { chatId } = resolvedParams;
    const user = await getAuthenticatedUser(request);
    if (!user) {
      console.warn("DEBUG: Unauthorized access attempt.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Authorization check: Ensure the user is part of this chat.
    if (!chatId.includes(user.id)) {
      console.warn(
        `DEBUG: Forbidden access attempt. User ${user.id} not in chat ${chatId}`
      );
      return NextResponse.json(
        { error: "Forbidden: Not a member of this chat." },
        { status: 403 }
      );
    }

    // --- 2. FETCH CHAT DOCUMENT ---
    const chatDocRef = db.collection(CHAT_COLLECTION).doc(chatId);
    const chatDoc = await chatDocRef.get();

    if (!chatDoc.exists) {
      console.log(
        `DEBUG: Chat document ${chatId} does not exist. Returning empty history.`
      );
      return NextResponse.json(
        { messages: [], chatInfo: null },
        { status: 200 }
      );
    }

    const data = chatDoc.data()!;

    // --- 3. RETURN MESSAGES ---
    return NextResponse.json(
      {
        messages: data.chats || [],
        chatInfo: {
          mentorInfo: data.mentorInfo,
          menteeInfo: data.menteeInfo,
          formData: data.formData,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("FETCH MESSAGES ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history." },
      { status: 500 }
    );
  }
}
