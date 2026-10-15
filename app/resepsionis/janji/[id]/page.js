"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import {
  getJanjiTemu,
  getUsers,
  getLayanan,
  updateJanjiStatus,
  rescheduleJanji,
  getSlotTerisi,
  getJadwalDokter,
} from "@/lib/dataStore";
import {
  Calendar,
  Clock,
  User,
  Phone,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Check,
} from "lucide-react";

function RincianJanjiResepsionisContent() {
  const params = useParams();
  const router = useRouter();
  const janjiId = params?.id;

  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [service, setService] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newSlot, setNewSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);

  const [isCancelling, setIsCancelling] = useState(false);
  const [alasanBatal, setAlasanBatal] = useState("");

  const todayStr = "2026-10-15";

  const reloadData = async () => {
    if (!janjiId) return;
    const allJanji = getJanjiTemu();
    const apt = allJanji.find((a) => a.id === janjiId);
    if (apt) {
      setAppointment(apt);
      const allUsers = getUsers();
      setPatient(allUsers.find((u) => u.id === apt.pasienId));
      setDoctor(allUsers.find((u) => u.id === apt.dokterId));
      setService(getLayanan().find((l) => l.id === apt.layananId));
    }

    // Also fetch fresh from Cloud Firestore
    try {
      const { fetchJanjiFromFirestore, fetchUsersFromFirestore, fetchLayananFromFirestore } = await import("@/lib/dataStore");
      const [freshJanji, freshUsers, freshLayanan] = await Promise.all([
        fetchJanjiFromFirestore(),
        fetchUsersFromFirestore(),
        fetchLayananFromFirestore(),
      ]);
      const freshApt = freshJanji?.find((a) => a.id === janjiId);
      if (freshApt) {
        setAppointment(freshApt);
        if (freshUsers) {
          setPatient(freshUsers.find((u) => u.id === freshApt.pasienId));
          setDoctor(freshUsers.find((u) => u.id === freshApt.dokterId));
        }
        if (freshLayanan) {
          setService(freshLayanan.find((l) => l.id === freshApt.layananId));
        }
      }
    } catch (e) {
      console.warn("Firestore sync in resepsionis detail notice:", e);
    }
  };

  useEffect(() => {
    reloadData();
  }, [janjiId]);

  useEffect(() => {
    if (!isRescheduling || !newDate || !appointment) return;

    const date = new Date(newDate);
    const days = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
    const dayName = days[date.getDay()];

    const schedules = getJadwalDokter();
    const docSchedule = schedules.find(
      (s) => s.dokterId === appointment.dokterId && s.hari.toLowerCase() === dayName
    );

    if (!docSchedule) {
      setAvailableSlots([]);
      return;
    }

    const duration = service?.durasiMenit || 30;
    const startHour = parseInt(docSchedule.jamMulai.split(":")[0], 10);
    const startMinute = parseInt(docSchedule.jamMulai.split(":")[1], 10);
    const endHour = parseInt(docSchedule.jamSelesai.split(":")[0], 10);
    const endMinute = parseInt(docSchedule.jamSelesai.split(":")[1], 10);

    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;

    const slots = [];
    const filled = getSlotTerisi().filter((s) => s.id !== appointment.id);

    for (let time = startTotal; time + duration <= endTotal; time += 30) {
      const h = Math.floor(time / 60);
      const m = time % 60;
      const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

      const isTaken = filled.some((slot) => {
        if (slot.dokterId === appointment.dokterId && slot.tanggal === newDate) {
          const [sh, sm] = slot.jam.split(":").map(Number);
          const slotStart = sh * 60 + sm;
          const slotEnd = slotStart + slot.durasiMenit;
          return Math.max(slotStart, time) < Math.min(slotEnd, time + duration);
        }
        return false;
      });

      if (!isTaken) slots.push(timeStr);
    }

    setAvailableSlots(slots);
    if (!slots.includes(newSlot)) setNewSlot(slots[0] || "");
  }, [isRescheduling, newDate, appointment, service]);

  const handleConfirm = async () => {
    await updateJanjiStatus(janjiId, "dikonfirmasi");
    setMessage("Janji temu telah berhasil dikonfirmasi dan status tersimpan di Firestore.");
    reloadData();
  };

  const handleMarkArrived = async () => {
    await updateJanjiStatus(janjiId, "hadir");
    setMessage("Pasien telah ditandai hadir. Janji siap diperiksa di Dasbor Dokter.");
    reloadData();
  };

  const handleCancelSubmit = (e) => {
    e.preventDefault();
    if (!alasanBatal.trim()) {
      setError("Alasan pembatalan wajib diisi.");
      return;
    }
    updateJanjiStatus(janjiId, "dibatalkan", alasanBatal.trim());
    setIsCancelling(false);
    setMessage("Janji temu telah dibatalkan dan slot jam dibuka kembali.");
    reloadData();
  };

  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    if (!newDate || !newSlot) {
      setError("Pilih tanggal dan slot jam kosong.");
      return;
    }
    rescheduleJanji(janjiId, newDate, newSlot);
    setIsRescheduling(false);
    setMessage(`Janji berhasil dijadwal ulang ke ${newDate} pukul ${newSlot} WITA.`);
    reloadData();
  };

  if (!appointment) {
    return (
      <div className="text-center py-20 text-gray-500">Memuat rincian janji...</div>
    );
  }

  const isFinalState = appointment.status === "selesai" || appointment.status === "dibatalkan";
  const isToday = appointment.tanggal === todayStr;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/resepsionis/janji"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Kelola Janji</span>
        </Link>
        <span className="text-xs text-gray-400 tabular-nums">ID: #{appointment.id}</span>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-sm border border-emerald-200 flex items-start gap-2.5">
          <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200 flex items-start gap-2.5">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">
              Rincian Kelola Janji
            </span>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">
              {service?.nama || "Layanan Gigi"}
            </h1>
          </div>
          <StatusBadge status={appointment.status} />
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Informasi Pasien</div>
              <div className="font-bold text-gray-900 text-sm">{patient?.nama}</div>
              <div className="text-xs text-gray-600 mt-1 flex items-center gap-1.5 tabular-nums">
                <Phone size={13} className="text-[#0E7490]" />
                {patient?.noHp || "-"}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Dokter & Waktu</div>
              <div className="font-bold text-gray-900 text-sm">{doctor?.nama}</div>
              <div className="text-xs text-gray-600 mt-1 flex items-center gap-1.5 tabular-nums">
                <Clock size={13} className="text-[#0E7490]" />
                {appointment.tanggal} · {appointment.jam} WITA
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-cyan-50/40 border border-cyan-100">
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

          {!isFinalState && (
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {appointment.status === "menunggu" && (
                  <button
                    onClick={handleConfirm}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5"
                  >
                    <Check size={16} />
                    Konfirmasi Janji
                  </button>
                )}

                {appointment.status === "dikonfirmasi" && (
                  <button
                    onClick={handleMarkArrived}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={16} />
                    {isToday ? "Tandai Hadir" : "Tandai Hadir (Walk-in / Uji)"}
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsRescheduling(true);
                    setIsCancelling(false);
                    setNewDate(appointment.tanggal);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs transition flex items-center gap-1.5"
                >
                  <RotateCcw size={15} />
                  Jadwal Ulang
                </button>

                <button
                  onClick={() => {
                    setIsCancelling(true);
                    setIsRescheduling(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-xs transition flex items-center gap-1.5"
                >
                  <XCircle size={15} />
                  Batalkan Janji
                </button>
              </div>

              {isRescheduling && (
                <form
                  onSubmit={handleRescheduleSubmit}
                  className="p-5 rounded-xl bg-gray-50 border border-gray-200 space-y-4"
                >
                  <div className="font-semibold text-gray-900 text-sm">
                    Jadwal Ulang Janji Temu
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Tanggal Baru:
                      </label>
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Slot Jam Kosong:
                      </label>
                      {availableSlots.length > 0 ? (
                        <select
                          value={newSlot}
                          onChange={(e) => setNewSlot(e.target.value)}
                          required
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs tabular-nums"
                        >
                          {availableSlots.map((s) => (
                            <option key={s} value={s}>
                              {s} WITA
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-xs text-amber-600 py-2">
                          Tidak ada slot jam kosong pada tanggal ini.
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsRescheduling(false)}
                      className="px-3 py-1.5 text-xs text-gray-600"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={!newSlot}
                      className="px-4 py-1.5 bg-[#0E7490] text-white rounded-lg text-xs font-semibold"
                    >
                      Simpan Jadwal Baru
                    </button>
                  </div>
                </form>
              )}

              {isCancelling && (
                <form
                  onSubmit={handleCancelSubmit}
                  className="p-5 rounded-xl bg-red-50 border border-red-200 space-y-4"
                >
                  <div className="font-semibold text-red-900 text-sm">
                    Batalkan Janji Temu
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-red-800 mb-1">
                      Alasan Pembatalan *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Tulis alasan pembatalan..."
                      value={alasanBatal}
                      onChange={(e) => setAlasanBatal(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-red-300 text-xs focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsCancelling(false)}
                      className="px-3 py-1.5 text-xs text-gray-600"
                    >
                      Tutup
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Konfirmasi Batalkan
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RincianJanjiResepsionisPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-gray-400">Memuat rincian...</div>}>
        <RincianJanjiResepsionisContent />
      </Suspense>
    </AppLayout>
  );
}
