import React from 'react';

interface UserAvatarProps {
  avatarUrl?: string | null;
  username?: string | null;
  size?: string;
}

export default function UserAvatar({
  avatarUrl,
  username,
  size = "w-[48px] h-[48px]",
}: UserAvatarProps) {
  return (
    <div className={`${size} rounded-full overflow-hidden shrink-0 border border-white-gray bg-lite-white flex items-center justify-center`}>
      {avatarUrl ? (
        <img 
          src={avatarUrl} 
          alt={username || 'Avatar de usuario'} 
          className="w-full h-full object-cover" 
        />
      ) : (
        <div className="w-full h-full bg-main-blue/20 flex items-center justify-center font-candal font-normal text-main-blue text-tiny">
          UDO
        </div>
      )}
    </div>
  );
}
