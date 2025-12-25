"use client";

import { useSession } from "@/lib/auth-client";
import { Loader } from "@/components/loader";
import { UserHome } from "@/components/homepage/user";
import { ClientHome } from "@/components/homepage/client";

export default function Home() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <Loader />;
  }

  return session ? <UserHome /> : <ClientHome />;
}
