import { NextRequest } from "next/server";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });

    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error: any) {
    throw new Error("Failed to initialize Firebase Admin SDK:", error);
  }
}

// Define the structure for the authenticated user object
interface AuthUser {
  id: string;
  name: string;
}

/**
 * Extracts the Firebase ID token from the Authorization header and verifies it
 * using the Firebase Admin SDK.
 * * NOTE: The client MUST send the ID token in the 'Authorization: Bearer [token]' header.
 * * @param request The incoming NextRequest object.
 * @returns An object with the user's ID and Name, or null if verification fails.
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthUser | null> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn(
      "Auth check failed: Missing or malformed Authorization header."
    );
    return null;
  }

  // Extract the ID token
  const idToken = authHeader.split(" ")[1];

  try {
    // 2. Verify the ID Token using the Admin SDK
    // This is a secure check against Firebase servers.
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // 3. Extract user details from the decoded token payload
    const userId = decodedToken.uid;

    // Use the display name or email from the token's claims, falling back to the UID.
    const userName = decodedToken.name || decodedToken.email || userId;

    return {
      id: userId,
      name: userName as string,
    };
  } catch (error) {
    // This catches expired tokens, invalid signatures, or network issues
    console.error("Firebase ID Token verification failed:", error);
    return null;
  }
}
