"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getActiveUser } from "@/lib/dataStore";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = getActiveUser();
    if (user) {
      if (user.role === "pasien") router.replace("/beranda");
      else if (user.role === "resepsionis") router.replace("/resepsionis");
      else if (user.role === "dokter") router.replace("/dokter");
      else if (user.role === "super_admin") router.replace("/admin");
    } else {
      router.replace("/masuk");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7F9]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#0E7490] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Mengarahkan ke halaman Portal...</p>
      </div>
    </div>
  );
}
