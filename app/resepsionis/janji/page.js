"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { getJanjiTemu, getUsers, getLayanan } from "@/lib/dataStore";
import {
  Calendar,
  Clock,
  User,
  Filter,
  ArrowRight,
  Search,
  CheckCircle2,
} from "lucide-react";

function KelolaJanjiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);

  // Filter states
  const initialStatus = searchParams?.get("status") || "semua";
  const initialDate = searchParams?.get("tanggal") || "";

  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [dateFilter, setDateFilter] = useState(initialDate);

  useEffect(() => {
    const allUsers = getUsers();
    setPatients(allUsers.filter((u) => u.role === "pasien"));
    setDoctors(allUsers.filter((u) => u.role === "dokter"));
    setServices(getLayanan());
    setAppointments(getJanjiTemu());
  }, []);

  // Update query params when filter changes (PRD 4.7)
  const handleFilterChange = (newStatus, newDate) => {
    setStatusFilter(newStatus);
    setDateFilter(newDate);

    const params = new URLSearchParams();
    if (newStatus && newStatus !== "semua") params.set("status", newStatus);
    if (newDate) params.set("tanggal", newDate);

    const query = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/resepsionis/janji${query}`);
  };

  const getPatientName = (id) => {
    const p = patients.find((pat) => pat.id === id);
    return p ? p.nama : "Pasien";
  };

  const getDoctorName = (id) => {
    const d = doctors.find((doc) => doc.id === id);
    return d ? d.nama : "Dokter";
  };

  const getServiceName = (id) => {
    const s = services.find((svc) => svc.id === id);
    return s ? s.nama : "Layanan";
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchStatus = statusFilter === "semua" || apt.status === statusFilter;
    const matchDate = !dateFilter || apt.tanggal === dateFilter;
    return matchStatus && matchDate;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kelola Janji Temu</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Konfirmasi, jadwal ulang, tandai kehadiran, dan batalkan janji pasien
        </p>
      </div>

      {/* Filters (PRD 4.7) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {["semua", "menunggu", "dikonfirmasi", "hadir", "selesai", "dibatalkan"].map(
            (status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status, dateFilter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                  statusFilter === status
                    ? "bg-[#0E7490] text-white shadow-sm"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => handleFilterChange(statusFilter, e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0E7490] tabular-nums"
          />
          {dateFilter && (
            <button
              onClick={() => handleFilterChange(statusFilter, "")}
              className="text-xs text-gray-500 hover:text-gray-800 underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
        {filteredAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 border-b border-gray-200/70 text-gray-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Tanggal & Jam</th>
                  <th className="py-3 px-4">Pasien</th>
                  <th className="py-3 px-4">Dokter</th>
                  <th className="py-3 px-4">Layanan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-cyan-50/20 transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900 tabular-nums">
                        {apt.tanggal}
                      </div>
                      <div className="text-[11px] text-[#0E7490] font-medium tabular-nums">
                        {apt.jam} WITA
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {getPatientName(apt.pasienId)}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {getDoctorName(apt.dokterId)}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {getServiceName(apt.layananId)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={apt.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/resepsionis/janji/${apt.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-[#0E7490] hover:underline"
                      >
                        Kelola <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 px-4 text-gray-500 text-xs">
            Tidak ada janji temu dengan filter yang dipilih.
          </div>
        )}
      </div>
    </div>
  );
}

export default function KelolaJanjiPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-gray-400">Memuat...</div>}>
        <KelolaJanjiContent />
      </Suspense>
    </AppLayout>
  );
}
