"use client";
import  { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const FlipWords = ({
  words,
  duration = 4000,
  className,
}: {
  words: string[];
  duration?: number;
  className?: string;
}) => {
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // thanks for the fix Julian - https://github.com/Julian-AT
  const startAnimation = useCallback(() => {
    const word = words[words.indexOf(currentWord) + 1] || words[0];
    setCurrentWord(word);
    setIsAnimating(true);
  }, [currentWord, words]);

  useEffect(() => {
    if (!isAnimating)
      setTimeout(() => {
        startAnimation();
      }, duration);
  }, [isAnimating, duration, startAnimation]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        setIsAnimating(false);
      }}
    >
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 10,
        }}
        exit={{
          opacity: 0,
          y: -40,
          x: 40,
          filter: "blur(8px)",
          scale: 2,
          position: "absolute",
        }}
        className={cn(
          "z-10 inline-block bg-orange-500/10 rounded relative text-left text-orange-500  py-1 px-3",
          className
        )}
        key={currentWord}
      >
                          <span className="absolute top-0 left-0 w-4 h-3 border-t-4 border-l-4 border-orange-500 rounded-tl-md"></span>
        
                          <span className="absolute top-0 right-0 w-4 h-3 border-t-4 border-r-4 border-orange-500 rounded-tr-md"></span>
        
                          <span className="absolute bottom-0 left-0 w-4 h-3 border-b-4 border-l-4 border-orange-500 rounded-bl-md"></span>
        
                          <span className="absolute bottom-0 right-0 w-4 h-3 border-b-4 border-r-4 border-orange-500 rounded-br-md"></span>
                          
        {/* edit suggested by Sajal: https://x.com/DewanganSajal */}
        {currentWord.split(" ").map((word, wordIndex) => (
          <motion.span
            key={word + wordIndex}
            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              delay: wordIndex * 0.4,
              duration: 0.4,
            }}
            className="inline-block whitespace-nowrap"
          >
            {word.split("").map((letter, letterIndex) => (
              <motion.span
                key={word + letterIndex}
                initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  delay: wordIndex * 0.4 + letterIndex * 0.05,
                  duration: 0.3,
                }}
                className="inline-block"
              >
                {letter}
              </motion.span>
            ))}
          </motion.span>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
