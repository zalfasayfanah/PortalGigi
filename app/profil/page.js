"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { getActiveUser, setActiveUser, getUsers, setStoredData } from "@/lib/dataStore";
import { User, Mail, Phone, Shield, Save, CheckCircle2, AlertCircle } from "lucide-react";

export default function ProfilPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getActiveUser();
    if (user) {
      setCurrentUser(user);
      setNama(user.nama || "");
      setNoHp(user.noHp || "");
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!nama.trim()) {
      setError("Nama tidak boleh kosong.");
      return;
    }
    if (noHp && (!noHp.startsWith("08") || !/^\d+$/.test(noHp))) {
      setError("Nomor HP harus berupa angka dan diawali dengan 08.");
      return;
    }

    const updatedUser = {
      ...currentUser,
      nama: nama.trim(),
      noHp: noHp.trim(),
    };

    // Update in users list
    const users = getUsers();
    const updatedUsers = users.map((u) => (u.id === currentUser.id ? updatedUser : u));
    setStoredData("senyum_users", updatedUsers);

    // Update active user session
    setActiveUser(updatedUser);
    setCurrentUser(updatedUser);
    setMessage("Profil berhasil diperbarui.");
  };

  if (!currentUser) return null;

  const roleLabels = {
    pasien: "Pasien",
    resepsionis: "Resepsionis",
    dokter: "Dokter Gigi",
    super_admin: "Super Admin (Pemilik Klinik)",
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Kelola data identitas dan informasi kontak Anda di Portal Senyum Rekah
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/70 shadow-sm space-y-6">
          {message && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-sm border border-emerald-200">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Nama Lengkap *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0E7490] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Nomor HP (WhatsApp) *
              </label>
              <input
                type="tel"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="081234567890"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0E7490] text-sm tabular-nums"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Hanya angka diawali 08</span>
            </div>

            {/* Readonly fields as per PRD 4.5 */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Alamat Email (Tidak dapat diubah)
              </label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Peran Pengguna (Dikelola Super Admin)
              </label>
              <input
                type="text"
                value={roleLabels[currentUser.role] || currentUser.role}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
              />
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0E7490] hover:bg-[#0c6179] text-white font-semibold text-sm shadow-sm transition"
              >
                <Save size={16} />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
