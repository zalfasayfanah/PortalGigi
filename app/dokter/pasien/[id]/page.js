"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import {
  getActiveUser,
  getUsers,
  getCatatanPerawatan,
  getJanjiTemu,
  getLayanan,
} from "@/lib/dataStore";
import {
  User,
  ArrowLeft,
  Calendar,
  Clock,
  AlertTriangle,
} from "lucide-react";

function RiwayatPasienDokterContent() {
  const params = useParams();
  const pasienId = params?.id;

  const [currentUser, setCurrentUser] = useState(null);
  const [patient, setPatient] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [services, setServices] = useState([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const user = getActiveUser();
    setCurrentUser(user);

    if (pasienId) {
      const allUsers = getUsers();
      const p = allUsers.find((u) => u.id === pasienId && u.role === "pasien");
      if (!p) {
        setNotFound(true);
        return;
      }
      setPatient(p);

      const allCatatan = getCatatanPerawatan();
      const allJanji = getJanjiTemu();
      const allLayanan = getLayanan();
      setServices(allLayanan);

      // PRD 4.11: Hanya catatan perawatan pasien ini yang pernah ditulis dokter tersebut
      const relevantCatatan = allCatatan.filter((c) => {
        const matchPatient = c.pasienId === pasienId;
        const matchDoctor =
          user && user.role === "super_admin" ? true : c.dokterId === user?.id;
        return matchPatient && matchDoctor;
      });

      if (relevantCatatan.length === 0 && user && user.role !== "super_admin") {
        setNotFound(true);
        return;
      }

      const mapped = relevantCatatan.map((c) => {
        const janji = allJanji.find((j) => j.id === c.janjiId);
        const svc = allLayanan.find((l) => l.id === janji?.layananId);
        return {
          ...c,
          tanggal: janji?.tanggal || "-",
          jam: janji?.jam || "-",
          layananNama: svc?.nama || "Pemeriksaan Gigi",
        };
      });

      setHistoryRecords(mapped);
    }
  }, [pasienId]);

  if (notFound) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center max-w-lg mx-auto">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900">Pasien tidak ditemukan</h2>
        <p className="text-sm text-gray-500 mt-1">
          Anda belum pernah menangani pasien ini sebelumnya atau data pasien tidak terdaftar.
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
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-cyan-100 text-[#0E7490] flex items-center justify-center font-bold text-lg">
            <User size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">
              Riwayat Pasien
            </span>
            <h1 className="text-xl font-bold text-gray-900">{patient?.nama}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Kontak: {patient?.noHp || "-"} · {patient?.email}
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-700 rounded-lg tabular-nums">
          {historyRecords.length} Catatan Penanganan
        </span>
      </div>

      <div className="space-y-4">
        {historyRecords.map((record) => (
          <div
            key={record.id}
            className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-[#0E7490]" />
                <span className="font-bold text-sm text-gray-900 tabular-nums">
                  {record.tanggal}
                </span>
                <span className="text-xs text-gray-400 tabular-nums">
                  ({record.jam} WITA)
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-cyan-50 text-[#0E7490] rounded-full border border-cyan-100">
                {record.layananNama}
              </span>
            </div>

            <div>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                Tindakan:
              </span>
              <p className="text-sm font-medium text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100">
                {record.tindakan}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                Catatan Dokter:
              </span>
              <p className="text-xs text-gray-700 bg-white p-3 rounded-xl border border-gray-200">
                {record.catatan}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RiwayatPasienDokterPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-gray-400">Memuat...</div>}>
        <RiwayatPasienDokterContent />
      </Suspense>
    </AppLayout>
  );
}
