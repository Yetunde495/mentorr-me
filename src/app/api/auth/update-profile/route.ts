import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { headers } from "next/headers";

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

export async function POST(request: Request) {
  // 1. Get the Authorization header
  const headersList = headers();
  const authorization = (await headersList).get("authorization") || "";
  const idToken = authorization.replace("Bearer ", "");

  if (!idToken) {
    return NextResponse.json(
      { error: "Authorization token missing" },
      { status: 401 }
    );
  }

  try {
    // 2. Verify the Firebase ID token and get the UID
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    // 3. Get the request body
    const updateData = await request.json();

    // 4. Update the user document in Firestore

    await db
      .collection("users")
      .doc(uid)
      .set(
        {
          ...updateData,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true } // This creates if doesn't exist, updates if it does
      );

    // 5. Success response
    return NextResponse.json(
      { success: true, message: "Profile updated successfully" },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("Update profile error:", e);

    // Handle common Firebase auth token issues
    const status = e.code && e.code.includes("auth") ? 401 : 500;

    return NextResponse.json(
      { error: e.message || "An error occurred during profile update." },
      { status: status }
    );
  }
}

// Optional: Explicitly deny other methods to reinforce 405 error
export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
export async function PUT() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
export async function DELETE() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
