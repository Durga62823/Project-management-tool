"use client";

import { Session } from "next-auth";
import { UserMenu } from "./UserMenu";
import { ModeToggle } from "./ModeToggle";
import { ColorPicker } from "./ColorPicker";

interface HeaderProps {
  session?: Session | null;
  title?: string;
}

export function Header({ session, title }: HeaderProps) {
  return (
    <header className="border-b bg-card sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <ColorPicker />
          {session?.user && (
            <UserMenu
              name={session.user.name}
              email={session.user.email}
              image={session.user.image}
            />
          )}
        </div>
      </div>
    </header>
  );
}
