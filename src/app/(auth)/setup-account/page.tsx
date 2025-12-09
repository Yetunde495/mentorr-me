"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/features/authSlice";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { updateUserProfile } from "@/lib/services";
import { useRouter } from "next/navigation";

const profileSchema = z.object({
  profession: z.string().min(2, "Enter an area you can mentor in"),
  skillFocus: z.string().min(2, "Enter a field you want mentorship in"),
  bio: z.string().min(10, "Tell us a bit about yourself"),
});

export default function ProfileSetup() {
  const user = useSelector((state: any) => state.auth.user);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const onSubmit = async (data: {
    profession: string;
    bio: string;
    skillFocus: string;
  }) => {
    setLoading(true);
    try {
      // Call your API to update profile
      await updateUserProfile({ ...data, accountSetup: true });

      // Update redux state
      dispatch(setUser({ ...user, ...data }));

      if (user?.role === "mentor") router.push("/mentor/dashboard");
      else router.push("/mentee/dashboard");
    } catch (error) {
      console.error("Profile setup error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black transition-colors">
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
                    Complete your profile
                  </h2>
                  <p className="text-xl sm:text-3xl md:text-4xl font-semibold ">
                    Let&apos;s get to know you better!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="p-10 dark:text-white flex flex-col justify-center items-center bg-white dark:bg-black md:rounded-r-2xl overflow-y-auto">
            <h2 className="text-2xl text-center font-semibold py-4">
              Complete your profile
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
              {/* Current Profession/Role */}
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300">
                  What area can you mentor in?
                </label>
                <input
                  type="text"
                  {...register("profession")}
                  placeholder="e.g. Software Engineer, Marketing Manager"
                  className="w-full border dark:border-neutral-600 bg-transparent mt-1 p-3 rounded-lg placeholder:text-gray-500"
                />
                {errors.profession && (
                  <p className="text-red-500 text-sm">
                    {errors.profession.message}
                  </p>
                )}
              </div>

              {/* Field they want mentorship in */}
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300">
                  What would you like mentorship on?
                </label>
                <input
                  type="text"
                  {...register("skillFocus")}
                  placeholder="e.g. Data Science, Product Management, Career Transition"
                  className="w-full border dark:border-neutral-600 bg-transparent mt-1 p-3 rounded-lg placeholder:text-gray-500"
                />
                {errors.skillFocus && (
                  <p className="text-red-500 text-sm">
                    {errors.skillFocus.message}
                  </p>
                )}
              </div>

              {/* Bio/Introduction */}
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300">
                  Tell us about yourself
                </label>
                <textarea
                  {...register("bio")}
                  rows={4}
                  placeholder="Share your background, experience, and what you hope to achieve through mentorship..."
                  className="w-full border dark:border-neutral-600 bg-transparent mt-1 p-3 rounded-lg placeholder:text-gray-500"
                />
                {errors.bio && (
                  <p className="text-red-500 text-sm">{errors.bio.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || isSubmitting}
                className="w-full bg-black dark:bg-white dark:text-black text-white py-3 rounded-lg shadow-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : "Complete Profile"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
