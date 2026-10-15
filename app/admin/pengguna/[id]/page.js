"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import {
  getActiveUser,
  getUsers,
  updateUserRole,
  toggleUserStatus,
} from "@/lib/dataStore";
import {
  User,
  ArrowLeft,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Power,
} from "lucide-react";

function DetailPenggunaContent() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id;

  const [currentUser, setCurrentUser] = useState(null);
  const [targetUser, setTargetUser] = useState(null);
  const [role, setRole] = useState("pasien");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const reload = async () => {
    const allUsers = getUsers();
    const target = allUsers.find((u) => u.id === userId);
    if (target) {
      setTargetUser(target);
      setRole(target.role);
    }

    try {
      const { fetchUsersFromFirestore } = await import("@/lib/dataStore");
      const freshUsers = await fetchUsersFromFirestore();
      const freshTarget = freshUsers?.find((u) => u.id === userId);
      if (freshTarget) {
        setTargetUser(freshTarget);
        setRole(freshTarget.role);
      }
    } catch (e) {
      console.warn("Firestore fetch error:", e);
    }
  };

  useEffect(() => {
    const user = getActiveUser();
    setCurrentUser(user);
    reload();
  }, [userId]);

  if (!targetUser) {
    return (
      <div className="text-center py-20 text-gray-500">Memuat data pengguna...</div>
    );
  }

  // PRD 4.13: Bu Ratna tidak bisa menonaktifkan atau menurunkan peran akunnya sendiri
  const isSelf = currentUser?.id === targetUser.id;

  const handleRoleSave = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (isSelf && role !== "super_admin") {
      setError("Anda tidak dapat menurunkan peran akun Anda sendiri.");
      return;
    }

    await updateUserRole(targetUser.id, role);
    setMessage(`Peran ${targetUser.nama} berhasil diubah menjadi ${role} dan tersimpan di Firestore.`);
    reload();
  };

  const handleToggleActive = async () => {
    setError("");
    setMessage("");

    if (isSelf) {
      setError("Anda tidak dapat menonaktifkan akun Anda sendiri.");
      return;
    }

    await toggleUserStatus(targetUser.id);
    const updatedStatus = !targetUser.aktif;
    setMessage(
      `Akun ${targetUser.nama} berhasil ${updatedStatus ? "diaktifkan kembali" : "dinonaktifkan"} di Firestore.`
    );
    reload();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/pengguna"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Kelola Pengguna</span>
        </Link>
        <span className="text-xs text-gray-400 tabular-nums">UID: #{targetUser.id}</span>
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
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-cyan-100 text-[#0E7490] flex items-center justify-center font-bold text-lg">
              <User size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{targetUser.nama}</h1>
              <p className="text-xs text-gray-500 mt-0.5">{targetUser.email}</p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              targetUser.aktif
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {targetUser.aktif ? "Akun Aktif" : "Akun Dinonaktifkan"}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-500 block">Nomor HP (WhatsApp)</span>
              <span className="text-sm font-semibold text-gray-800 tabular-nums">
                {targetUser.noHp || "Belum diisi"}
              </span>
            </div>
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-500 block">Terdaftar Pada</span>
              <span className="text-sm font-semibold text-gray-800 tabular-nums">
                {new Date(targetUser.dibuatPada).toLocaleDateString("id-ID", {
                  dateStyle: "medium",
                })}
              </span>
            </div>
          </div>

          {/* Change Role Section (PRD 4.13) */}
          <form onSubmit={handleRoleSave} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Shield size={15} className="text-[#0E7490]" />
                Ubah Hak Akses / Peran (Role) *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isSelf}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0E7490] disabled:bg-gray-100"
              >
                <option value="pasien">Pasien (Peran Awal Pelanggan)</option>
                <option value="resepsionis">Resepsionis (Staf Pengelola Janji)</option>
                <option value="dokter">Dokter (Tenaga Ahli Pemeriksa)</option>
                <option value="super_admin">Super Admin (Pemilik Klinik)</option>
              </select>
              {isSelf && (
                <span className="text-[11px] text-amber-600 mt-1 block">
                  Anda tidak bisa mengubah peran akun Anda sendiri.
                </span>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSelf}
                className="px-5 py-2.5 rounded-xl bg-[#0E7490] hover:bg-[#0c6179] disabled:bg-gray-300 text-white font-semibold text-xs transition flex items-center gap-2"
              >
                <Save size={15} />
                Simpan Peran Baru
              </button>
            </div>
          </form>

          {/* Deactivate / Reactivate Account (PRD 4.13) */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-gray-900 text-xs">Status Akun Pengguna</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Akun nonaktif tidak akan dapat masuk ke halaman mana pun
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleActive}
              disabled={isSelf}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                targetUser.aktif
                  ? "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <Power size={14} />
              <span>{targetUser.aktif ? "Nonaktifkan Akun" : "Aktifkan Kembali"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DetailPenggunaPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-gray-400">Memuat...</div>}>
        <DetailPenggunaContent />
      </Suspense>
    </AppLayout>
  );
}
