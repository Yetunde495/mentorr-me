"use client";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { setCookie } from "cookies-next";
import { setUser } from "@/features/authSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { loginUser, signInWithGoogle } from "@/lib/services";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

export default function AdminSignin() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: { email: string; password: string }) => {
    setLoading(true);

    try {
      const { user, token, profile } = await loginUser(
        data.email,
        data.password
      );

      // Save cookies
      setCookie("access_token", token, {
        maxAge: 2 * 24 * 60 * 60,
        path: "/",
      });

      setCookie("user_id", user.uid, {
        maxAge: 2 * 24 * 60 * 60,
        path: "/",
      });

      // Save Redux state
      dispatch(setUser({ ...profile, uid: user.uid }));

      // Redirect based on role
      if (profile?.role === 'admin') {
        router.push("admin/dashboard"); // redirect to profile setup page
      } 
    } catch (err:any) {
      console.error("Login error:", err);
      toast.error(err?.message || 'An error occured')
    } finally {
      setLoading(false);
    }
  };

  const GoogleSignin = async () => {
    setLoading(true);
    try {
      const { user, token, profile } = await signInWithGoogle();

      setCookie("access_token", token, { maxAge: 2 * 24 * 60 * 60, path: "/" });
      setCookie("user_id", user.uid, { maxAge: 2 * 24 * 60 * 60, path: "/" });

      dispatch(setUser({ ...profile, uid: user.uid }));

      if (!profile.accountSetup) {
        router.push("setup-account"); // redirect to profile setup page
      } else {
        router.push(
          profile.role === "mentor" ? "/mentor/dashboard" : "/mentee/dashboard"
        );
      }
    } catch (e) {
      console.error("Google sign-in failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100  dark:bg-transparent transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-neutral-800 md:rounded-2xl shadow-md w-full max-w-4xl grid md:grid-cols-2 overflow-hidden"
      >
        {/* Left */}
        <div className="w-full h-full overflow-hidden p-2 md:rounded-l-2xl bg-white dark:bg-black">
          <div className="w-full h-full   text-black rounded-xl bg-radial from-orange-200 via-orange-300 to-orange-500 dark:from-orange-300 dark:via-orange-700 dark:to-orange-500">
            <div className="backdrop-blur-2xl rounded-xl p-4 h-full w-full bg-white/10 flex flex-col gap-3 justify-between">
              <Link href={`/`} className="flex items-center gap-1">
                <Image
                  alt="logo-image"
                  src={"/logo.png"}
                  height={40}
                  width={30}
                />
                <p className="text-xl text-white font-semibold font-serif italic tracking-tighter">
                  PivotLab
                </p>
              </Link>
              <div className="pb-6">
                <h2 className="text-zinc-900 text-lg mb-1">
                  Pick up right where you stopped
                </h2>
                <p className="text-xl sm:text-3xl md:text-4xl font-semibold ">
                  Manage mentors and mentees with ease!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="p-10 dark:text-white flex flex-col justify-center items-center bg-white dark:bg-black md:rounded-r-2xl overflow-y-auto">
          <h2 className="text-2xl text-center font-semibold py-4">
            Sign in to your account
          </h2>

          {/* Google */}
          <button
            onClick={GoogleSignin}
            className="w-full flex items-center mb-6 justify-center border dark:border-neutral-600 p-3 rounded-lg gap-3 font-medium"
          >
            <FcGoogle size={22} /> Continue with Google
          </button>
          <div className="flex items-center justify-center mt-3 w-full">
            <span className="mx-2 text-lg text-center rounded-md py-1 px-2 ">
              OR
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                {...register("email")}
                className="w-full border dark:border-neutral-600 bg-transparent mt-1 p-3 rounded-lg"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                {...register("password")}
                className="w-full border dark:border-neutral-600 bg-transparent mt-1 p-3 rounded-lg"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black dark:bg-white cursor-pointer disabled:bg-opacity-50 dark:text-black text-white py-3 rounded-lg shadow-md"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="mt-4 text-sm text-center">
            Don't have an account?{" "}
            <a href="/signup" className="text-orange-600 underline">
              Sign up
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}