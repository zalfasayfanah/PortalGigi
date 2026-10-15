"use client";

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
export {
  initialUsers,
  initialLayanan,
  initialJadwalDokter,
  initialJanjiTemu,
  initialCatatanPerawatan,
  initialSlotTerisi,
} from "./seedData";
import {
  initialUsers,
  initialLayanan,
  initialJadwalDokter,
  initialJanjiTemu,
  initialCatatanPerawatan,
  initialSlotTerisi,
} from "./seedData";

// Local storage keys for caching / offline fallback
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

// Active user session
export function getActiveUser() {
  if (typeof window === "undefined") return null;
  const stored = getStoredData(ACTIVE_USER_KEY, null);
  return stored || null;
}

export function setActiveUser(user) {
  setStoredData(ACTIVE_USER_KEY, user);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("active_user_changed"));
  }
}

// ==========================================
// 1. Users
// ==========================================
export function getUsers() {
  return getStoredData(USERS_KEY, initialUsers);
}

export async function fetchUsersFromFirestore() {
  try {
    const snap = await getDocs(collection(db, "users"));
    const list = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      dibuatPada: d.data().dibuatPada?.toDate?.()
        ? d.data().dibuatPada.toDate().toISOString()
        : d.data().dibuatPada || new Date().toISOString(),
    }));
    if (list.length > 0) {
      setStoredData(USERS_KEY, list);
      return list;
    }
  } catch (err) {
    console.warn("Firestore fetch users fallback:", err);
  }
  return getUsers();
}

export async function updateUserRole(userId, newRole) {
  const users = getUsers();
  const updated = users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
  setStoredData(USERS_KEY, updated);

  try {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, { role: newRole });
  } catch (e) {
    console.error("Firestore updateUserRole error:", e);
  }
  return updated;
}

export async function toggleUserStatus(userId) {
  const users = getUsers();
  let newStatus = true;
  const updated = users.map((u) => {
    if (u.id === userId) {
      newStatus = !u.aktif;
      return { ...u, aktif: newStatus };
    }
    return u;
  });
  setStoredData(USERS_KEY, updated);

  try {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, { aktif: newStatus });
  } catch (e) {
    console.error("Firestore toggleUserStatus error:", e);
  }
  return updated;
}

// ==========================================
// 2. Layanan
// ==========================================
export function getLayanan() {
  return getStoredData(LAYANAN_KEY, initialLayanan);
}

