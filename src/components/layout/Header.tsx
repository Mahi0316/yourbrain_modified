import React from "react";
import { LogOut, User, BookOpen } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/Button";

export function Header() {
  const { user, role, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    window.location.reload();
  };

  return (
    <header className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between">

        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white/20 p-2">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-none">YOUR'S Brain</h1>
            <p className="text-sm opacity-90">
              Aptitude practice · Levels · Teacher dashboard
            </p>
          </div>
        </div>

        {/* User Info + Logout */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex flex-col text-right mr-2">
                <span className="font-semibold text-sm">
                  {user?.name || user?.email}
                </span>

                <span className="text-xs opacity-80">{role}</span>
              </div>

              <div className="rounded-full bg-white/10 p-2">
                <User size={20} />
              </div>
            </div>
          )}

          <Button variant="ghost" size="sm" icon={LogOut} onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>

      </div>
    </header>
  );
}
