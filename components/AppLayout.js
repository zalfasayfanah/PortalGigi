"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  getActiveUser,
  setActiveUser,
  getUsers,
  STATUS_CONFIG,
} from "@/lib/dataStore";
import {
  Calendar,
  Clock,
  User,
  Users,
  Settings,
  FileText,
  Activity,
  PlusCircle,
  ClipboardList,
  BarChart3,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Stethoscope,
  Smile,
  ShieldAlert,
} from "lucide-react";

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUserState] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  useEffect(() => {
    const user = getActiveUser();
    setCurrentUserState(user);
    setAllUsers(getUsers());

    const handleUserChange = () => {
      setCurrentUserState(getActiveUser());
      setAllUsers(getUsers());
    };

    window.addEventListener("active_user_changed", handleUserChange);
    return () => window.removeEventListener("active_user_changed", handleUserChange);
  }, []);

  const handleSwitchUser = (user) => {
    setActiveUser(user);
    setIsRoleDropdownOpen(false);
    // Redirect to home of the role
    if (user.role === "pasien") router.push("/beranda");
    else if (user.role === "resepsionis") router.push("/resepsionis");
    else if (user.role === "dokter") router.push("/dokter");
    else if (user.role === "super_admin") router.push("/admin");
  };

  const handleLogout = () => {
    router.push("/masuk");
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F9]">
        <div className="flex items-center gap-3 text-[#0E7490] font-medium">
          <div className="w-6 h-6 border-2 border-[#0E7490] border-t-transparent rounded-full animate-spin"></div>
          <span>Memuat aplikasi...</span>
        </div>
      </div>
    );
  }

  // Define menus according to PRD 3.1
  const role = currentUser.role;

  const patientMenus = [
    { label: "Beranda", href: "/beranda", icon: Smile },
    { label: "Janji Saya", href: "/janji", icon: Calendar },
    { label: "Buat Janji", href: "/janji/baru", icon: PlusCircle },
    { label: "Riwayat Perawatan", href: "/riwayat", icon: Activity },
    { label: "Profil", href: "/profil", icon: User },
  ];

  const receptionistMenus = [
    { label: "Dasbor Resepsionis", href: "/resepsionis", icon: ClipboardList },
    { label: "Kelola Janji", href: "/resepsionis/janji", icon: Calendar },
    { label: "Data Pasien", href: "/resepsionis/pasien", icon: Users },
    { label: "Profil", href: "/profil", icon: User },
  ];

  const doctorMenus = [
    { label: "Dasbor Dokter", href: "/dokter", icon: Stethoscope },
    { label: "Profil", href: "/profil", icon: User },
  ];

  const adminMenus = [
    { label: "Dasbor Admin", href: "/admin", icon: BarChart3 },
    { label: "Kelola Pengguna", href: "/admin/pengguna", icon: Users },
    { label: "Layanan", href: "/admin/layanan", icon: Settings },
    { label: "Jadwal Dokter", href: "/admin/jadwal-dokter", icon: Clock },
    { label: "Laporan", href: "/admin/laporan", icon: FileText },
    { label: "Profil", href: "/profil", icon: User },
  ];

  let currentNavItems = [];
  if (role === "pasien") currentNavItems = patientMenus;
  else if (role === "resepsionis") currentNavItems = receptionistMenus;
  else if (role === "dokter") currentNavItems = doctorMenus;
  else if (role === "super_admin") {
    // Super admin has all menus
    currentNavItems = [
      { category: "Admin Klinik", items: adminMenus },
      { category: "Modul Pasien", items: patientMenus.filter(m => m.label !== "Profil") },
      { category: "Modul Resepsionis", items: receptionistMenus.filter(m => m.label !== "Profil") },
      { category: "Modul Dokter", items: doctorMenus.filter(m => m.label !== "Profil") },
    ];
  }

  const roleLabels = {
    pasien: "Pasien",
    resepsionis: "Resepsionis",
    dokter: "Dokter",
    super_admin: "Super Admin",
  };

  const roleColors = {
    pasien: "bg-emerald-100 text-emerald-800 border-emerald-300",
    resepsionis: "bg-blue-100 text-blue-800 border-blue-300",
    dokter: "bg-purple-100 text-purple-800 border-purple-300",
    super_admin: "bg-amber-100 text-amber-800 border-amber-300",
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7F9]">
      {/* Top Navbar */}
      <header className="bg-[#0E7490] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-[#0c6179] transition text-white"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                <Smile className="text-white w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight block leading-tight">
                  Senyum Rekah
                </span>
                <span className="text-xs text-cyan-200 block">Klinik Gigi Makassar</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Role Switcher Demo Bar */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition"
              >
                <span>Akun: <strong>{currentUser.nama}</strong> ({roleLabels[currentUser.role]})</span>
                <ChevronDown size={14} />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 text-gray-800">
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
                    Ganti Akun Demo (4 Peran)
                  </div>
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleSwitchUser(u)}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-50 transition ${
                        u.id === currentUser.id ? "bg-cyan-50 font-semibold text-[#0E7490]" : ""
                      }`}
                    >
                      <div>
                        <div className="font-medium">{u.nama}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${roleColors[u.role]}`}>
                        {roleLabels[u.role]}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              title="Keluar"
              className="flex items-center gap-1.5 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm transition"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/70 p-4 sticky top-24">
            <div className="mb-4 pb-3 border-b border-gray-100">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Peran Aktif</div>
              <div className="flex items-center justify-between mt-1">
                <span className="font-semibold text-gray-800">{currentUser.nama}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${roleColors[currentUser.role]}`}>
                  {roleLabels[currentUser.role]}
                </span>
              </div>
            </div>

            <nav className="space-y-1">
              {role === "super_admin" ? (
                currentNavItems.map((group, idx) => (
                  <div key={idx} className="mb-4">
                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                      {group.category}
                    </div>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                            isActive
                              ? "bg-[#0E7490] text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                        >
                          <Icon size={18} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))
              ) : (
                currentNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                        isActive
                          ? "bg-[#0E7490] text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })
              )}
            </nav>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            <div className="relative bg-white w-72 max-w-[80%] h-full p-6 shadow-2xl flex flex-col z-10 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <div className="font-bold text-[#0E7490] text-lg">Menu Portal</div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="space-y-1">
                {role === "super_admin" ? (
                  currentNavItems.map((group, idx) => (
                    <div key={idx} className="mb-4">
                      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                        {group.category}
                      </div>
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                              isActive
                                ? "bg-[#0E7490] text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            <Icon size={18} />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  currentNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                          isActive
                            ? "bg-[#0E7490] text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })
                )}
              </nav>
            </div>
          </div>
        )}

        {/* Page Content Panel */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
