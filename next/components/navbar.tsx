"use client";

import * as React from "react";
import Link from "next/link";
import { Calendar, LayoutDashboard, Link2, LogOut } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "./hooks/use-mobile";

export function Navbar() {
  const isMobile = useIsMobile();
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-6 flex-1">
          <Link href="/" className="font-bold text-xl">
            Tempus
          </Link>

          <NavigationMenu viewport={isMobile}>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link
                    href="/profile/dashboard"
                    className="flex items-center gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {session?.user?.id && (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      asChild
                      className={navigationMenuTriggerStyle()}
                    >
                      <Link
                        href={`/profile/book/${session.user.id}`}
                        className="flex items-center gap-2"
                      >
                        <Link2 className="h-4 w-4" />
                        <span className="hidden sm:inline">My Page</span>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink
                      asChild
                      className={navigationMenuTriggerStyle()}
                    >
                      <Link
                        href="/profile/availability"
                        className="flex items-center gap-2"
                      >
                        <Calendar className="h-4 w-4" />
                        <span className="hidden sm:inline">Availability</span>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {session && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="gap-2 ml-auto"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        )}
      </div>
    </nav>
  );
}
