"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, ArrowLeft, Home, PowerOff } from "lucide-react";

export default function RouteGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading, logout } = useAuth();

  const isPublicPath = pathname === "/masuk" || pathname === "/daftar";

  useEffect(() => {
    if (loading) return;

    if (pathname === "/") {
      if (profile) {
        if (profile.role === "pasien") router.replace("/beranda");
        else if (profile.role === "resepsionis") router.replace("/resepsionis");
        else if (profile.role === "dokter") router.replace("/dokter");
        else if (profile.role === "super_admin") router.replace("/admin");
      } else {
        router.replace("/masuk");
      }
    } else if (isPublicPath && profile) {
      if (profile.role === "pasien") router.replace("/beranda");
      else if (profile.role === "resepsionis") router.replace("/resepsionis");
      else if (profile.role === "dokter") router.replace("/dokter");
      else if (profile.role === "super_admin") router.replace("/admin");
    } else if (!isPublicPath && !profile) {
      router.replace(`/masuk?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, profile, loading, router]);

  // If on public path (masuk / daftar), render page immediately
  if (isPublicPath) {
    return <>{children}</>;
  }

  // If on root path "/", display clean loading while redirecting
  if (pathname === "/") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F9]">
        <div className="w-8 h-8 border-3 border-[#0E7490] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Loading Screen for protected paths while user & role are being fetched from users/{uid}
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F9]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#0E7490] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-gray-700">
            Memuat hak akses & peran pengguna...
          </p>
          <p className="text-xs text-gray-400">Portal Janji Senyum Rekah</p>
        </div>
      </div>
    );
  }

  // Not logged in -> show redirecting indicator while useEffect redirects
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F9]">
        <div className="text-center text-sm text-gray-500">
          Mengarahkan ke halaman masuk...
        </div>
      </div>
    );
  }

  // Deactivated Account Check (PRD 4.1 & 4.13)
  if (!profile.aktif) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F9] p-4">
        <div className="bg-white p-8 rounded-2xl border border-red-200 shadow-lg max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <PowerOff size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Akun Anda Dinonaktifkan</h2>
          <p className="text-sm text-gray-600">
            Akun Anda dinonaktifkan oleh administrator klinik. Silakan hubungi meja klinik Senyum Rekah untuk bantuan lebih lanjut.
          </p>
          <button
            onClick={logout}
            className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition"
          >
            Keluar dari Akun
          </button>
        </div>
      </div>
    );
  }

  // Role Permissions Verification (Tahap 5 & Peta Route)
  const role = profile.role;
  const isSuperAdmin = role === "super_admin";

  let isAuthorized = false;

  if (isSuperAdmin) {
    // Super Admin boleh membuka semua halaman (PRD 2.1 & Tahap 5)
    isAuthorized = true;
  } else if (pathname === "/profil") {
    // Profil boleh dibuka semua peran (PRD 4.5)
    isAuthorized = true;
  } else if (pathname.startsWith("/beranda") || pathname.startsWith("/janji") || pathname.startsWith("/riwayat")) {
    // Pasien module
    isAuthorized = role === "pasien";
  } else if (pathname.startsWith("/resepsionis")) {
    // Resepsionis module
    isAuthorized = role === "resepsionis";
  } else if (pathname.startsWith("/dokter")) {
    // Dokter module
    isAuthorized = role === "dokter";
  } else if (pathname.startsWith("/admin")) {
    // Super admin only module
    isAuthorized = role === "super_admin";
  } else {
    isAuthorized = true;
  }

  // Unauthorized Access -> Display "Akses Ditolak" (Tahap 5)
  if (!isAuthorized) {
    const getHomeUrl = () => {
      if (role === "pasien") return "/beranda";
      if (role === "resepsionis") return "/resepsionis";
      if (role === "dokter") return "/dokter";
      return "/admin";
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F9] p-4">
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-red-200 shadow-lg max-w-lg w-full text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <ShieldAlert size={36} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
            Akses Ditolak
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Anda Tidak Memiliki Izin
          </h1>
          <p className="text-sm text-gray-600">
            Halaman <code className="bg-gray-100 px-1.5 py-0.5 rounded text-red-700 font-mono text-xs">{pathname}</code> tidak dapat dibuka oleh peran <strong className="capitalize">{role}</strong>.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              href={getHomeUrl()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0E7490] hover:bg-[#0c6179] text-white font-semibold text-xs transition shadow-sm"
            >
              <Home size={15} />
              Kembali ke Dasbor Saya
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
