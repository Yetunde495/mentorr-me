import admin from "firebase-admin";
import { NextResponse } from "next/server";

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
  try {
    const { searchParams } = new URL(request.url);

    // Paginated Query Parameters
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";
    const pageNum = parseInt(page, 10);
    const pageLimit = parseInt(limit, 10);
    const offset = (pageNum - 1) * pageLimit;

    // Filter/Search Parameters
    const role = searchParams.get("role");
    const assignedStatus = searchParams.get("assignedStatus");
    const search = searchParams.get("search");

    // --- 1. BUILD THE PAGINATED LIST QUERY ---
    let query: admin.firestore.Query = db
      .collection("users")
      .orderBy("createdAt", "desc");

    if (role === "mentor" || role === "mentee") {
      query = query.where("role", "==", role);
    }

    if (role === "mentee" && assignedStatus) {
      if (assignedStatus === "assigned") {
        query = query.where("assignedTo", "!=", null);
      }
      if (assignedStatus === "unassigned") {
        query = query.where("assignedTo", "==", null);
      }
    }

    if (search && typeof search === "string") {
      query = query
        .where("name", ">=", search)
        .where("name", "<=", search + "\uf8ff");
    }

    // Execute the paginated query
    const snapshot = await query.offset(offset).limit(pageLimit).get();
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    console.log(users)

    // --- 2. EXECUTE EFFICIENT AGGREGATE QUERIES FOR TOTALS ---

    // Array of promises for concurrent execution
    const [
      totalUsersSnapshot,
      totalMentorsSnapshot,
      totalMenteesSnapshot,
      totalUnassignedSnapshot,
    ] = await Promise.all([
      // Total Users
      db.collection("users").count().get(),

      // Total Mentors
      db.collection("users").where("role", "==", "mentor").count().get(),

      // Total Mentees
      db.collection("users").where("role", "==", "mentee").count().get(),

      // Total Unassigned Mentees
      db
        .collection("users")
        .where("role", "==", "mentee")
        .where("assignedTo", "==", null)
        .count()
        .get(),
    ]);

    const totalUsers = totalUsersSnapshot.data().count;
    const totalMentors = totalMentorsSnapshot.data().count;
    const totalMentees = totalMenteesSnapshot.data().count;
    const totalUnassigned = totalUnassignedSnapshot.data().count;

    // --- 3. RETURN RESPONSE ---
    return NextResponse.json(
      { users, totalUsers, totalMentors, totalMentees, totalUnassigned },
      { status: 200 }
    );
  } catch (error) {
    console.error("USER LIST FETCH ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch user list" },
      { status: 500 }
    );
  }
}
