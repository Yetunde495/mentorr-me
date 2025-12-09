"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

interface AvatarProps {
  src?: string;
  name: string;
  size?: number;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 40,
  className = "",
}) => {
  const fallback = name?.charAt(0).toUpperCase();

  return (
    <div
      className={`flex items-center justify-center bg-linear-to-tr from-orange-400 via-orange-500 to-orange-600 text-white font-semibold 
      rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size, minWidth: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={size}
          height={size}
          className={`object-cover w-full h-full rounded-full`}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <span className="text-[0.9rem]">{fallback}</span>
      )}
    </div>
  );
};

export const ImageAvatar = ({
  src,
  name,
  className = "",
}: {
  src?: string;
  name: string;
  className?: string;
}) => {
  const initial = name?.charAt(0).toUpperCase();

  const hasImage = src && src.trim().length > 0;

  return hasImage ? (
    <motion.img
      src={src}
      alt={name}
      className={
        "w-40 h-40 rounded-[30px] object-cover border-4 border-white dark:border-neutral-800 " +
        className
      }
    />
  ) : (
    <motion.div
      className={
        "w-50 h-40 rounded-[30px] flex items-center justify-center text-3xl font-semibold text-white border-4 border-white dark:border-neutral-800 " +
        " bg-linear-to-tr from-orange-400 via-orange-500 to-orange-600 text-white " +
        className
      }
    >
      {initial}
    </motion.div>
  );
};

export default Avatar;
