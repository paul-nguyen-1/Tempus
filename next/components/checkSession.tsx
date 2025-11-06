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
  const hideNavbar = hiddenRoutes.includes(pathname);

  useEffect(() => {
    if (!isPending && !session && !hiddenRoutes.includes(pathname)) {
      router.push("/login");
    }
  }, [session, isPending, pathname, router]);

  if (isPending) {
    return <Loader />;
  }

  return (
    <>
      {!hideNavbar && session && <Navbar />}
      {children}
    </>
  );
}
