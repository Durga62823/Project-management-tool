"use client";

import { User } from "lucide-react";

interface UserProfileProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export function UserProfile({ name, email, image }: UserProfileProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg border bg-gray-50/50">
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name || "User"}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {name || "User"}
        </p>
        <p className="text-xs text-gray-500 truncate">{email || "No email"}</p>
      </div>
    </div>
  );
}
