"use client";

import Image from "next/image";
import React from "react";

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
      className={`flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-white font-semibold 
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

export default Avatar;
