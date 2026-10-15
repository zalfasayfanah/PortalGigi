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
  getCatatanPerawatan,
  addCatatanPerawatan,
  updateJanjiStatus,
} from "@/lib/dataStore";
import {
  Stethoscope,
  User,
  Clock,
  ArrowLeft,
  FileText,
  CheckCircle2,
  AlertTriangle,
  History,
} from "lucide-react";

function PemeriksaanDokterContent() {
  const params = useParams();
  const router = useRouter();
  const janjiId = params?.id;

  const [currentUser, setCurrentUser] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [service, setService] = useState(null);
  const [existingCatatan, setExistingCatatan] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [tindakan, setTindakan] = useState("");
  const [catatan, setCatatan] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getActiveUser();
    setCurrentUser(user);

    if (janjiId) {
      const allJanji = getJanjiTemu();
      const apt = allJanji.find((a) => a.id === janjiId);

      // Security check: Only this doctor or super_admin can open (PRD 4.10)
      if (
        !apt ||
        (user && user.role !== "super_admin" && apt.dokterId !== user.id)
      ) {
        setNotFound(true);
        return;
      }

      setAppointment(apt);

      const allUsers = getUsers();
      setPatient(allUsers.find((u) => u.id === apt.pasienId));
      setService(getLayanan().find((l) => l.id === apt.layananId));

      const allCatatan = getCatatanPerawatan();
      const existing = allCatatan.find((c) => c.janjiId === apt.id);
      if (existing) {
        setExistingCatatan(existing);
        setTindakan(existing.tindakan);
        setCatatan(existing.catatan);
      }
    }
  }, [janjiId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!tindakan.trim()) {
      setError("Kolom tindakan wajib diisi.");
      return;
    }
    if (!catatan.trim()) {
      setError("Kolom catatan dan anjuran dokter wajib diisi.");
      return;
    }

    setLoading(true);

    const savedCatatan = addCatatanPerawatan({
      janjiId: appointment.id,
      pasienId: appointment.pasienId,
      dokterId: appointment.dokterId,
      tindakan: tindakan.trim(),
      catatan: catatan.trim(),
    });

    updateJanjiStatus(appointment.id, "selesai");
    setExistingCatatan(savedCatatan);
    setAppointment((prev) => ({ ...prev, status: "selesai" }));
    setSuccess(true);
    setLoading(false);
  };

  if (notFound) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center max-w-lg mx-auto">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900">Janji tidak ditemukan</h2>
        <p className="text-sm text-gray-500 mt-1">
          Anda tidak memiliki hak akses untuk memeriksa janji temu ini atau data janji tidak terdaftar.
        </p>
        <Link
          href="/dokter"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#0E7490]"
        >
          <ArrowLeft size={16} /> Kembali ke Dasbor Dokter
        </Link>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-20 text-gray-500">Memuat data pemeriksaan...</div>
    );
  }

  const isCompleted = appointment.status === "selesai";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dokter"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Dasbor Dokter</span>
        </Link>
        <span className="text-xs text-gray-400 tabular-nums">Janji #{appointment.id}</span>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">
              Pasien Pemeriksaan
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-0.5">
              {patient?.nama}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Layanan: <strong className="text-gray-800">{service?.nama}</strong> · {appointment.tanggal} {appointment.jam} WITA
            </p>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={appointment.status} />
            {patient && (
              <Link
                href={`/dokter/pasien/${patient.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-[#0E7490] font-semibold text-xs border border-cyan-200 transition"
              >
                <History size={14} />
                Lihat Riwayat Pasien
              </Link>
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            Keluhan Pasien:
          </span>
          <p className="text-sm text-gray-800 italic">
            &ldquo;{appointment.keluhan}&rdquo;
          </p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/70 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <Stethoscope className="text-[#0E7490]" size={20} />
          <h2 className="text-lg font-bold text-gray-900">
            {isCompleted ? "Catatan Perawatan Medis (Selesai)" : "Form Pemeriksaan & Tindakan Medis"}
          </h2>
        </div>

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-sm border border-emerald-200 flex items-start gap-2.5">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <span>
              Pemeriksaan berhasil diselesaikan! Catatan perawatan tersimpan dan pasien dapat melihat hasilnya di Riwayat Perawatan.
            </span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Tindakan Medis yang Dilakukan *
            </label>
            <textarea
              rows={3}
              disabled={isCompleted}
              placeholder="Contoh: Tambal gigi dengan resin komposit..."
              value={tindakan}
              onChange={(e) => setTindakan(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E7490] disabled:bg-gray-50 disabled:text-gray-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Catatan & Anjuran untuk Pasien *
            </label>
            <textarea
              rows={3}
              disabled={isCompleted}
              placeholder="Contoh: Hindari makanan dan minuman terlalu panas/dingin..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E7490] disabled:bg-gray-50 disabled:text-gray-600"
            />
          </div>

          {!isCompleted && (
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Status janji akan berubah menjadi Selesai setelah disimpan
              </span>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-[#0E7490] hover:bg-[#0c6179] text-white font-semibold text-sm shadow-sm transition flex items-center gap-2"
              >
                <CheckCircle2 size={16} />
                <span>{loading ? "Menyimpan..." : "Tandai Selesai"}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function PemeriksaanDokterPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-gray-400">Memuat...</div>}>
        <PemeriksaanDokterContent />
      </Suspense>
    </AppLayout>
  );
}
