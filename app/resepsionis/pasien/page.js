"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { getUsers } from "@/lib/dataStore";
import { Users, Search, Phone, Mail, User } from "lucide-react";

export default function DataPasienPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const allUsers = getUsers();
    setPatients(allUsers.filter((u) => u.role === "pasien"));
  }, []);

  const filteredPatients = patients.filter(
    (p) =>
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.noHp && p.noHp.includes(search))
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Kontak Pasien</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Daftar kontak seluruh pasien terdaftar di Klinik Gigi Senyum Rekah
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari nama atau nomor HP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
          {filteredPatients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/75 border-b border-gray-200/70 text-gray-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Nama Pasien</th>
                    <th className="py-3 px-4">Nomor HP (WhatsApp)</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3.5 px-4 font-semibold text-gray-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-cyan-100 text-[#0E7490] flex items-center justify-center font-bold text-xs shrink-0">
                          <User size={15} />
                        </div>
                        <span>{patient.nama}</span>
                      </td>
                      <td className="py-3.5 px-4 tabular-nums text-gray-700">
                        {patient.noHp ? (
                          <a
                            href={`tel:${patient.noHp}`}
                            className="flex items-center gap-1.5 hover:text-[#0E7490]"
                          >
                            <Phone size={13} className="text-[#0E7490]" />
                            {patient.noHp}
                          </a>
                        ) : (
                          <span className="text-gray-400 italic">Belum diisi</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Mail size={13} className="text-gray-400" />
                          <span>{patient.email}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            patient.aktif
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {patient.aktif ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 px-4 text-gray-400 text-xs">
              Tidak ada pasien yang cocok dengan pencarian &ldquo;{search}&rdquo;.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
