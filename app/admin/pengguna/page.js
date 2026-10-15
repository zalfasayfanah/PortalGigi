"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { getUsers } from "@/lib/dataStore";
import { Users, Search, ArrowRight, ShieldCheck, User } from "lucide-react";

export default function KelolaPenggunaPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setUsers(getUsers());

    import("@/lib/dataStore").then(({ fetchUsersFromFirestore }) => {
      fetchUsersFromFirestore().then((freshUsers) => {
        if (freshUsers) setUsers(freshUsers);
      });
    });
  }, []);

  const roleLabels = {
    pasien: "Pasien",
    resepsionis: "Resepsionis",
    dokter: "Dokter Gigi",
    super_admin: "Super Admin",
  };

  const roleBadges = {
    pasien: "bg-emerald-50 text-emerald-700 border-emerald-200",
    resepsionis: "bg-blue-50 text-blue-700 border-blue-200",
    dokter: "bg-purple-50 text-purple-700 border-purple-200",
    super_admin: "bg-amber-50 text-amber-700 border-amber-200",
  };

  const filteredUsers = users.filter(
    (u) =>
      u.nama.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Pengguna</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Atur hak akses peran (Role) dan status aktif akun pengguna sistem
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari nama, email, atau peran..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
            />
          </div>
        </div>

        {/* User Table (PRD 4.13) */}
        <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 border-b border-gray-200/70 text-gray-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">Kontak (HP)</th>
                  <th className="py-3 px-4">Peran (Role)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 px-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-cyan-100 text-[#0E7490] flex items-center justify-center font-bold text-xs shrink-0">
                          <User size={15} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{u.nama}</div>
                          <div className="text-[11px] text-gray-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 tabular-nums text-gray-600">
                      {u.noHp || "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          roleBadges[u.role] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {roleLabels[u.role] || u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.aktif
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {u.aktif ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/pengguna/${u.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-[#0E7490] hover:underline"
                      >
                        Kelola <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
