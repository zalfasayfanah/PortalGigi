"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import {
  getActiveUser,
  getJanjiTemu,
  getUsers,
  getLayanan,
  updateJanjiStatus,
  formatRupiah,
} from "@/lib/dataStore";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  AlertTriangle,
  XCircle,
  CheckCircle2,
} from "lucide-react";

function RincianJanjiPasienContent() {
  const params = useParams();
  const router = useRouter();
  const janjiId = params?.id;

  const [currentUser, setCurrentUser] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [service, setService] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const user = getActiveUser();
    setCurrentUser(user);

    if (janjiId) {
      const allAppointments = getJanjiTemu();
      const apt = allAppointments.find((a) => a.id === janjiId);

      // Security check: Must belong to this patient unless super_admin
      if (!apt || (user && user.role !== "super_admin" && apt.pasienId !== user.id)) {
        setNotFound(true);
        return;
      }

      setAppointment(apt);

      const allUsers = getUsers();
      setDoctor(allUsers.find((u) => u.id === apt.dokterId));

      const allLayanan = getLayanan();
      setService(allLayanan.find((l) => l.id === apt.layananId));
    }
  }, [janjiId]);

  const canCancel = () => {
    if (!appointment) return false;
    if (appointment.status !== "menunggu" && appointment.status !== "dikonfirmasi") {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const aptDate = new Date(appointment.tanggal);
    aptDate.setHours(0, 0, 0, 0);

    const diffTime = aptDate.getTime() - today.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);

    return diffDays >= 1;
  };

  const handleCancel = () => {
    updateJanjiStatus(janjiId, "dibatalkan", "Dibatalkan sendiri oleh pasien");
    setAppointment((prev) => ({
      ...prev,
      status: "dibatalkan",
      alasanBatal: "Dibatalkan sendiri oleh pasien",
    }));
    setShowCancelConfirm(false);
    setSuccessMessage(
      "Janji temu Anda telah berhasil dibatalkan. Slot jam telah dikembalikan."
    );
  };

  if (notFound) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center max-w-lg mx-auto">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900">Janji tidak ditemukan</h2>
        <p className="text-sm text-gray-500 mt-1">
          Data janji temu dengan ID ini tidak tersedia atau Anda tidak memiliki hak akses untuk membukanya.
        </p>
        <Link
          href="/janji"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#0E7490]"
        >
          <ArrowLeft size={16} /> Kembali ke Janji Saya
        </Link>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-20 text-gray-500 text-sm">
        Memuat rincian janji...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/janji"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Janji Saya</span>
        </Link>
        <span className="text-xs text-gray-400 tabular-nums">ID: #{appointment.id}</span>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-sm border border-emerald-200 flex items-start gap-2.5">
          <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">
              Rincian Janji Temu
            </span>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">
              {service?.nama || "Layanan Gigi"}
            </h1>
          </div>
          <StatusBadge status={appointment.status} />
        </div>

        {/* Details */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <div className="text-xs text-gray-500 flex items-center gap-1.5 mb-1">
                <User size={14} className="text-[#0E7490]" />
                Dokter yang Menangani
              </div>
              <div className="font-semibold text-gray-900 text-sm">
                {doctor?.nama || "drg. Dokter"}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <div className="text-xs text-gray-500 flex items-center gap-1.5 mb-1">
                <Calendar size={14} className="text-[#0E7490]" />
                Jadwal Waktu Kunjungan
              </div>
              <div className="font-semibold text-gray-900 text-sm tabular-nums">
                {appointment.tanggal} · {appointment.jam} WITA
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-cyan-50/50 border border-cyan-100">
            <div className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider mb-1">
              Keluhan Pasien
            </div>
            <p className="text-sm text-gray-800 italic">
              &ldquo;{appointment.keluhan}&rdquo;
            </p>
          </div>

          {appointment.status === "dibatalkan" && appointment.alasanBatal && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <div className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-1">
                Alasan Pembatalan
              </div>
              <p className="text-sm text-red-800">{appointment.alasanBatal}</p>
            </div>
          )}

          {canCancel() && (
            <div className="pt-4 border-t border-gray-100">
              {showCancelConfirm ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
                  <p className="text-xs font-semibold text-amber-900">
                    Apakah Anda yakin ingin membatalkan janji temu ini? Slot jam yang telah Anda pilih akan dibuka kembali untuk pasien lain.
                  </p>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-gray-700 border border-gray-200"
                    >
                      Kembali
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700"
                    >
                      Ya, Batalkan Janji
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Bisa dibatalkan mandiri paling lambat H-1
                  </span>
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3.5 py-2 rounded-xl transition"
                  >
                    <XCircle size={15} />
                    Batalkan Janji
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RincianJanjiPasienPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-gray-400">Memuat rincian...</div>}>
        <RincianJanjiPasienContent />
      </Suspense>
    </AppLayout>
  );
}
