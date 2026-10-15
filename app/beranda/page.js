"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { getActiveUser, getJanjiTemu, getUsers, getLayanan, formatRupiah } from "@/lib/dataStore";
import { Calendar, Clock, User, PlusCircle, ArrowRight, ShieldAlert, Sparkles, Activity } from "lucide-react";

export default function BerandaPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [nearestAppointment, setNearestAppointment] = useState(null);
  const [allDoctors, setAllDoctors] = useState([]);
  const [allServices, setAllServices] = useState([]);

  useEffect(() => {
    const user = getActiveUser();
    setCurrentUser(user);

    const users = getUsers();
    setAllDoctors(users.filter((u) => u.role === "dokter"));
    setAllServices(getLayanan());

    if (user) {
      const appointments = getJanjiTemu();
      // Filter for this patient and not cancelled
      const myAppointments = appointments
        .filter((a) => a.pasienId === user.id && a.status !== "dibatalkan" && a.status !== "selesai")
        .sort((a, b) => new Date(`${a.tanggal}T${a.jam}`) - new Date(`${b.tanggal}T${b.jam}`));

      setNearestAppointment(myAppointments[0] || null);
    }
  }, []);

  const getDoctorName = (id) => {
    const doc = allDoctors.find((d) => d.id === id);
    return doc ? doc.nama : "Dokter Gigi";
  };

  const getServiceName = (id) => {
    const s = allServices.find((svc) => svc.id === id);
    return s ? s.nama : "Layanan Gigi";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-[#0E7490] to-teal-700 text-white p-6 sm:p-8 rounded-2xl shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full font-semibold">
                Portal Pasien
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold mt-2">
                Halo, {currentUser?.nama || "Pasien"}! 👋
              </h1>
              <p className="text-cyan-100 text-sm mt-1 max-w-xl">
                Selamat datang di Klinik Gigi Senyum Rekah Makassar. Rawat kesehatan gigi dan senyum cerah Anda dengan membuat janji temu online yang mudah dan tanpa antre.
              </p>
            </div>
            <Link
              href="/janji/baru"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#0E7490] font-semibold px-5 py-3 rounded-xl shadow-md hover:bg-cyan-50 transition shrink-0"
            >
              <PlusCircle size={20} />
              <span>Buat Janji Baru</span>
            </Link>
          </div>
        </div>

        {/* Janji Terdekat Section (PRD 4.2) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="text-[#0E7490]" size={20} />
              Janji Terdekat Anda
            </h2>
            {nearestAppointment && (
              <Link
                href={`/janji/${nearestAppointment.id}`}
                className="text-xs font-semibold text-[#0E7490] hover:underline flex items-center gap-1"
              >
                Lihat Detail <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {nearestAppointment ? (
            <Link
              href={`/janji/${nearestAppointment.id}`}
              className="block p-5 rounded-xl border border-gray-200 hover:border-[#0E7490] hover:shadow-md transition bg-gradient-to-br from-white to-gray-50/50"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={nearestAppointment.status} />
                    <span className="text-xs text-gray-500 tabular-nums">
                      ID: #{nearestAppointment.id}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {getServiceName(nearestAppointment.layananId)}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5 font-medium text-gray-800">
                      <User size={16} className="text-[#0E7490]" />
                      {getDoctorName(nearestAppointment.dokterId)}
                    </span>
                    <span className="flex items-center gap-1.5 tabular-nums">
                      <Calendar size={16} className="text-gray-400" />
                      {nearestAppointment.tanggal}
                    </span>
                    <span className="flex items-center gap-1.5 tabular-nums font-semibold text-[#0E7490]">
                      <Clock size={16} />
                      Pukul {nearestAppointment.jam} WITA
                    </span>
                  </div>
                  {nearestAppointment.keluhan && (
                    <p className="text-xs text-gray-500 italic mt-1 line-clamp-1">
                      Keluhan: &ldquo;{nearestAppointment.keluhan}&rdquo;
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center">
                  <span className="text-xs font-semibold text-[#0E7490] bg-cyan-50 px-3 py-1.5 rounded-lg border border-cyan-100 flex items-center gap-1">
                    Buka Rincian <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="text-center py-10 px-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600 font-semibold">Belum ada janji</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Anda belum memiliki janji temu aktif. Klik tombol di bawah untuk membuat janji temu dengan dokter gigi pilihan Anda.
              </p>
              <Link
                href="/janji/baru"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#0E7490] hover:bg-[#0c6179] px-4 py-2 rounded-xl transition"
              >
                <PlusCircle size={16} />
                Buat Janji Sekarang
              </Link>
            </div>
          )}
        </div>

        {/* Quick Info & Services Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0E7490] flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Jam Operasional</h4>
              <p className="text-xs text-gray-500 mt-1">Senin – Sabtu</p>
              <p className="text-xs font-semibold text-gray-700 mt-0.5 tabular-nums">09:00 – 16:00 WITA</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Bebas Antre</h4>
              <p className="text-xs text-gray-500 mt-1">Pilih slot jam kosong</p>
              <p className="text-xs font-semibold text-gray-700 mt-0.5">Langsung terkonfirmasi staf</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Activity size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Catatan Perawatan</h4>
              <p className="text-xs text-gray-500 mt-1">Transparan & Rinci</p>
              <Link href="/riwayat" className="text-xs font-semibold text-[#0E7490] mt-0.5 block hover:underline">
                Buka Riwayat Medis →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
