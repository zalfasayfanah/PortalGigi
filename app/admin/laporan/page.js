"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { getJanjiTemu, getUsers, getLayanan } from "@/lib/dataStore";
import {
  FileText,
  Calendar,
  User,
  Activity,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

function LaporanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialBulan = searchParams?.get("bulan") || "2026-10";
  const [selectedBulan, setSelectedBulan] = useState(initialBulan);

  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [doctorReport, setDoctorReport] = useState([]);
  const [serviceReport, setServiceReport] = useState([]);
  const [totalCompleted, setTotalCompleted] = useState(0);

  const handleBulanChange = (newBulan) => {
    setSelectedBulan(newBulan);
    router.replace(`/admin/laporan?bulan=${newBulan}`);
  };

  useEffect(() => {
    const allUsers = getUsers();
    const docs = allUsers.filter((u) => u.role === "dokter");
    const svcs = getLayanan();
    const allJanji = getJanjiTemu();

    setDoctors(docs);
    setServices(svcs);

    // Filter appointments with status 'selesai' and matching the selected month (YYYY-MM)
    const completedThisMonth = allJanji.filter(
      (j) => j.status === "selesai" && j.tanggal.startsWith(selectedBulan)
    );

    setTotalCompleted(completedThisMonth.length);

    // 1. Rekapitulasi per Dokter (PRD 4.16)
    const docSummary = docs.map((doc) => {
      const count = completedThisMonth.filter((j) => j.dokterId === doc.id).length;
      return {
        id: doc.id,
        nama: doc.nama,
        email: doc.email,
        jumlahKunjungan: count,
      };
    });
    setDoctorReport(docSummary);

    // 2. Rekapitulasi per Layanan (PRD 4.16)
    const svcSummary = svcs.map((svc) => {
      const count = completedThisMonth.filter((j) => j.layananId === svc.id).length;
      return {
        id: svc.id,
        nama: svc.nama,
        durasi: svc.durasiMenit,
        jumlahKunjungan: count,
      };
    });
    setServiceReport(svcSummary);
  }, [selectedBulan]);

  const monthNames = {
    "2026-08": "Agustus 2026",
    "2026-09": "September 2026",
    "2026-10": "Oktober 2026",
    "2026-11": "November 2026",
    "2026-12": "Desember 2026",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Laporan Kunjungan Klinik
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Rekapitulasi jumlah pasien selesai diperiksa berdasarkan dokter dan jenis tindakan
          </p>
        </div>

        {/* Month Selector (PRD 4.16) */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-gray-200/70 shadow-sm">
          <Calendar size={16} className="text-[#0E7490]" />
          <span className="text-xs font-semibold text-gray-700">Pilih Periode:</span>
          <select
            value={selectedBulan}
            onChange={(e) => handleBulanChange(e.target.value)}
            className="text-xs font-bold text-[#0E7490] bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="2026-08">Agustus 2026</option>
            <option value="2026-09">September 2026</option>
            <option value="2026-10">Oktober 2026</option>
            <option value="2026-11">November 2026</option>
            <option value="2026-12">Desember 2026</option>
          </select>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-900 to-[#0E7490] text-white shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-cyan-200 uppercase tracking-wider">
            Total Kunjungan Selesai · {monthNames[selectedBulan] || selectedBulan}
          </span>
          <div className="text-3xl font-extrabold mt-1 tabular-nums">
            {totalCompleted} Pasien
          </div>
          <p className="text-xs text-cyan-100 mt-0.5">
            Dihitung otomatis dari janji temu berstatus Selesai
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
          <TrendingUp size={24} />
        </div>
      </div>

      {/* 2 Comparison Tables (PRD 4.16) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Table 1: Kunjungan per Dokter */}
        <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <User size={16} className="text-[#0E7490]" />
              Kunjungan per Dokter Gigi
            </h2>
            <span className="text-[11px] text-gray-400 uppercase font-semibold">Tabel 1</span>
          </div>

          <div className="overflow-x-auto p-2">
            <table className="w-full text-left text-xs">
              <thead className="text-gray-400 uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-2.5 px-3">Nama Dokter</th>
                  <th className="py-2.5 px-3 text-right">Jumlah Kunjungan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {doctorReport.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-gray-900">{item.nama}</div>
                      <div className="text-[10px] text-gray-400">{item.email}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#0E7490] tabular-nums text-sm">
                      {item.jumlahKunjungan} Pasien
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Kunjungan per Layanan */}
        <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Activity size={16} className="text-[#0E7490]" />
              Kunjungan per Layanan
            </h2>
            <span className="text-[11px] text-gray-400 uppercase font-semibold">Tabel 2</span>
          </div>

          <div className="overflow-x-auto p-2">
            <table className="w-full text-left text-xs">
              <thead className="text-gray-400 uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-2.5 px-3">Layanan</th>
                  <th className="py-2.5 px-3 text-right">Jumlah Kunjungan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {serviceReport.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-gray-900">{item.nama}</div>
                      <div className="text-[10px] text-gray-400 tabular-nums">
                        Durasi: {item.durasi} Menit
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#0E7490] tabular-nums text-sm">
                      {item.jumlahKunjungan} Kali
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LaporanAdminPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-gray-400">Memuat Laporan...</div>}>
        <LaporanContent />
      </Suspense>
    </AppLayout>
  );
}
