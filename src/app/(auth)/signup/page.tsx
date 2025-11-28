"use client";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaUserGraduate, FaUserTie } from "react-icons/fa";
import { registerUser } from "@/lib/services";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { setUser } from "@/features/authSlice";

const signupSchema = z.object({
  email: z.email("Invalid email"),
  name: z.string().min(3, "Enter your full name"),
  password: z.string().min(6, "Minimum 6 characters"),
  role: z.enum(["mentor", "mentee", "admin"], "Select a role"),
});

export default function Signup() {
  const dispatch = useDispatch();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(signupSchema) });
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState(true);
  const roleValue = watch("role");

  const roles = [
    {
      id: "mentee",
      label: "Learner",
      icon: <FaUserGraduate />,
      desc: "I want to learn, and get guidance from an experienced mentor",
    },
    {
      id: "mentor",
      label: "Mentor",
      icon: <FaUserTie />,
      desc: "I want to mentor learners in my field",
    },
  ];

  const onSubmit = async (data: {
    email: string;
    password: string;
    name: string;
    role: "mentor" | "mentee" | "admin";
  }) => {
    setLoading(true);
    try {
      // Call Firebase registration
      const { user, token, profile } = await registerUser({
        email: data.email,
        password: data.password,
        role: data.role,
        name: data.name,
      });

      // Save cookies
      setCookie("access_token", token, { maxAge: 2 * 24 * 60 * 60, path: "/" });
      setCookie("user_id", user.uid, { maxAge: 2 * 24 * 60 * 60, path: "/" });

      // Save Redux state
      dispatch(setUser({ ...profile, uid: user.uid }));
      router.push("/setup-account");
      
    } catch (error) {
      console.error("Signup error:", error);
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
                  Start your PivotLab Journey
                </h2>
                <p className="text-xl sm:text-3xl md:text-4xl font-semibold ">
                  Get Paired with the right mentor/learners
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="p-10 dark:text-white flex flex-col justify-center items-center bg-white dark:bg-black md:rounded-r-2xl overflow-y-auto">
          {!initial && (
            <div className="flex w-full items-center justify-end p-3">
              <p className="text-sm">You’re signing up as a </p>

              <button
                type="button"
                onClick={() => setInitial(true)}
                className="group ml-2 p-1.5 bg-slate-50 rounded-md"
              >
                <span className=" bg-orange-500 group-hover:bg-slate-50 group-hover:text-orange-500 text-white rounded-md p-1 capitalize">
                  {roles.find((r) => r.id === roleValue)?.label}
                </span>{" "}
                <span className=" cursor-pointer underline group-hover:bg-orange-500 text-orange-500 group-hover:text-white rounded-md p-1 capitalize">
                  Change
                </span>
              </button>
            </div>
          )}
          <h2 className="text-2xl text-center font-semibold py-4">
            Create an account
          </h2>

          {/* Google */}
          {!initial && (
            <button className="w-full flex items-center mb-6 justify-center border border-gray-200 dark:border-neutral-600 p-3 rounded-lg gap-3 font-medium">
              <FcGoogle size={22} /> Continue with Google
            </button>
          )}
          {!initial && (
            <div className="flex items-center justify-center mt-1 w-full">
              <span className="mx-2 text-lg text-center rounded-md py-1 px-2 ">
                OR
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
            {/* Role selection */}
            {initial && (
              <div className="grid gap-4 mb-6">
                {roles.map((role) => (
                  <label
                    key={role.id}
                    className={`border ${
                      roleValue === role.id
                        ? "border-orange-500"
                        : "border-slate-200 dark:border-neutral-700"
                    }  bg-white dark:bg-neutral-700 p-4 rounded-xl cursor-pointer flex gap-4 items-start hover:border-orange-500 transition-all`}
                  >
                    <input
                      type="radio"
                      value={role.id}
                      {...register("role")}
                      className="mt-1 hidden"
                    />
                    <div>
                      <div className="flex items-center gap-2 text-lg font-semibold">
                        {role.icon} {role.label}
                      </div>
                      <p className="text-sm opacity-70">{role.desc}</p>
                    </div>
                  </label>
                ))}
                {errors.role && (
                  <p className="text-red-500 text-sm">{errors.role.message}</p>
                )}

                <button
                  type="button"
                  disabled={!roleValue}
                  onClick={() => setInitial(false)}
                  className="w-full bg-black dark:bg-white disabled:bg-opacity-50 cursor-pointer dark:text-black text-white py-3 rounded-lg shadow-md"
                >
                  Next
                </button>
              </div>
            )}
            {!initial && (
              <div className="w-full space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium">Name</label>
                  <input
                    type="text"
                    {...register("name")}
                    placeholder="Enter your full name"
                    className="w-full border dark:border-neutral-600 bg-transparent mt-1 p-3 rounded-lg"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full border dark:border-neutral-600 bg-transparent mt-1 p-3 rounded-lg"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">
                      {errors.email.message}
                    </p>
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
                  className="w-full bg-black dark:bg-white dark:text-black text-white py-3 rounded-lg shadow-md"
                >
                  {isSubmitting ? "Creating account..." : "Create account"}
                </button>
              </div>
            )}
          </form>

          <p className="mt-4 text-sm text-center">
            Already have an account?{" "}
            <a href="/signin" className="text-orange-600 underline">
              Sign in
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
