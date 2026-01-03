"use client";
import { motion } from "framer-motion";
import FlipStack from "@/components/ui/flipstack";
import { FlipWords } from "@/components/ui/flip-words";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import Link from "next/link";

const cards = [
  {
    id: 1,
    content: (
      <img
        src="/hero-image-1.png"
        alt="Learner"
        className="w-full lg:max-w-[250px] h-full object-cover"
      />
    ),
  },

  {
    id: 2,
    content: (
      <img
        src="/hero-image-3.png"
        alt="mockup"
        className="w-full h-full object-cover"
      />
    ),
  },
  {
    id: 3,
    content: (
      <img
        src="/hero-image-2.png"
        alt="mentor"
        className="w-full lg:max-w-[250px] h-full object-cover"
      />
    ),
  },
];

export default function Home() {
  return (
    <main>
      <Navigation />

      <section className="font-dmsans bg-white text-zinc-800 px-[5%] py-[9%] dark:bg-[#0B0B0C] dark:text-white">
        {/* HERO SECTION */}
        <section className="grid lg:grid-cols-2 grid-cols-1 gap-8 items-center py-14">
          <div>
            <p className="text-sm text-gray-500 hidden mb-2">
              Cohort runs Nov 19 — Dec 10, 2025. Limited spots.
            </p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="sm:text-4xl text-3xl md:text-6xl font-semibold mb-4"
            >
              Get Paired With The Right{" "}
              <FlipWords words={["Mentor", "Learner"]} />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-gray-600 dark:text-gray-300 sm:text-lg max-w-4xl mb-8"
            >
              PivotLab is a simple 3‑week mentorship program that connects you
              to the right person, gives you a clear learning plan, and creates
              a focused environment for real progress — whether you're learning
              or mentoring.
            </motion.p>

            {/* CTA Buttons */}
            <div className="flex gap-1.5 sm:gap-4">
              <Link href={`signin`} className="sm:px-6 px-2 py-1.5 sm:py-3 rounded-md bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-all">
                Get Paired Now
              </Link>
              <button className="sm:px-6 px-2 py-1.5 sm:py-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                More Details
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="w-full">
            <FlipStack cards={cards} />
          </div>
        </section>
      </section>
      <Footer />
    </main>
  );
}
