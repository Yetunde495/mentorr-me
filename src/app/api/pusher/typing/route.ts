import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import admin from "firebase-admin";
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
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

const TYPING_EVENT = 'typing';

export async function POST(request: NextRequest) {
  try {
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

    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;
    const userDoc = await admin.firestore().collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // ... rest of the function (Input Validation & Pusher Broadcast) ...
    const body = await request.json();
    const { channel } = body;
    const user = userDoc.data();

    if (!channel || !user) {
        return NextResponse.json(
            { error: "Missing channel or user data" },
            { status: 400 }
        );
    }

    // ... (validation) ...

    await pusher.trigger(channel, TYPING_EVENT, {
      userId: uid, // <-- Uses the verified ID
      name: user.name, // <-- Uses the verified Name
      at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    // ... (error handling) ...
    return NextResponse.json(
      { error: "Failed to broadcast typing event" },
      { status: 500 }
    );
  }
}
