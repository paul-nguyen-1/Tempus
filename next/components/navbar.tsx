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
    router.push("/");
  };

  return (
    <nav className="border-b sticky top-0 bg-background z-50">
      <div className="relative flex h-16 items-center px-4 max-w-7xl mx-auto">
        <Link href="/" className="font-bold text-xl">
          Tempus
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2 md:pb-4">
          <NavigationMenu viewport={isMobile}>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link
                    href="/profile/analytics"
                    className="flex items-center gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Analytics</span>
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
                        <span className="hidden sm:inline">Booking</span>
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
