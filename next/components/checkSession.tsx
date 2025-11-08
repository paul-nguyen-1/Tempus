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

  const hiddenRoutes = ["/login", "/signup"];
  const isHiddenRoute = hiddenRoutes.includes(pathname);

  useEffect(() => {
    if (isPending) return;

    if (session && isHiddenRoute) {
      router.replace("/");
      return;
    }

    if (!session && !isHiddenRoute) {
      router.replace("/login");
      return;
    }
  }, [session, isPending, isHiddenRoute, router]);

  if (isPending || (!session && !isHiddenRoute) || (session && isHiddenRoute)) {
    return <Loader />;
  }

  return (
    <>
      {!isHiddenRoute && session && <Navbar />}
      {children}
    </>
  );
}
