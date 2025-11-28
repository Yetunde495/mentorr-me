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

    // Validate input
    if (!mentorId) {
      return NextResponse.json(
        { error: "Mentor ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists and is a mentee
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    // if (userData?.role !== "mentee") {
    //   return NextResponse.json(
    //     { error: "Can only assign mentors to mentees" },
    //     { status: 400 }
    //   );
    // }

    // Check if mentor exists and is actually a mentor
    const mentorDoc = await db.collection("users").doc(mentorId).get();
    if (!mentorDoc.exists) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    const mentorData = mentorDoc.data();
    // if (mentorData?.role !== "mentor") {
    //   return NextResponse.json(
    //     { error: "Selected user is not a mentor" },
    //     { status: 400 }
    //   );
    // }

    const batch = db.batch();

    // Get the previous mentor ID if any (for cleanup)
    const previousMentorId = userData?.assignedTo?.id;

    // 1. Update mentee's assignedTo field
    const menteeRef = db.collection("users").doc(userId);
    batch.update(menteeRef, {
      assignedTo: {
        id: mentorId,
        name: mentorData?.name,
        email: mentorData?.email,
        profession: mentorData?.profession || "",
        photoURL: mentorData?.photoURL || "",
        bio: mentorData?.bio || "",
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 2. Add mentee to mentor's assignedMentees array
    const mentorRef = db.collection("users").doc(mentorId);
    const newMentee = {
      id: userId,
      name: userData?.name,
      email: userData?.email,
      photoURL: userData?.photoURL || "",
      skillFocus: userData?.skillFocus || "Not specified",
    };

    batch.update(mentorRef, {
      assignedMentees: admin.firestore.FieldValue.arrayUnion(newMentee),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 3. If there was a previous mentor, remove mentee from their assignedMentees
    if (previousMentorId) {
      const previousMentorRef = db.collection("users").doc(previousMentorId);
      const previousMentee = {
        id: userId,
        name: userData.name,
        email: userData.email,
        profession: userData.profession || "",
        photoURL: userData?.photoURL || "",
      };

      batch.update(previousMentorRef, {
        assignedMentees: admin.firestore.FieldValue.arrayRemove(previousMentee),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Commit all changes
    await batch.commit();

    return NextResponse.json(
      {
        message: "Mentor assigned successfully",
        mentee: {
          id: userId,
          name: userData?.name,
          assignedTo: mentorId,
          assignedToName: mentorData?.name,
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
