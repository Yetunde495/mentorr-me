import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
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
    
    // 1. Get the Authorization header
    const headersList = headers();
    const authorization = (await headersList).get('authorization') || "";
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

        // 3. Get the request body (for initial data like 'role')
        const body = await request.json();
        const role = body.role;

        // 4. Check if a profile document already exists
        const doc = await db.collection("users").doc(uid).get();

        if (!doc.exists) {
            // New user detected -> create profile
            await db.collection("users").doc(uid).set({
                uid,
                name: decoded.name || "",
                email: decoded.email,
                role: role || "mentee", // default if not provided
                authType: "google", // assuming this is a Google sign-in flow
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            // 5. Success response (Profile created)
            return NextResponse.json(
                { success: true, message: "Profile created successfully" }, 
                { status: 200 }
            );
        }

        // 5. Success response (Profile already exists, sync successful)
        return NextResponse.json(
            { success: true, message: "Profile synced successfully" }, 
            { status: 200 }
        );
        
    } catch (e: any) {
        console.error("Login/Profile Sync error:", e);
        
        // Handle common Firebase auth token issues
        const status = e.code && e.code.includes('auth') ? 401 : 500;
        
        return NextResponse.json(
            { error: e.message || "An error occurred during profile sync." }, 
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

