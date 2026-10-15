# Portal Janji Senyum Rekah

Aplikasi Janji Temu dan Catatan Perawatan Klinik Gigi **Senyum Rekah** Makassar.  
Tugas Mandiri Sesi 6 · Bootcamp AI Web Programming (Oktober 2026).

---

## 🚀 Fitur & 4 Peran Pengguna (Role-Based Access)

Aplikasi memiliki 4 pemegang akun sesuai `docs/PRD.md`:
1. **Pasien (Andi Pratama, Maya Kusuma):**
   - Beranda (`/beranda`): Kartu janji terdekat & tombol cepat buat janji.
   - Buat Janji (`/janji/baru`): Pemilihan layanan, dokter, tanggal praktik, dan slot kosong yang dicegah dari tabrakan jam (`slot_terisi`).
   - Janji Saya (`/janji`, `/janji/[id]`): Daftar janji dan pembatalan janji mandiri (maksimal H-1).
   - Riwayat Perawatan (`/riwayat`): Riwayat catatan tindakan medis dan anjuran dokter dari kunjungan yang selesai.
   - Profil (`/profil`): Pembaruan nama dan nomor HP.

2. **Resepsionis (Laras):**
   - Dasbor Resepsionis (`/resepsionis`): Ringkasan antrean per dokter dan counter janji berstatus Menunggu.
   - Kelola Janji (`/resepsionis/janji`, `/resepsionis/janji/[id]`): Filter status & tanggal, konfirmasi janji, jadwal ulang, pembatalan dengan alasan, dan menandai kehadiran pasien.
   - Data Pasien (`/resepsionis/pasien`): Direktori kontak pasien dengan fitur pencarian nama (tanpa catatan medis).

3. **Dokter Gigi (drg. Bima, drg. Sinta):**
   - Dasbor Dokter (`/dokter`): Jadwal janji hari ini khusus dokter yang sedang login, dengan penanda pasien siap diperiksa.
   - Pemeriksaan (`/dokter/janji/[id]`): Pengisian tindakan dan catatan perawatan untuk pasien berstatus Hadir, lalu menandai janji Selesai.
   - Riwayat Pasien (`/dokter/pasien/[id]`): Melihat catatan riwayat pasien yang pernah ditangani oleh dokter tersebut.

4. **Super Admin (Bu Ratna - Pemilik Klinik):**
   - Dasbor Admin (`/admin`): Ringkasan kunjungan hari ini, bulan ini, dan antrean konfirmasi.
   - Kelola Pengguna (`/admin/pengguna`, `/admin/pengguna/[id]`): Manajemen peran dan aktivasi akun.
   - Layanan (`/admin/layanan`): Manajemen layanan tindakan gigi, durasi menit, tarif, dan status aktif.
   - Jadwal Dokter (`/admin/jadwal-dokter`): Pengaturan hari dan rentang jam praktik operasional dokter.
   - Laporan (`/admin/laporan`): Rekapitulasi laporan kunjungan bulanan per dokter dan per layanan.

---

## 🛠️ Menjalankan Proyek Secara Lokal

1. **Instal dependensi:**
   ```bash
   npm install
   ```

2. **Jalankan development server:**
   ```bash
   npm run dev
   ```

3. **Buka di peramban:**
   Akses [http://localhost:3000](http://localhost:3000)

---

## 📁 Struktur Dokumen Tugas
- [`docs/PRD.md`](./docs/PRD.md): Product Requirements Document resmi.
- [`docs/Instruksi_Tugas_Mandiri_Sesi_6.md`](./docs/Instruksi_Tugas_Mandiri_Sesi_6.md): Instruksi pengerjaan tugas mandiri.
- [`docs/rancangan.md`](./docs/rancangan.md): Matriks akses 5 entitas, peta route 21 halaman, dan jawaban 4 keputusan kunci.
