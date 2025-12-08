import * as admin from 'firebase-admin';

// The common initialization variables used across your files
const config = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // CRITICAL: Ensure privateKey is correctly formatted with newlines replaced
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

// Initialize Admin SDK once
if (!admin.apps.length) {
    try {
        if (!config.privateKey || !config.projectId || !config.clientEmail) {
            throw new Error("Missing one or more required Firebase Admin environment variables.");
        }
        
        admin.initializeApp({
            credential: admin.credential.cert(config),
        });
        console.log("Firebase Admin SDK initialized successfully.");

    } catch (error) {
        // Log the error but DO NOT throw inside the module scope if possible, 
        // as throwing can prevent the entire server from starting up properly.
        console.error("FATAL ERROR: Failed to initialize Firebase Admin SDK.", error);
    }
}

// Export the initialized services
export const db = admin.firestore();
export const authAdmin = admin.auth();