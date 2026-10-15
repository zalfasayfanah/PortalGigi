"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { getJanjiTemu, getUsers, getLayanan } from "@/lib/dataStore";
import {
  BarChart3,
  Calendar,
  Users,
  Settings,
  Clock,
  FileText,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function DasborAdminPage() {
  const [todayCompletedCount, setTodayCompletedCount] = useState(0);
  const [monthCompletedCount, setMonthCompletedCount] = useState(0);
  const [waitingCount, setWaitingCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  const todayStr = "2026-10-15"; // Reference clinic current date
  const currentMonthStr = "2026-10";

  useEffect(() => {
    const allJanji = getJanjiTemu();
    const allUsers = getUsers();

    setTotalUsers(allUsers.length);

    // Kunjungan hari ini (janji status Selesai hari ini)
    const todayCompleted = allJanji.filter(
      (j) => j.tanggal === todayStr && j.status === "selesai"
    );
    setTodayCompletedCount(todayCompleted.length);

    // Kunjungan bulan ini (janji status Selesai bulan ini)
    const monthCompleted = allJanji.filter(
      (j) => j.tanggal.startsWith(currentMonthStr) && j.status === "selesai"
    );
    setMonthCompletedCount(monthCompleted.length);

    // Menunggu konfirmasi
    const waiting = allJanji.filter((j) => j.status === "menunggu");
    setWaitingCount(waiting.length);
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <span className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider">
            Super Admin · Pemilik Klinik (Bu Ratna)
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            Dasbor Administrasi Klinik
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Ringkasan kunjungan klinis, antrean konfirmasi, dan manajemen sistem
          </p>
        </div>

        {/* Highlight Metrics Cards (PRD 4.12) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* 1. Kunjungan Hari Ini */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Kunjungan Hari Ini
              </span>
              <CheckCircle2 size={18} className="text-emerald-500" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-gray-900 tabular-nums">
                {todayCompletedCount}
              </span>
              <span className="text-xs text-gray-400 tabular-nums">{todayStr}</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Pasien selesai diperiksa hari ini
            </p>
          </div>

          {/* 2. Kunjungan Bulan Ini (Klik membuka Laporan) */}
          <Link
            href="/admin/laporan?bulan=2026-10"
            className="bg-white p-6 rounded-2xl border border-cyan-200 hover:border-[#0E7490] hover:shadow-md transition shadow-sm group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0E7490]">
                Kunjungan Bulan Ini
              </span>
              <TrendingUp size={18} className="text-[#0E7490]" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-[#0E7490] tabular-nums">
                {monthCompletedCount}
              </span>
              <span className="text-xs font-medium text-[#0E7490] group-hover:underline flex items-center gap-1">
                Buka Laporan <ArrowRight size={14} />
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Total pasien selesai periode Oktober 2026
            </p>
          </Link>

          {/* 3. Menunggu Konfirmasi */}
          <Link
            href="/resepsionis/janji?status=menunggu"
            className="bg-white p-6 rounded-2xl border border-amber-200 hover:border-amber-400 hover:shadow-md transition shadow-sm group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                Menunggu Konfirmasi
              </span>
              <AlertCircle size={18} className="text-amber-500" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-amber-600 tabular-nums">
                {waitingCount}
              </span>
              <span className="text-xs font-medium text-amber-700 group-hover:underline flex items-center gap-1">
                Periksa <ArrowRight size={14} />
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Permintaan janji baru dari pasien
            </p>
          </Link>
        </div>

        {/* Admin Navigation Hub */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <Link
            href="/admin/pengguna"
            className="p-5 bg-white rounded-2xl border border-gray-200/70 hover:border-[#0E7490] hover:shadow-sm transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Users size={20} />
            </div>
            <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#0E7490] transition">
              Kelola Pengguna
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Atur hak akses dan peran (dokter, resepsionis, admin).
            </p>
          </Link>

          <Link
            href="/admin/layanan"
            className="p-5 bg-white rounded-2xl border border-gray-200/70 hover:border-[#0E7490] hover:shadow-sm transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Settings size={20} />
            </div>
            <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#0E7490] transition">
              Layanan Klinik
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Tambah tarif, durasi menit, dan status aktif layanan.
            </p>
          </Link>

          <Link
            href="/admin/jadwal-dokter"
            className="p-5 bg-white rounded-2xl border border-gray-200/70 hover:border-[#0E7490] hover:shadow-sm transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Clock size={20} />
            </div>
            <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#0E7490] transition">
              Jadwal Dokter
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Atur hari dan jam praktik drg. Bima dan drg. Sinta.
            </p>
          </Link>

          <Link
            href="/admin/laporan"
            className="p-5 bg-white rounded-2xl border border-gray-200/70 hover:border-[#0E7490] hover:shadow-sm transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <FileText size={20} />
            </div>
            <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#0E7490] transition">
              Laporan Kunjungan
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Rekapitulasi kunjungan bulanan per dokter dan layanan.
            </p>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
