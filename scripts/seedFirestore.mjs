import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD26iGRZQkwQXkyNlCFxY9-ko_T7oxYYn4",
  authDomain: "sesi1bootcamp.firebaseapp.com",
  projectId: "sesi1bootcamp",
  storageBucket: "sesi1bootcamp.firebasestorage.app",
  messagingSenderId: "348752754301",
  appId: "1:348752754301:web:50848c961945d5b4462314",
  measurementId: "G-QLX4Q97KCJ",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log("Seeding Firestore for Portal Janji Senyum Rekah (sesi1bootcamp)...");

  // 1. Users (PRD 7.1)
  const users = [
    {
      id: "user_ratna",
      nama: "Bu Ratna",
      email: "ratna@senyumrekah.id",
      noHp: "081299990001",
      role: "super_admin",
      aktif: true,
      dibuatPada: Timestamp.fromDate(new Date("2026-10-01T08:00:00Z")),
    },
    {
      id: "user_laras",
      nama: "Laras",
      email: "laras@senyumrekah.id",
      noHp: "081299990002",
      role: "resepsionis",
      aktif: true,
      dibuatPada: Timestamp.fromDate(new Date("2026-10-01T08:00:00Z")),
    },
    {
      id: "user_bima",
      nama: "drg. Bima",
      email: "bima@senyumrekah.id",
      noHp: "081299990003",
      role: "dokter",
      aktif: true,
      dibuatPada: Timestamp.fromDate(new Date("2026-10-01T08:00:00Z")),
    },
    {
      id: "user_sinta",
      nama: "drg. Sinta",
      email: "sinta@senyumrekah.id",
      noHp: "081299990004",
      role: "dokter",
      aktif: true,
      dibuatPada: Timestamp.fromDate(new Date("2026-10-01T08:00:00Z")),
    },
    {
      id: "user_andi",
      nama: "Andi Pratama",
      email: "andi@gmail.com",
      noHp: "081234567890",
      role: "pasien",
      aktif: true,
      dibuatPada: Timestamp.fromDate(new Date("2026-10-02T09:30:00Z")),
    },
    {
      id: "user_maya",
      nama: "Maya Kusuma",
      email: "maya@gmail.com",
      noHp: "081298765432",
      role: "pasien",
      aktif: true,
      dibuatPada: Timestamp.fromDate(new Date("2026-10-03T11:15:00Z")),
    },
  ];

  for (const u of users) {
    const { id, ...data } = u;
    await setDoc(doc(db, "users", id), data);
    console.log(`  ✓ users/${id} (${data.nama} - ${data.role})`);
  }

  // 2. Layanan (PRD 7.1)
  const layanan = [
    {
      id: "layanan_1",
      nama: "Konsultasi & Pemeriksaan Gigi",
      durasiMenit: 30,
      harga: 100000,
      aktif: true,
    },
    {
      id: "layanan_2",
      nama: "Pembersihan Karang Gigi (Scaling)",
      durasiMenit: 30,
      harga: 250000,
      aktif: true,
    },
    {
      id: "layanan_3",
      nama: "Tambal Gigi Komposit",
      durasiMenit: 60,
      harga: 350000,
      aktif: true,
    },
    {
      id: "layanan_4",
      nama: "Cabut Gigi",
      durasiMenit: 30,
      harga: 250000,
      aktif: true,
    },
    {
      id: "layanan_5",
      nama: "Perawatan Saluran Akar",
      durasiMenit: 60,
      harga: 500000,
      aktif: true,
    },
  ];

  for (const l of layanan) {
    const { id, ...data } = l;
    await setDoc(doc(db, "layanan", id), data);
    console.log(`  ✓ layanan/${id} (${data.nama})`);
  }

  // 3. Jadwal Dokter (PRD 7.1)
  const jadwal = [
    {
      id: "jadwal_bima_1",
      dokterId: "user_bima",
      hari: "senin",
      jamMulai: "09:00",
      jamSelesai: "15:00",
    },
    {
      id: "jadwal_bima_2",
      dokterId: "user_bima",
      hari: "selasa",
      jamMulai: "09:00",
      jamSelesai: "15:00",
    },
    {
      id: "jadwal_bima_3",
      dokterId: "user_bima",
      hari: "rabu",
      jamMulai: "09:00",
      jamSelesai: "15:00",
    },
    {
      id: "jadwal_sinta_1",
      dokterId: "user_sinta",
      hari: "kamis",
      jamMulai: "10:00",
      jamSelesai: "16:00",
    },
    {
      id: "jadwal_sinta_2",
      dokterId: "user_sinta",
      hari: "jumat",
      jamMulai: "10:00",
      jamSelesai: "16:00",
    },
    {
      id: "jadwal_sinta_3",
      dokterId: "user_sinta",
      hari: "sabtu",
      jamMulai: "09:00",
      jamSelesai: "14:00",
    },
  ];

  for (const j of jadwal) {
    const { id, ...data } = j;
    await setDoc(doc(db, "jadwal_dokter", id), data);
    console.log(`  ✓ jadwal_dokter/${id} (${data.dokterId} - ${data.hari})`);
  }

  // 4. Janji Temu (PRD 7.1)
  const janji = [
    {
      id: "janji_101",
      pasienId: "user_andi",
      dokterId: "user_bima",
      layananId: "layanan_3",
      tanggal: "2026-10-15",
      jam: "09:00",
      keluhan: "Gigi geraham belakang berlubang dan ngilu saat minum dingin",
      status: "hadir",
      alasanBatal: "",
      dibuatPada: Timestamp.fromDate(new Date("2026-10-12T10:00:00Z")),
    },
    {
      id: "janji_102",
      pasienId: "user_maya",
      dokterId: "user_bima",
      layananId: "layanan_2",
      tanggal: "2026-10-15",
      jam: "10:30",
      keluhan: "Karang gigi di bagian bawah gusi terasa kasar dan berdarah",
      status: "dikonfirmasi",
      alasanBatal: "",
      dibuatPada: Timestamp.fromDate(new Date("2026-10-13T14:20:00Z")),
    },
    {
      id: "janji_103",
      pasienId: "user_andi",
      dokterId: "user_sinta",
      layananId: "layanan_1",
      tanggal: "2026-10-16",
      jam: "11:00",
      keluhan: "Pemeriksaan rutin tahunan",
      status: "menunggu",
      alasanBatal: "",
      dibuatPada: Timestamp.fromDate(new Date("2026-10-14T08:45:00Z")),
    },
    {
      id: "janji_104",
      pasienId: "user_maya",
      dokterId: "user_sinta",
      layananId: "layanan_4",
      tanggal: "2026-10-10",
      jam: "13:00",
      keluhan: "Sisa akar gigi seri goyang",
      status: "selesai",
      alasanBatal: "",
      dibuatPada: Timestamp.fromDate(new Date("2026-10-05T12:00:00Z")),
    },
  ];

  for (const jt of janji) {
    const { id, ...data } = jt;
    await setDoc(doc(db, "janji_temu", id), data);
    console.log(`  ✓ janji_temu/${id} (${data.status})`);
  }

  // 5. Catatan Perawatan (PRD 7.1)
  const catatan = [
    {
      id: "catatan_201",
      janjiId: "janji_104",
      pasienId: "user_maya",
      dokterId: "user_sinta",
      tindakan: "Ekstraksi sisa akar gigi 12 dengan anestesi lokal infiltrasi",
      catatan: "Gigit tampon selama 45 menit, jangan berkumur terlalu keras, obat pereda nyeri diminum jika sakit",
      dibuatPada: Timestamp.fromDate(new Date("2026-10-10T13:40:00Z")),
    },
  ];

  for (const c of catatan) {
    const { id, ...data } = c;
    await setDoc(doc(db, "catatan_perawatan", id), data);
    console.log(`  ✓ catatan_perawatan/${id}`);
  }

  // 6. Slot Terisi (PRD 7.1 - ID dokumen sama dengan ID dokumen janji)
  const slots = [
    {
      id: "janji_101",
      dokterId: "user_bima",
      tanggal: "2026-10-15",
      jam: "09:00",
      durasiMenit: 60,
    },
    {
      id: "janji_102",
      dokterId: "user_bima",
      tanggal: "2026-10-15",
      jam: "10:30",
      durasiMenit: 30,
    },
    {
      id: "janji_103",
      dokterId: "user_sinta",
      tanggal: "2026-10-16",
      jam: "11:00",
      durasiMenit: 30,
    },
  ];

  for (const s of slots) {
    const { id, ...data } = s;
    await setDoc(doc(db, "slot_terisi", id), data);
    console.log(`  ✓ slot_terisi/${id}`);
  }

  console.log("All 6 collections successfully seeded into Cloud Firestore!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
