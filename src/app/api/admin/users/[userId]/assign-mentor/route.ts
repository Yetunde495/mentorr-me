import admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { userId } = resolvedParams;
    const { mentorId } = await request.json();

    if (!mentorId) {
      return NextResponse.json(
        { error: "Mentor ID is required" },
        { status: 400 }
      );
    } // Check and fetch mentee data

    const menteeDoc = await db.collection("users").doc(userId).get();
    if (!menteeDoc.exists) {
      return NextResponse.json({ error: "Mentee not found" }, { status: 404 });
    }
    const menteeData = menteeDoc.data()!;
    const menteeInfoForChat = {
      name: menteeData.name,
      profession: menteeData.profession || "",
      skillFocus: menteeData.skillFocus || "",
      bio: menteeData.bio || "",
      photoURL: menteeData.photoURL || "",
    }; // Check and fetch mentor data

    const mentorDoc = await db.collection("users").doc(mentorId).get();
    if (!mentorDoc.exists) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }
    const mentorData = mentorDoc.data()!;
    const mentorInfoForChat = {
      name: mentorData.name,
      profession: mentorData.profession || "",
      skillFocus: mentorData.skillFocus || "",
      bio: mentorData.bio || "",
      photoURL: mentorData.photoURL || "",
    };

    const chatDocId = [mentorId, userId].sort().join("_");
    const chatRef = db.collection("chats").doc(chatDocId);

    // Get the previous assignment data for cleanup
    const previousMentorId = menteeData?.assignedTo?.id;
    const previousChatId = menteeData?.assignedTo?.chatId;

    const batch = db.batch(); // Get the previous mentor ID if any (for cleanup)

    const menteeRef = db.collection("users").doc(userId);
    batch.update(menteeRef, {
      assignedTo: {
        id: mentorId,
        name: mentorData?.name,
        email: mentorData?.email,
        chatId: chatDocId,
        profession: mentorData?.profession || "",
        photoURL: mentorData?.photoURL || "",
        bio: mentorData?.bio || "",
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }); // 2. Add mentee to mentor's assignedMentees array (Mentor: mentorId)

    const mentorRef = db.collection("users").doc(mentorId);
    const newMentee = {
      id: userId,
      name: menteeData?.name,
      email: menteeData?.email,
      chatId: chatDocId,
      photoURL: menteeData?.photoURL || "",
      skillFocus: menteeData?.skillFocus || "Not specified",
    };

    batch.update(mentorRef, {
      assignedMentees: admin.firestore.FieldValue.arrayUnion(newMentee),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }); // 3. Previous Mentor Cleanup (if any)

    if (previousMentorId) {
      // ... (Cleanup logic remains the same) ...
      const previousMentorRef = db.collection("users").doc(previousMentorId);
      const previousMentee = {
        id: userId,
        name: menteeData.name,
        chatId: previousChatId,
        email: menteeData.email,
        profession: menteeData.profession || "",
        photoURL: menteeData?.photoURL || "",
      };
      batch.update(previousMentorRef, {
        assignedMentees: admin.firestore.FieldValue.arrayRemove(previousMentee),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // --- 4. CREATE/ENSURE CHAT DOCUMENT EXISTS ---

    // Check if the chat document already exists
    const existingChatDoc = await chatRef.get();

    if (!existingChatDoc.exists) {
      // create the document if it doesn't already exist
      const initialChatData = {
        chatId: chatDocId,
        mentorId: mentorId,
        menteeId: userId,
        participants: [mentorId, userId],
        mentorInfo: mentorInfoForChat,
        menteeInfo: menteeInfoForChat,
        // placeholders for data that will be added later
        formData: {
          category: "",
          description: "",
          name: "",
          tags: [],
          properties: {
            experience: "",
            learning_format: "",
            reason: [],
          },
        },
        chats: [], // Start with an empty message array
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastMessageAt: null, // No messages yet
      };

      // Add the chat creation to the batch
      batch.set(chatRef, initialChatData);
      console.log(`New chat document created for ${chatDocId}`);
    } else {
      console.log(
        `Chat document for ${chatDocId} already exists. Skipping creation.`
      );
    }

    await batch.commit();

    return NextResponse.json(
      {
        message: "Mentor assigned successfully and chat ensured.",
        mentee: {
          id: userId,
          name: menteeData?.name,
          assignedTo: mentorId,
          assignedToName: mentorData?.name,
          chatId: chatDocId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("ASSIGN MENTOR ERROR:", error);
    return NextResponse.json(
      { error: "Failed to assign mentor" },
      { status: 500 }
    );
  }
}