export async function fetchLayananFromFirestore() {
  try {
    const snap = await getDocs(collection(db, "layanan"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (list.length > 0) {
      setStoredData(LAYANAN_KEY, list);
      return list;
    }
  } catch (err) {
    console.warn("Firestore fetch layanan fallback:", err);
  }
  return getLayanan();
}

export async function addLayanan(item) {
  const layanan = getLayanan();
  const newItemId = `layanan_${Date.now()}`;
  const newItem = {
    ...item,
    id: newItemId,
  };
  const updated = [...layanan, newItem];
  setStoredData(LAYANAN_KEY, updated);

  try {
    await setDoc(doc(db, "layanan", newItemId), {
      nama: item.nama,
      durasiMenit: Number(item.durasiMenit),
      harga: Number(item.harga),
      aktif: Boolean(item.aktif),
    });
  } catch (e) {
    console.error("Firestore addLayanan error:", e);
  }
  return updated;
}

export async function updateLayanan(id, item) {
  const layanan = getLayanan();
  const updated = layanan.map((l) => (l.id === id ? { ...l, ...item } : l));
  setStoredData(LAYANAN_KEY, updated);

  try {
    await updateDoc(doc(db, "layanan", id), item);
  } catch (e) {
    console.error("Firestore updateLayanan error:", e);
  }
  return updated;
}

// ==========================================
// 3. Jadwal Dokter
// ==========================================
export function getJadwalDokter() {
  return getStoredData(JADWAL_KEY, initialJadwalDokter);
}

export async function fetchJadwalFromFirestore() {
  try {
    const snap = await getDocs(collection(db, "jadwal_dokter"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (list.length > 0) {
      setStoredData(JADWAL_KEY, list);
      return list;
    }
  } catch (err) {
    console.warn("Firestore fetch jadwal fallback:", err);
  }
  return getJadwalDokter();
}

export async function addJadwalDokter(item) {
  const jadwal = getJadwalDokter();
  const newItemId = `jadwal_${Date.now()}`;
  const newItem = {
    ...item,
    id: newItemId,
  };
  const updated = [...jadwal, newItem];
  setStoredData(JADWAL_KEY, updated);

  try {
    await setDoc(doc(db, "jadwal_dokter", newItemId), {
      dokterId: item.dokterId,
      hari: item.hari.toLowerCase(),
      jamMulai: item.jamMulai,
      jamSelesai: item.jamSelesai,
    });
  } catch (e) {
    console.error("Firestore addJadwalDokter error:", e);
  }
  return updated;
}

export async function deleteJadwalDokter(id) {
  const jadwal = getJadwalDokter();
  const updated = jadwal.filter((j) => j.id !== id);
  setStoredData(JADWAL_KEY, updated);

  try {
    await deleteDoc(doc(db, "jadwal_dokter", id));
  } catch (e) {
    console.error("Firestore deleteJadwal error:", e);
  }
  return updated;
}

// ==========================================
// 4. Janji Temu (Alur Inti)
// ==========================================
export function getJanjiTemu() {
  return getStoredData(JANJI_KEY, initialJanjiTemu);
}

export async function fetchJanjiFromFirestore() {
  try {
    const snap = await getDocs(collection(db, "janji_temu"));
    const list = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      dibuatPada: d.data().dibuatPada?.toDate?.()
        ? d.data().dibuatPada.toDate().toISOString()
        : d.data().dibuatPada || new Date().toISOString(),
    }));
    if (list.length > 0) {
      setStoredData(JANJI_KEY, list);
      return list;
    }
  } catch (err) {
    console.warn("Firestore fetch janji fallback:", err);
  }
  return getJanjiTemu();
}

export async function addJanjiTemu(item) {
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

  // Sync to Cloud Firestore
  try {
    await setDoc(doc(db, "janji_temu", newJanjiId), {
      pasienId: item.pasienId,
      dokterId: item.dokterId,
      layananId: item.layananId,
      tanggal: item.tanggal,
      jam: item.jam,
      keluhan: item.keluhan,
      status: "menunggu",
      alasanBatal: "",
      dibuatPada: serverTimestamp(),
    });

    // Write slot_terisi (PRD 7.1)
    await setDoc(doc(db, "slot_terisi", newJanjiId), {
      dokterId: item.dokterId,
      tanggal: item.tanggal,
      jam: item.jam,
      durasiMenit: Number(item.durasiMenit || 30),
    });
  } catch (e) {
    console.error("Firestore addJanjiTemu error:", e);
  }

  return newJanji;
}

export async function updateJanjiStatus(janjiId, status, alasanBatal = "") {
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

  // Sync to Cloud Firestore
  try {
    const updateData = { status };
    if (alasanBatal) updateData.alasanBatal = alasanBatal;
    await updateDoc(doc(db, "janji_temu", janjiId), updateData);

    if (status === "dibatalkan") {
      await deleteDoc(doc(db, "slot_terisi", janjiId));
    }
  } catch (e) {
    console.error("Firestore updateJanjiStatus error:", e);
  }

  return updated;
}

export async function rescheduleJanji(janjiId, tanggal, jam) {
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

  // Sync to Cloud Firestore
  try {
    await updateDoc(doc(db, "janji_temu", janjiId), { tanggal, jam });
    await updateDoc(doc(db, "slot_terisi", janjiId), { tanggal, jam });
  } catch (e) {
    console.error("Firestore rescheduleJanji error:", e);
  }

  return updated;
}

// ==========================================
// 5. Catatan Perawatan (Alur Inti)
// ==========================================
export function getCatatanPerawatan() {
  return getStoredData(CATATAN_KEY, initialCatatanPerawatan);
}

export async function fetchCatatanFromFirestore() {
  try {
    const snap = await getDocs(collection(db, "catatan_perawatan"));
    const list = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      dibuatPada: d.data().dibuatPada?.toDate?.()
        ? d.data().dibuatPada.toDate().toISOString()
        : d.data().dibuatPada || new Date().toISOString(),
    }));
    if (list.length > 0) {
      setStoredData(CATATAN_KEY, list);
      return list;
    }
  } catch (err) {
    console.warn("Firestore fetch catatan fallback:", err);
  }
  return getCatatanPerawatan();
}

export async function addCatatanPerawatan(item) {
  const catatan = getCatatanPerawatan();
  const newCatatanId = `catatan_${Date.now()}`;
  const newCatatan = {
    ...item,
    id: newCatatanId,
    dibuatPada: new Date().toISOString(),
  };
  const updated = [newCatatan, ...catatan];
  setStoredData(CATATAN_KEY, updated);

  // Sync to Cloud Firestore
  try {
    await setDoc(doc(db, "catatan_perawatan", newCatatanId), {
      janjiId: item.janjiId,
      pasienId: item.pasienId,
      dokterId: item.dokterId,
      tindakan: item.tindakan,
      catatan: item.catatan,
      dibuatPada: serverTimestamp(),
    });
  } catch (e) {
    console.error("Firestore addCatatanPerawatan error:", e);
  }

  return newCatatan;
}

// ==========================================
// 6. Slot Terisi
// ==========================================
export function getSlotTerisi() {
  return getStoredData(SLOT_KEY, initialSlotTerisi);
}

export async function fetchSlotsFromFirestore() {
  try {
    const snap = await getDocs(collection(db, "slot_terisi"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (list.length > 0) {
      setStoredData(SLOT_KEY, list);
      return list;
    }
  } catch (err) {
    console.warn("Firestore fetch slots fallback:", err);
  }
  return getSlotTerisi();
}

// ==========================================
// Utilities & Config
// ==========================================
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
