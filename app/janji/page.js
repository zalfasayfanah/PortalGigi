"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { getActiveUser, getJanjiTemu, getUsers, getLayanan } from "@/lib/dataStore";
import { Calendar, Clock, User, PlusCircle, ArrowRight, ClipboardList } from "lucide-react";

export default function DaftarJanjiPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const user = getActiveUser();
    setCurrentUser(user);

    setDoctors(getUsers().filter((u) => u.role === "dokter"));
    setServices(getLayanan());

    if (user) {
      const all = getJanjiTemu();
      // Filter for this patient if not super_admin
      const list = user.role === "super_admin"
        ? all
        : all.filter((a) => a.pasienId === user.id);

      // Sort by date nearest
      list.sort((a, b) => new Date(`${a.tanggal}T${a.jam}`) - new Date(`${b.tanggal}T${b.jam}`));
      setAppointments(list);
    }
  }, []);

  const getDoctorName = (id) => {
    const d = doctors.find((doc) => doc.id === id);
    return d ? d.nama : "drg. Dokter";
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
            <h1 className="text-2xl font-bold text-gray-900">Janji Saya</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Daftar seluruh jadwal kunjungan dan janji temu klinik gigi Anda
            </p>
          </div>
          <Link
            href="/janji/baru"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E7490] hover:bg-[#0c6179] text-white text-sm font-semibold shadow-sm transition shrink-0"
          >
            <PlusCircle size={18} />
            <span>Buat Janji Baru</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
          {appointments.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {appointments.map((apt) => (
                <Link
                  key={apt.id}
                  href={`/janji/${apt.id}`}
                  className="block p-5 sm:p-6 hover:bg-gray-50/70 transition group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <StatusBadge status={apt.status} />
                        <span className="text-xs text-gray-400 tabular-nums">#{apt.id}</span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-[#0E7490] transition">
                        {getServiceName(apt.layananId)}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1.5 font-medium text-gray-800">
                          <User size={14} className="text-[#0E7490]" />
                          {getDoctorName(apt.dokterId)}
                        </span>
                        <span className="flex items-center gap-1.5 tabular-nums">
                          <Calendar size={14} className="text-gray-400" />
                          {apt.tanggal}
                        </span>
                        <span className="flex items-center gap-1.5 tabular-nums font-semibold text-[#0E7490]">
                          <Clock size={14} />
                          {apt.jam} WITA
                        </span>
                      </div>
                      {apt.keluhan && (
                        <p className="text-xs text-gray-500 italic line-clamp-1 mt-1">
                          Keluhan: &ldquo;{apt.keluhan}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                      <span className="text-xs font-semibold text-[#0E7490] group-hover:translate-x-0.5 transition flex items-center gap-1">
                        Detail <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-800">Belum Ada Janji Temu</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Anda belum memiliki janji temu yang terdaftar. Buat janji dengan dokter sekarang untuk memeriksa kesehatan gigi Anda.
              </p>
              <Link
                href="/janji/baru"
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#0E7490] hover:bg-[#0c6179] transition"
              >
                <PlusCircle size={16} />
                Buat Janji Baru
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
