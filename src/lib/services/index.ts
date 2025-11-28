import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

type registerUserProps = {
  email: string;
  password: string;
  role: "mentor" | "mentee" | "admin";
  name: string;
};

export async function registerUser({
  email,
  password,
  role,
  name,
}: registerUserProps) {
  try {
    const userCred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCred.user;

    // Get token for server auth
    const token = await user.getIdToken();

    // Create user profile in server API
    const profile = await fetch("/api/auth/create-profile", {
      method: "POST", // ← ADD THIS
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json", // ← ALSO ADD THIS
      },
      body: JSON.stringify({ role, name }),
    }).then((res) => res.json());

    // Return both auth + profile data
    return {
      user,
      token,
      profile,
    };
  } catch (error: any) {
    console.error("REGISTRATION ERROR:", error);
    throw error;
  }
}

export async function loginUser(email: string, password: string) {
  try {
    // Firebase login
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    // Get fresh ID token
    const token = await user.getIdToken(true);

    // Fetch profile from backend
    const profile = await fetch("/api/auth/profile", {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json());

    // Return both auth + profile data
    return {
      user,
      token,
      profile,
    };
  } catch (error: any) {
    console.error("LOGIN ERROR:", error);
    throw error; // allow UI to display it
  }
}

export async function resetPassword(email: string) {
  return await sendPasswordResetEmail(auth, email);
}

export async function signInWithGoogle(role?: string) {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Always refresh token after Google sign-in
    const token = await user.getIdToken(true);

    // Tell backend to create/update profile
    const profile = await fetch("/api/auth/google-login", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    }).then((res) => res.json());

    return {
      user,
      token,
      profile,
    };
  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error);
    throw error;
  }
}

export async function updateUserProfile(data: any) {
  const user = auth.currentUser;
  const token = await user?.getIdToken();

  await fetch("/api/auth/update-profile", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}
