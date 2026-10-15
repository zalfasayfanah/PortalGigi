"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import {
  getActiveUser,
  getJanjiTemu,
  getCatatanPerawatan,
  getUsers,
  getLayanan,
} from "@/lib/dataStore";
import {
  Activity,
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileCheck2,
  AlertCircle,
} from "lucide-react";

export default function RiwayatPerawatanPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [completedRecords, setCompletedRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const user = getActiveUser();
    setCurrentUser(user);

    const allUsers = getUsers();
    setDoctors(allUsers.filter((u) => u.role === "dokter"));
    setServices(getLayanan());

    const loadRecords = (janjiList, catatanList, u = user) => {
      if (!u) return;
      const myCompletedJanji = (
        u.role === "super_admin"
          ? janjiList.filter((j) => j.status === "selesai")
          : janjiList.filter((j) => j.pasienId === u.id && j.status === "selesai")
      ).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

      const combined = myCompletedJanji.map((janji) => {
        const catatan = catatanList.find((c) => c.janjiId === janji.id);
        return {
          janji,
          catatan,
        };
      });

      setCompletedRecords(combined);
    };

    if (user) {
      loadRecords(getJanjiTemu(), getCatatanPerawatan());
    }

    import("@/lib/dataStore").then(({ fetchJanjiFromFirestore, fetchCatatanFromFirestore, fetchUsersFromFirestore, fetchLayananFromFirestore }) => {
      Promise.all([
        fetchJanjiFromFirestore(),
        fetchCatatanFromFirestore(),
        fetchUsersFromFirestore(),
        fetchLayananFromFirestore(),
      ]).then(([freshJanji, freshCatatan, freshUsers, freshLayanan]) => {
        if (freshUsers) setDoctors(freshUsers.filter((d) => d.role === "dokter"));
        if (freshLayanan) setServices(freshLayanan);
        if (freshJanji && freshCatatan && user) {
          loadRecords(freshJanji, freshCatatan, user);
        }
      });
    });
  }, []);

  const getDoctorName = (id) => {
    const doc = doctors.find((d) => d.id === id);
    return doc ? doc.nama : "drg. Dokter";
  };

  const getServiceName = (id) => {
    const s = services.find((svc) => svc.id === id);
    return s ? s.nama : "Layanan Gigi";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Perawatan</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Catatan tindakan medis dan anjuran dokter dari setiap kunjungan yang telah selesai
          </p>
        </div>

        <div className="space-y-4">
          {completedRecords.length > 0 ? (
            completedRecords.map(({ janji, catatan }) => (
              <div
                key={janji.id}
                className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
                  <div>
                    <span className="text-xs text-gray-400 tabular-nums">Janji #{janji.id}</span>
                    <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                      {getServiceName(janji.layananId)}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status="selesai" />
                    <span className="text-xs font-semibold text-gray-600 tabular-nums bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
                      {janji.tanggal}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <User size={15} className="text-[#0E7490]" />
                    <span>
                      Dokter Pemeriksa: <strong>{getDoctorName(janji.dokterId)}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={15} className="text-[#0E7490]" />
                    <span>
                      Jam Kunjungan: <strong className="tabular-nums">{janji.jam} WITA</strong>
                    </span>
                  </div>
                </div>

                {/* Medical Records (Tindakan & Catatan Dokter) */}
                <div className="p-4 rounded-xl bg-cyan-50/40 border border-cyan-100 space-y-3">
                  <div>
                    <span className="text-xs font-bold text-[#0E7490] uppercase tracking-wider flex items-center gap-1.5">
                      <Stethoscope size={14} /> Tindakan yang Dilakukan:
                    </span>
                    <p className="text-sm font-medium text-gray-800 mt-1">
                      {catatan?.tindakan || "Pemeriksaan dan tindakan klinis"}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-[#0E7490] uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck2 size={14} /> Catatan & Anjuran Dokter:
                    </span>
                    <p className="text-xs text-gray-700 mt-1 bg-white p-3 rounded-lg border border-cyan-100">
                      {catatan?.catatan || "Jaga kebersihan gigi dan kontrol kembali jika keluhan berulang."}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-16 rounded-2xl border border-gray-200/70 shadow-sm text-center">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-800">Belum Ada Riwayat Perawatan</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Setelah Anda menyelesaikan kunjungan dan dokter mengisi tindakan pemeriksaan, catatan perawatan akan otomatis muncul di sini.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
