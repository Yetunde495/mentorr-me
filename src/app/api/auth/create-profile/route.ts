import { NextResponse } from "next/server";
import { headers } from "next/headers";
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

export async function POST(request: Request) {
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
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    // 3. Get the request body (for initial data like 'role')
    const body = await request.json();
    const role = body.role;
    const name = body.name;
    const email = body.email;

    if (!role || !name)
      return NextResponse.json(
        { error: "Missing role or name" },
        { status: 400 }
      );

    await db.collection("users").doc(uid).set({
      uid,
      name,
      role,
      email,
      bio: "",
      profession: "",
      skillFocus: "",
      photoURL: "",
      accountSetup: false,
      assignedTo: null,
      assignedMentees: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      { success: true, message: "Profile created successfully" },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("Login/Profile Sync error:", e);

    // Handle common Firebase auth token issues
    const status = e.code && e.code.includes("auth") ? 401 : 500;

    return NextResponse.json(
      { error: e.message || "An error occurred while creating profile" },
      { status: status }
    );
  }
}
