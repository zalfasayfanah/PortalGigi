"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import {
  getJadwalDokter,
  addJadwalDokter,
  updateJadwalDokter,
  getUsers,
  setStoredData,
} from "@/lib/dataStore";
import {
  Clock,
  User,
  PlusCircle,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
} from "lucide-react";

export default function JadwalDokterAdminPage() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [schedules, setSchedules] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hari, setHari] = useState("senin");
  const [jamMulai, setJamMulai] = useState("09:00");
  const [jamSelesai, setJamSelesai] = useState("15:00");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const reload = () => {
    const allUsers = getUsers();
    const docs = allUsers.filter((u) => u.role === "dokter");
    setDoctors(docs);
    if (!selectedDoctorId && docs.length > 0) {
      setSelectedDoctorId(docs[0].id);
    }
    setSchedules(getJadwalDokter());
  };

  useEffect(() => {
    reload();
  }, []);

  const currentDoctor = doctors.find((d) => d.id === selectedDoctorId);
  const currentDoctorSchedules = schedules.filter(
    (s) => s.dokterId === selectedDoctorId
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validasi: Hari Senin-Sabtu
    const validDays = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
    if (!validDays.includes(hari.toLowerCase())) {
      setError("Hari praktik hanya diperbolehkan Senin sampai Sabtu.");
      return;
    }

    // Validasi: Jam selesai setelah jam mulai
    if (jamSelesai <= jamMulai) {
      setError("Jam selesai praktik harus setelah jam mulai.");
      return;
    }

    // Validasi: Satu dokter satu jadwal per hari
    const duplicate = currentDoctorSchedules.find(
      (s) => s.hari.toLowerCase() === hari.toLowerCase()
    );
    if (duplicate) {
      setError(`Dokter ${currentDoctor.nama} sudah memiliki jadwal praktik pada hari ${hari}. Hapus atau perbarui jadwal yang ada.`);
      return;
    }

    addJadwalDokter({
      dokterId: selectedDoctorId,
      hari: hari.toLowerCase(),
      jamMulai,
      jamSelesai,
    });

    setMessage(`Jadwal praktik hari ${hari} untuk ${currentDoctor.nama} berhasil ditambahkan.`);
    setIsModalOpen(false);
    reload();
  };

  const handleDeleteSchedule = (schedId) => {
    const updated = schedules.filter((s) => s.id !== schedId);
    setStoredData("senyum_jadwal", updated);
    setMessage("Jadwal praktik berhasil dihapus.");
    reload();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Jadwal Praktik Dokter</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Atur hari dan jam kerja dokter gigi untuk slot reservasi pasien
            </p>
          </div>

          <button
            onClick={() => {
              setError("");
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E7490] hover:bg-[#0c6179] text-white text-xs font-semibold shadow-sm transition shrink-0"
          >
            <PlusCircle size={16} />
            <span>Tambah Hari Praktik</span>
          </button>
        </div>

        {message && (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-sm border border-emerald-200 flex items-start gap-2.5">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {/* Doctor Selector Tabs (PRD 4.15) */}
        <div className="flex items-center gap-3 border-b border-gray-200 pb-2 overflow-x-auto">
          {doctors.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDoctorId(doc.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedDoctorId === doc.id
                  ? "bg-[#0E7490] text-white shadow-sm"
                  : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
              }`}
            >
              <User size={15} />
              <span>{doc.nama}</span>
            </button>
          ))}
        </div>

        {/* Schedule Cards for Selected Doctor */}
        <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Jadwal Praktik: {currentDoctor?.nama}
              </h2>
              <p className="text-xs text-gray-500">
                Hari-hari aktif di bawah ini yang dapat dipilih pasien pada form Buat Janji
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-cyan-50 text-[#0E7490] rounded-lg border border-cyan-100 tabular-nums">
              {currentDoctorSchedules.length} Hari Praktik
            </span>
          </div>

          {currentDoctorSchedules.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {currentDoctorSchedules.map((sched) => (
                <div
                  key={sched.id}
                  className="p-4 rounded-xl border border-gray-200 hover:border-[#0E7490] transition flex flex-col justify-between bg-gray-50/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-sm capitalize">
                      {sched.hari}
                    </span>
                    <button
                      onClick={() => handleDeleteSchedule(sched.id)}
                      className="text-gray-400 hover:text-red-600 transition"
                      title="Hapus Jadwal Hari Ini"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-200/60 flex items-center gap-1.5 text-xs text-[#0E7490] font-semibold tabular-nums">
                    <Clock size={14} />
                    {sched.jamMulai} – {sched.jamSelesai} WITA
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-xs">
              Belum ada jadwal praktik untuk dokter ini. Klik tombol &ldquo;Tambah Hari Praktik&rdquo; di atas.
            </div>
          )}
        </div>

        {/* Modal Tambah Jadwal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <h3 className="font-bold text-gray-900 text-base">
                  Tambah Jadwal Praktik ({currentDoctor?.nama})
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              {error && (
                <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Hari Praktik (Senin - Sabtu) *
                  </label>
                  <select
                    value={hari}
                    onChange={(e) => setHari(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0E7490] capitalize"
                  >
                    <option value="senin">Senin</option>
                    <option value="selasa">Selasa</option>
                    <option value="rabu">Rabu</option>
                    <option value="kamis">Kamis</option>
                    <option value="jumat">Jumat</option>
                    <option value="sabtu">Sabtu</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Jam Mulai *
                    </label>
                    <input
                      type="time"
                      value={jamMulai}
                      onChange={(e) => setJamMulai(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0E7490] tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Jam Selesai *
                    </label>
                    <input
                      type="time"
                      value={jamSelesai}
                      onChange={(e) => setJamSelesai(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0E7490] tabular-nums"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0E7490] hover:bg-[#0c6179] text-white text-xs font-semibold rounded-xl shadow-sm"
                  >
                    Simpan Jadwal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
