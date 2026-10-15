"use client";

import {
  initialUsers,
  initialLayanan,
  initialJadwalDokter,
  initialJanjiTemu,
  initialCatatanPerawatan,
  initialSlotTerisi,
} from "./seedData";

// Local storage keys
const USERS_KEY = "senyum_users";
const LAYANAN_KEY = "senyum_layanan";
const JADWAL_KEY = "senyum_jadwal";
const JANJI_KEY = "senyum_janji";
const CATATAN_KEY = "senyum_catatan";
const SLOT_KEY = "senyum_slot";
const ACTIVE_USER_KEY = "senyum_active_user";

export function getStoredData(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error("Storage error:", e);
    return fallback;
  }
}

export function setStoredData(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage write error:", e);
  }
}

// Active user session (Mock auth before Firebase or for instant switching)
export function getActiveUser() {
  if (typeof window === "undefined") return initialUsers[4]; // Default to Andi (pasien)
  const stored = getStoredData(ACTIVE_USER_KEY, null);
  if (stored) return stored;
  // Default to Andi
  return initialUsers[4];
}

export function setActiveUser(user) {
  setStoredData(ACTIVE_USER_KEY, user);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("active_user_changed"));
  }
}

// Users
export function getUsers() {
  return getStoredData(USERS_KEY, initialUsers);
}

export function updateUserRole(userId, newRole) {
  const users = getUsers();
  const updated = users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
  setStoredData(USERS_KEY, updated);
  return updated;
}

export function toggleUserStatus(userId) {
  const users = getUsers();
  const updated = users.map((u) => (u.id === userId ? { ...u, aktif: !u.aktif } : u));
  setStoredData(USERS_KEY, updated);
  return updated;
}

// Layanan
export function getLayanan() {
  return getStoredData(LAYANAN_KEY, initialLayanan);
}

export function addLayanan(item) {
  const layanan = getLayanan();
  const newItem = {
    ...item,
    id: `layanan_${Date.now()}`,
  };
  const updated = [...layanan, newItem];
  setStoredData(LAYANAN_KEY, updated);
  return updated;
}

export function updateLayanan(id, item) {
  const layanan = getLayanan();
  const updated = layanan.map((l) => (l.id === id ? { ...l, ...item } : l));
  setStoredData(LAYANAN_KEY, updated);
  return updated;
}

// Jadwal Dokter
export function getJadwalDokter() {
  return getStoredData(JADWAL_KEY, initialJadwalDokter);
}

export function addJadwalDokter(item) {
  const jadwal = getJadwalDokter();
  const newItem = {
    ...item,
    id: `jadwal_${Date.now()}`,
  };
  const updated = [...jadwal, newItem];
  setStoredData(JADWAL_KEY, updated);
  return updated;
}

export function updateJadwalDokter(id, item) {
  const jadwal = getJadwalDokter();
  const updated = jadwal.map((j) => (j.id === id ? { ...j, ...item } : j));
  setStoredData(JADWAL_KEY, updated);
  return updated;
}

// Janji Temu
export function getJanjiTemu() {
  return getStoredData(JANJI_KEY, initialJanjiTemu);
}

export function addJanjiTemu(item) {
  const janji = getJanjiTemu();
  const newJanjiId = `janji_${Date.now()}`;
  const newJanji = {
    ...item,
    id: newJanjiId,
    status: "menunggu",
    alasanBatal: "",
    dibuatPada: new Date().toISOString(),
  };
  const updated = [newJanji, ...janji];
  setStoredData(JANJI_KEY, updated);

  // Add slot_terisi
  const slots = getSlotTerisi();
  const newSlot = {
    id: newJanjiId,
    dokterId: item.dokterId,
    tanggal: item.tanggal,
    jam: item.jam,
    durasiMenit: item.durasiMenit || 30,
  };
  setStoredData(SLOT_KEY, [...slots, newSlot]);

  return newJanji;
}

export function updateJanjiStatus(janjiId, status, alasanBatal = "") {
  const janji = getJanjiTemu();
  const updated = janji.map((j) => {
    if (j.id === janjiId) {
      return { ...j, status, alasanBatal: alasanBatal || j.alasanBatal };
    }
    return j;
  });
  setStoredData(JANJI_KEY, updated);

  // If status is dibatalkan, remove from slot_terisi
  if (status === "dibatalkan") {
    const slots = getSlotTerisi();
    const updatedSlots = slots.filter((s) => s.id !== janjiId);
    setStoredData(SLOT_KEY, updatedSlots);
  }

  return updated;
}

export function rescheduleJanji(janjiId, tanggal, jam) {
  const janji = getJanjiTemu();
  const updated = janji.map((j) => {
    if (j.id === janjiId) {
      return { ...j, tanggal, jam };
    }
    return j;
  });
  setStoredData(JANJI_KEY, updated);

  // Update slot_terisi
  const slots = getSlotTerisi();
  const updatedSlots = slots.map((s) => {
    if (s.id === janjiId) {
      return { ...s, tanggal, jam };
    }
    return s;
  });
  setStoredData(SLOT_KEY, updatedSlots);

  return updated;
}

// Catatan Perawatan
export function getCatatanPerawatan() {
  return getStoredData(CATATAN_KEY, initialCatatanPerawatan);
}

export function addCatatanPerawatan(item) {
  const catatan = getCatatanPerawatan();
  const newCatatan = {
    ...item,
    id: `catatan_${Date.now()}`,
    dibuatPada: new Date().toISOString(),
  };
  const updated = [newCatatan, ...catatan];
  setStoredData(CATATAN_KEY, updated);
  return newCatatan;
}

// Slot Terisi
export function getSlotTerisi() {
  return getStoredData(SLOT_KEY, initialSlotTerisi);
}

// Status Badges & Colors according to PRD 5.2
export const STATUS_CONFIG = {
  menunggu: {
    label: "Menunggu",
    color: "#F59E0B",
    bg: "#FEF3C7",
    text: "#B45309",
  },
  dikonfirmasi: {
    label: "Dikonfirmasi",
    color: "#2563EB",
    bg: "#DBEAFE",
    text: "#1D4ED8",
  },
  hadir: {
    label: "Hadir",
    color: "#7C3AED",
    bg: "#EDE9FE",
    text: "#6D28D9",
  },
  selesai: {
    label: "Selesai",
    color: "#15A66A",
    bg: "#DCFCE7",
    text: "#15803D",
  },
  dibatalkan: {
    label: "Dibatalkan",
    color: "#E53935",
    bg: "#FEE2E2",
    text: "#B91C1C",
  },
};

export function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
}
