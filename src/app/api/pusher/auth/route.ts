import Pusher from "pusher";
import admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

// initialize firebase-admin (use service account in env)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FB_PROJECT_ID,
      clientEmail: process.env.FB_CLIENT_EMAIL,
      privateKey: process.env.FB_PRIVATE_KEY?.replace(/\\n/g, "\n"),
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

const db = admin.firestore();

// --- Main POST Handler ---
export async function POST(req: NextRequest) {
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
    // 2. Parse the request body for Pusher parameters
    const form = await req.formData(); // <--- instead of req.json()
    const socket_id = form.get("socket_id")?.toString();
    const channel_name = form.get("channel_name")?.toString();

    if (!socket_id || !channel_name) {
      return NextResponse.json(
        { error: "Missing socket_id or channel_name" },
        { status: 400 }
      );
    }

    // 3. Verify Token and Get UID
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    // 4. Fetch User Profile from Firestore (for reliable name/role)
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User profile not found in database" },
        { status: 403 }
      );
    }
    const userProfile = userDoc.data();

    // 5. Authorize the Channel
    let authResponse;

    if (channel_name.startsWith("presence-")) {
      // Data for Presence Channels
      const presenceData = {
        user_id: uid,
        user_info: {
          id: uid,
          name: userProfile?.name || "User",
          role: userProfile?.role || "mentee",
        },
      };
      console.log(presenceData);
      // Authorize and get the response object
      authResponse = pusher.authorizeChannel(
        socket_id,
        channel_name,
        presenceData
      );
      console.log(authResponse);
    } else if (channel_name.startsWith("private-")) {
      authResponse = pusher.authorizeChannel(socket_id, channel_name);
      console.log(authResponse);
    } else {
      return NextResponse.json(
        { error: "Unauthorized channel type" },
        { status: 403 }
      );
    }

    // 6. Send the Pusher auth response
    return NextResponse.json(authResponse, { status: 200 });
  } catch (err) {
    console.error("Pusher Auth Error:", err);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}
