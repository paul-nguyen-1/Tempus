"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "./navbar";
import { Loader } from "./loader";

export function CheckSession({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ["/login", "/signup"];
  const bookingRoutes = pathname.startsWith("/profile/book/");
  const isPublicRoute = publicRoutes.includes(pathname) || bookingRoutes;

  useEffect(() => {
    if (isPending) return;

    if (session && publicRoutes.includes(pathname)) {
      router.replace("/");
      return;
    }

    if (!session && !isPublicRoute) {
      router.replace("/login");
      return;
    }
  }, [session, isPending, isPublicRoute, pathname, router]);

  if (
    isPending ||
    (!session && !isPublicRoute) ||
    (session && publicRoutes.includes(pathname))
  ) {
    return <Loader />;
  }

  return (
    <>
      {session && !publicRoutes.includes(pathname) && <Navbar />}
      {children}
    </>
  );
}
