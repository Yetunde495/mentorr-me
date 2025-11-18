import { User } from '@/types/user';
import React from 'react';

export const AvatarWithStatus: React.FC<{ user: User; onClick?: () => void }> = ({ user, onClick }) => {
  return (
    <button onClick={onClick} className="flex items-center gap-3">
      <div className="relative">
        <img src={user.avatar || '/avatar-placeholder.png'} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
        <span className={`absolute right-0 bottom-0 block w-2 h-2 rounded-full ring-2 ring-white ${user.online ? 'bg-green-400' : 'bg-gray-400'}`} />
      </div>
      <div className="hidden md:block text-left">
        <div className="text-sm font-medium">{user.name}</div>
        <div className="text-xs text-gray-500">{user.online ? 'Online' : 'Last seen recently'}</div>
      </div>
    </button>
  );
};