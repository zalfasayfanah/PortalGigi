"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import {
  getLayanan,
  addLayanan,
  updateLayanan,
  formatRupiah,
} from "@/lib/dataStore";
import {
  Settings,
  PlusCircle,
  Clock,
  Tag,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  Power,
} from "lucide-react";

export default function LayananAdminPage() {
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Form states
  const [nama, setNama] = useState("");
  const [durasiMenit, setDurasiMenit] = useState(30);
  const [harga, setHarga] = useState(150000);
  const [aktif, setAktif] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const reload = () => {
    setServices(getLayanan());
  };

  useEffect(() => {
    reload();
  }, []);

  const openAddModal = () => {
    setEditingService(null);
    setNama("");
    setDurasiMenit(30);
    setHarga(150000);
    setAktif(true);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (svc) => {
    setEditingService(svc);
    setNama(svc.nama);
    setDurasiMenit(svc.durasiMenit);
    setHarga(svc.harga);
    setAktif(svc.aktif);
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!nama.trim()) {
      setError("Nama layanan tidak boleh kosong.");
      return;
    }
    const durasiNum = parseInt(durasiMenit, 10);
    if (isNaN(durasiNum) || durasiNum <= 0 || durasiNum % 30 !== 0) {
      setError("Durasi layanan harus berupa angka kelipatan 30 menit (contoh: 30, 60, 90).");
      return;
    }
    const hargaNum = parseInt(harga, 10);
    if (isNaN(hargaNum) || hargaNum <= 0) {
      setError("Harga layanan harus valid dan lebih dari 0.");
      return;
    }

    if (editingService) {
      updateLayanan(editingService.id, {
        nama: nama.trim(),
        durasiMenit: durasiNum,
        harga: hargaNum,
        aktif,
      });
      setMessage("Layanan berhasil diperbarui.");
    } else {
      addLayanan({
        nama: nama.trim(),
        durasiMenit: durasiNum,
        harga: hargaNum,
        aktif,
      });
      setMessage("Layanan baru berhasil ditambahkan dan langsung aktif.");
    }

    setIsModalOpen(false);
    reload();
  };

  const handleToggleAktif = (svc) => {
    updateLayanan(svc.id, { aktif: !svc.aktif });
    setMessage(
      `Status layanan "${svc.nama}" diubah menjadi ${!svc.aktif ? "Aktif" : "Nonaktif"}.`
    );
    reload();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Layanan Gigi</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Daftar tindakan klinis, durasi waktu periksa, tarif, dan ketersediaan layanan
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E7490] hover:bg-[#0c6179] text-white text-xs font-semibold shadow-sm transition shrink-0"
          >
            <PlusCircle size={16} />
            <span>Tambah Layanan</span>
          </button>
        </div>

        {message && (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-sm border border-emerald-200 flex items-start gap-2.5">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {/* Services Table (PRD 4.14) */}
        <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 border-b border-gray-200/70 text-gray-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Nama Layanan</th>
                  <th className="py-3 px-4">Durasi Pengerjaan</th>
                  <th className="py-3 px-4">Tarif Harga</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {services.map((svc) => (
                  <tr key={svc.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{svc.nama}</td>
                    <td className="py-3.5 px-4 text-gray-700 tabular-nums">
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-gray-400" />
                        {svc.durasiMenit} Menit
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#0E7490] tabular-nums">
                      {formatRupiah(svc.harga)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          svc.aktif
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-gray-100 text-gray-500 border border-gray-200"
                        }`}
                      >
                        {svc.aktif ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(svc)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#0E7490] hover:bg-cyan-50 transition"
                          title="Edit Layanan"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleAktif(svc)}
                          className={`p-1.5 rounded-lg transition ${
                            svc.aktif
                              ? "text-red-500 hover:bg-red-50"
                              : "text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={svc.aktif ? "Nonaktifkan" : "Aktifkan"}
                        >
                          <Power size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Tambah / Edit Layanan */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <h3 className="font-bold text-gray-900 text-base">
                  {editingService ? "Edit Layanan Gigi" : "Tambah Layanan Baru"}
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
                    Nama Layanan *
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Cabut Gigi"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Durasi (Menit) *
                    </label>
                    <select
                      value={durasiMenit}
                      onChange={(e) => setDurasiMenit(parseInt(e.target.value, 10))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                    >
                      <option value={30}>30 Menit</option>
                      <option value={60}>60 Menit</option>
                      <option value={90}>90 Menit</option>
                      <option value={120}>120 Menit</option>
                    </select>
                    <span className="text-[10px] text-gray-400 mt-1 block">Kelipatan 30 menit</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Harga (Rupiah) *
                    </label>
                    <input
                      type="number"
                      step={10000}
                      value={harga}
                      onChange={(e) => setHarga(parseInt(e.target.value, 10))}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0E7490] tabular-nums"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aktif}
                      onChange={(e) => setAktif(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0E7490] focus:ring-[#0E7490]"
                    />
                    <span className="text-xs font-medium text-gray-700">
                      Aktifkan layanan ini (bisa langsung dipilih pasien saat Buat Janji)
                    </span>
                  </label>
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
                    Simpan Layanan
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
