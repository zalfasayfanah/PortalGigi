"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import {
  getActiveUser,
  getLayanan,
  getUsers,
  getJadwalDokter,
  getSlotTerisi,
  addJanjiTemu,
  formatRupiah,
} from "@/lib/dataStore";
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Send,
  HelpCircle,
} from "lucide-react";

export default function BuatJanjiPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeServices, setActiveServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [filledSlots, setFilledSlots] = useState([]);

  // Form states
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [keluhan, setKeluhan] = useState("");

  const [availableSlots, setAvailableSlots] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getActiveUser();
    setCurrentUser(user);

    const allLayanan = getLayanan().filter((l) => l.aktif);
    setActiveServices(allLayanan);
    if (allLayanan.length > 0) setSelectedServiceId(allLayanan[0].id);

    const allDoctors = getUsers().filter((u) => u.role === "dokter" && u.aktif);
    setDoctors(allDoctors);
    if (allDoctors.length > 0) setSelectedDoctorId(allDoctors[0].id);

    setSchedules(getJadwalDokter());
    setFilledSlots(getSlotTerisi());

    // Default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Calculate day name in Indonesian
  const getDayName = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const days = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
    return days[date.getDay()];
  };

  // Re-calculate available slots whenever service, doctor, or date changes
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate || !selectedServiceId) {
      setAvailableSlots([]);
      return;
    }

    const dayName = getDayName(selectedDate);

    // Find schedule for doctor on this day
    const doctorSchedule = schedules.find(
      (s) => s.dokterId === selectedDoctorId && s.hari.toLowerCase() === dayName
    );

    if (!doctorSchedule) {
      setAvailableSlots([]);
      return;
    }

    const service = activeServices.find((s) => s.id === selectedServiceId);
    const serviceDuration = service ? service.durasiMenit : 30;

    // Generate 30-min slots
    const startHour = parseInt(doctorSchedule.jamMulai.split(":")[0], 10);
    const startMinute = parseInt(doctorSchedule.jamMulai.split(":")[1], 10);
    const endHour = parseInt(doctorSchedule.jamSelesai.split(":")[0], 10);
    const endMinute = parseInt(doctorSchedule.jamSelesai.split(":")[1], 10);

    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;

    const slots = [];
    for (let time = startTotal; time + serviceDuration <= endTotal; time += 30) {
      const h = Math.floor(time / 60);
      const m = time % 60;
      const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

      // Check collision with slot_terisi
      const isTaken = filledSlots.some((slot) => {
        if (slot.dokterId === selectedDoctorId && slot.tanggal === selectedDate) {
          const [sh, sm] = slot.jam.split(":").map(Number);
          const slotStart = sh * 60 + sm;
          const slotEnd = slotStart + slot.durasiMenit;
          const currentStart = time;
          const currentEnd = time + serviceDuration;

          // Overlap condition
          return Math.max(slotStart, currentStart) < Math.min(slotEnd, currentEnd);
        }
        return false;
      });

      if (!isTaken) {
        slots.push(timeStr);
      }
    }

    setAvailableSlots(slots);
    if (!slots.includes(selectedSlot)) {
      setSelectedSlot(slots[0] || "");
    }
  }, [selectedDoctorId, selectedDate, selectedServiceId, schedules, filledSlots]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!currentUser) {
      setError("Silakan masuk terlebih dahulu.");
      return;
    }

    // Minimum tomorrow validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosenDate = new Date(selectedDate);
    chosenDate.setHours(0, 0, 0, 0);

    if (chosenDate <= today) {
      setError("Tanggal janji temu paling cepat harus besok (H+1).");
      return;
    }

    if (!selectedSlot) {
      setError("Dokter tidak berpraktik pada hari ini atau slot jam sudah penuh. Silakan pilih hari/jam lain.");
      return;
    }

    if (!keluhan.trim()) {
      setError("Mohon jelaskan keluhan gigi Anda secara singkat.");
      return;
    }

    setLoading(true);

    const service = activeServices.find((s) => s.id === selectedServiceId);

    // Double check race condition for slot
    const freshSlots = getSlotTerisi();
    const isConflict = freshSlots.some(
      (s) =>
        s.dokterId === selectedDoctorId &&
        s.tanggal === selectedDate &&
        s.jam === selectedSlot
    );

    if (isConflict) {
      setError("Slot ini baru saja terisi. Pilih jam lain.");
      setLoading(false);
      return;
    }

    const newJanji = addJanjiTemu({
      pasienId: currentUser.id,
      dokterId: selectedDoctorId,
      layananId: selectedServiceId,
      tanggal: selectedDate,
      jam: selectedSlot,
      keluhan: keluhan.trim(),
      durasiMenit: service?.durasiMenit || 30,
    });

    setTimeout(() => {
      setLoading(false);
      router.push(`/janji/${newJanji.id}`);
    }, 400);
  };

  const selectedService = activeServices.find((s) => s.id === selectedServiceId);
  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  // Minimum date string for datepicker (tomorrow)
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const minDateStr = tomorrowObj.toISOString().split("T")[0];

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/janji"
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Buat Janji Temu</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Pilih layanan, dokter gigi, tanggal, dan slot jam yang Anda inginkan
            </p>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/70 shadow-sm">
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Perhatian</p>
                <p className="text-xs text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Pilih Layanan */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                1. Pilih Layanan Gigi *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeServices.map((svc) => (
                  <label
                    key={svc.id}
                    className={`cursor-pointer p-4 rounded-xl border flex flex-col justify-between transition ${
                      selectedServiceId === svc.id
                        ? "border-[#0E7490] bg-cyan-50/60 ring-2 ring-[#0E7490]"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="layanan"
                      value={svc.id}
                      checked={selectedServiceId === svc.id}
                      onChange={() => setSelectedServiceId(svc.id)}
                      className="sr-only"
                    />
                    <div className="font-semibold text-gray-900 text-sm">{svc.nama}</div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 text-xs">
                      <span className="text-gray-500 tabular-nums">{svc.durasiMenit} Menit</span>
                      <span className="font-bold text-[#0E7490] tabular-nums">
                        {formatRupiah(svc.harga)}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Pilih Dokter */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                2. Pilih Dokter Gigi *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {doctors.map((doc) => {
                  const docSchedules = schedules
                    .filter((s) => s.dokterId === doc.id)
                    .map((s) => s.hari.charAt(0).toUpperCase() + s.hari.slice(1))
                    .join(", ");

                  return (
                    <label
                      key={doc.id}
                      className={`cursor-pointer p-4 rounded-xl border flex items-start gap-3 transition ${
                        selectedDoctorId === doc.id
                          ? "border-[#0E7490] bg-cyan-50/60 ring-2 ring-[#0E7490]"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="dokter"
                        value={doc.id}
                        checked={selectedDoctorId === doc.id}
                        onChange={() => setSelectedDoctorId(doc.id)}
                        className="sr-only"
                      />
                      <div className="w-10 h-10 rounded-full bg-[#0E7490]/10 text-[#0E7490] flex items-center justify-center font-bold text-sm shrink-0">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{doc.nama}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Praktik: {docSchedules || "Senin - Sabtu"}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 3. Tanggal & Slot Jam */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  3. Pilih Tanggal Periksa * (Minimal H-1)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={minDateStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0E7490] text-sm tabular-nums"
                  />
                </div>
                {selectedDate && (
                  <p className="text-xs text-gray-500 mt-1.5 capitalize">
                    Hari: <strong>{getDayName(selectedDate)}</strong>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  4. Pilih Slot Jam Kosong *
                </label>
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold tabular-nums border text-center transition ${
                          selectedSlot === slot
                            ? "bg-[#0E7490] text-white border-[#0E7490] shadow-sm"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                      >
                        {slot} WITA
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl border border-dashed border-amber-300 bg-amber-50 text-amber-800 text-xs">
                    Dokter tidak praktik pada hari ini atau seluruh slot sudah penuh. Silakan pilih tanggal atau dokter lain.
                  </div>
                )}
              </div>
            </div>

            {/* 5. Keluhan */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                5. Keluhan yang Dirasakan *
              </label>
              <textarea
                rows={3}
                placeholder="Jelaskan kondisi gigi atau keluhan Anda (misal: Gigi geraham kiri ngilu saat minum dingin)..."
                value={keluhan}
                onChange={(e) => setKeluhan(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E7490] text-sm"
              />
            </div>

            {/* Ringkasan & Submit */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-gray-500">
                Janji yang dikirim akan berstatus{" "}
                <span className="font-semibold text-amber-600">Menunggu</span> hingga dikonfirmasi oleh resepsionis.
              </div>
              <button
                type="submit"
                disabled={loading || !selectedSlot}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0E7490] hover:bg-[#0c6179] disabled:bg-gray-300 text-white font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2"
              >
                <Send size={16} />
                <span>{loading ? "Mengirim Janji..." : "Kirim Janji Temu"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
