"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { getActiveUser, getJanjiTemu, getUsers, getLayanan } from "@/lib/dataStore";
import {
  Stethoscope,
  Clock,
  User,
  ArrowRight,
  Sparkles,
  ClipboardCheck,
} from "lucide-react";

export default function DasborDokterPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);

  const todayStr = "2026-10-15"; // Reference clinic current date

  useEffect(() => {
    const user = getActiveUser();
    setCurrentUser(user);

    const allUsers = getUsers();
    setPatients(allUsers.filter((u) => u.role === "pasien"));
    setServices(getLayanan());

    if (user) {
      const allJanji = getJanjiTemu();
      // PRD 4.9: Hanya janji dengan dokterId miliknya yang tampil (kecuali super_admin)
      const mySchedule = (
        user.role === "super_admin"
          ? allJanji
          : allJanji.filter((j) => j.dokterId === user.id)
      )
        .filter((j) => j.tanggal === todayStr)
        .sort((a, b) => a.jam.localeCompare(b.jam));

      setTodaySchedule(mySchedule);
    }
  }, []);

  const getPatientName = (id) => {
    const p = patients.find((pat) => pat.id === id);
    return p ? p.nama : "Pasien";
  };

  const getServiceName = (id) => {
    const s = services.find((svc) => svc.id === id);
    return s ? s.nama : "Layanan Gigi";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E7490] uppercase tracking-wider mb-1">
              <Stethoscope size={15} /> Ruang Praktik Dokter Gigi
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Jadwal Praktik Hari Ini ({todayStr})
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Daftar pasien yang terdaftar dalam jadwal Anda hari ini
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
              {todaySchedule.filter((a) => a.status === "hadir").length} Pasien Siap Diperiksa
            </span>
          </div>
        </div>

        {/* Schedule List */}
        <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
          {todaySchedule.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {todaySchedule.map((apt) => {
                const isReadyForExam = apt.status === "hadir";
                const isFinished = apt.status === "selesai";

                return (
                  <div
                    key={apt.id}
                    className={`p-5 sm:p-6 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isReadyForExam ? "bg-purple-50/30 border-l-4 border-l-purple-600" : ""
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-base text-[#0E7490] tabular-nums">
                          {apt.jam} WITA
                        </span>
                        <StatusBadge status={apt.status} />
                        {isReadyForExam && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 animate-pulse">
                            ⚡ Siap Diperiksa
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        {getPatientName(apt.pasienId)}
                        <span className="text-xs font-normal text-gray-400">
                          ({getServiceName(apt.layananId)})
                        </span>
                      </h3>

                      {apt.keluhan && (
                        <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 italic">
                          Keluhan: &ldquo;{apt.keluhan}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {isReadyForExam ? (
                        <Link
                          href={`/dokter/janji/${apt.id}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition"
                        >
                          <Stethoscope size={15} />
                          Mulai Pemeriksaan
                        </Link>
                      ) : isFinished ? (
                        <Link
                          href={`/dokter/janji/${apt.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition"
                        >
                          <ClipboardCheck size={14} />
                          Lihat Catatan
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          {apt.status === "menunggu"
                            ? "Menunggu Konfirmasi"
                            : apt.status === "dikonfirmasi"
                            ? "Menunggu Kedatangan"
                            : "Dibatalkan"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-800">Tidak Ada Janji Hari Ini</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Anda tidak memiliki janji temu terjadwal untuk hari ini ({todayStr}).
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
