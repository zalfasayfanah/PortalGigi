"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { getJanjiTemu, getUsers, getLayanan } from "@/lib/dataStore";
import {
  Calendar,
  Clock,
  User,
  Users,
  AlertCircle,
  ArrowRight,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";

export default function DasborResepsionisPage() {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [waitingCount, setWaitingCount] = useState(0);

  // Today's date in YYYY-MM-DD
  const todayStr = "2026-10-15"; // Synchronized with PRD seed reference date

  useEffect(() => {
    const allUsers = getUsers();
    setDoctors(allUsers.filter((u) => u.role === "dokter"));
    setPatients(allUsers.filter((u) => u.role === "pasien"));
    setServices(getLayanan());

    const allJanji = getJanjiTemu();

    // Waiting count
    const waiting = allJanji.filter((j) => j.status === "menunggu");
    setWaitingCount(waiting.length);

    // Today's appointments
    const todays = allJanji.filter((j) => j.tanggal === todayStr);
    setTodayAppointments(todays);
  }, []);

  const getPatientName = (id) => {
    const p = patients.find((pat) => pat.id === id);
    return p ? p.nama : "Pasien";
  };

  const getServiceName = (id) => {
    const s = services.find((svc) => svc.id === id);
    return s ? s.nama : "Layanan";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dasbor Resepsionis</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Ringkasan antrean dan janji temu klinik gigi Senyum Rekah hari ini
          </p>
        </div>

        {/* Counter Card: Menunggu Konfirmasi (PRD 4.6) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            href="/resepsionis/janji?status=menunggu"
            className="bg-white p-6 rounded-2xl border border-amber-200 hover:border-amber-400 hover:shadow-md transition shadow-sm group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                Menunggu Konfirmasi
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                !
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-amber-600 tabular-nums">
                {waitingCount}
              </span>
              <span className="text-xs font-medium text-amber-700 group-hover:underline flex items-center gap-1">
                Kelola sekarang <ArrowRight size={14} />
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Pasien yang menunggu konfirmasi janji temu
            </p>
          </Link>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Janji Hari Ini
            </span>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-gray-900 tabular-nums">
                {todayAppointments.length}
              </span>
              <span className="text-xs text-gray-400 tabular-nums">{todayStr}</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Jadwal konsultasi dan tindakan hari ini
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Tindakan Cepat
              </span>
              <h4 className="font-bold text-gray-900 mt-1">Kelola Seluruh Janji</h4>
              <p className="text-xs text-gray-500 mt-0.5">Filter status & jadwal ulang</p>
            </div>
            <Link
              href="/resepsionis/janji"
              className="p-3 bg-cyan-50 hover:bg-cyan-100 text-[#0E7490] rounded-xl transition"
            >
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        {/* Janji Hari Ini per Dokter (PRD 4.6) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock className="text-[#0E7490]" size={20} />
              Jadwal Janji Hari Ini per Dokter ({todayStr})
            </h2>
            <Link
              href="/resepsionis/janji"
              className="text-xs font-semibold text-[#0E7490] hover:underline"
            >
              Buka Semua Janji →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {doctors.map((doctor) => {
              const docAppointments = todayAppointments.filter(
                (a) => a.dokterId === doctor.id
              );

              return (
                <div
                  key={doctor.id}
                  className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0E7490]/10 text-[#0E7490] flex items-center justify-center font-bold text-sm">
                        <User size={18} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{doctor.nama}</h3>
                        <span className="text-[11px] text-gray-500">Dokter Gigi</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-gray-600 bg-white px-2.5 py-1 rounded-full border border-gray-200 tabular-nums">
                      {docAppointments.length} Janji
                    </span>
                  </div>

                  <div className="p-4 flex-1">
                    {docAppointments.length > 0 ? (
                      <div className="space-y-2.5">
                        {docAppointments.map((apt) => (
                          <Link
                            key={apt.id}
                            href={`/resepsionis/janji/${apt.id}`}
                            className="block p-3 rounded-xl border border-gray-100 hover:border-cyan-200 hover:bg-cyan-50/30 transition text-xs"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-[#0E7490] tabular-nums">
                                {apt.jam} WITA
                              </span>
                              <StatusBadge status={apt.status} />
                            </div>
                            <div className="font-semibold text-gray-900">
                              {getPatientName(apt.pasienId)}
                            </div>
                            <div className="text-gray-500 mt-0.5">
                              {getServiceName(apt.layananId)}
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400 text-xs">
                        Tidak ada janji untuk dokter ini hari ini.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
