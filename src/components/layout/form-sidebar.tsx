"use client";
import { X } from "lucide-react";

export default function FormSidebar({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="w-full h-full flex flex-col">

      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold text-lg">Curriculum Builder</h2>

        {/* Mobile close */}
        <button onClick={onClose} className="md:hidden p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <span className="text-sm opacity-70">
          This form helps generate a personalized learning curriculum based on
          your chats with the learner.
        </span>

        <input
          className="w-full p-2 rounded bg-gray-100 dark:bg-gray-800 outline-none"
          placeholder="Learner goal"
        />

        <textarea
          className="w-full p-2 rounded bg-gray-100 dark:bg-gray-800 outline-none h-24"
          placeholder="Skill level"
        />

        <textarea
          className="w-full p-2 rounded bg-gray-100 dark:bg-gray-800 outline-none h-32"
          placeholder="Challenges learner faces"
        />

        <textarea
          className="w-full p-2 rounded bg-gray-100 dark:bg-gray-800 outline-none h-32"
          placeholder="Preferred learning style"
        />

        <button className="w-full p-2 bg-orange-500 text-white rounded font-medium">
          Generate Curriculum
        </button>
      </div>
    </div>
  );
}
