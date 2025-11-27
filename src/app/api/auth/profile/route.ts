import { headers } from "next/headers";
import { NextResponse } from "next/server";

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

export async function GET(request: Request) {
  // 1. Get headers using next/headers utility
  const headersList = headers();
  const authorization = (await headersList).get("authorization") || "";

  try {
    const idToken = authorization.replace("Bearer ", "");
    // Check for an empty token before calling Firebase
    if (!idToken) {
      return NextResponse.json(
        { error: "Authorization token missing" },
        { status: 401 }
      );
    }

    // 2. Firebase Admin SDK to verify token
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    // 3. Fetch user profile stored in Firestore
    const userDoc = await admin.firestore().collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 4. Return data
    // Use NextResponse for App Router
    return NextResponse.json({ id: uid, ...userDoc.data() }, { status: 200 });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    // Be careful not to expose internal errors.
    return NextResponse.json(
      { error: error },
      { status: 401 }
    );
  }
}

// export function handler(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     const idToken = (req.headers.authorization || "").replace("Bearer ", "");
//     const decoded = await admin.auth().verifyIdToken(idToken);
//     const uid = decoded.uid;
//     console.log(uid)

//     // Fetch user profile stored in Firestore
//     const userDoc = await admin.firestore().collection("users").doc(uid).get();
//   //  const userDoc=  await db.collection("users").doc(uid).get();
//    console.log(userDoc)
//     if (!userDoc.exists) {
//       return res.status(404).json({ error: "Profile not found" });
//     }

//     return res.status(200).json({ id: uid, ...userDoc.data() });
//   } catch (error: any) {
//     console.log("GET PROFILE ERROR:", error);
//     return res.status(401).json({ error: "Invalid or expired token" });
//   }
// }
