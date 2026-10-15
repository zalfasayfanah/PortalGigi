# Dokumen Rancangan: Portal Janji Senyum Rekah
**Bootcamp AI Web Programming · Sesi 6**  
**PRD Terpilih:** Portal Janji Senyum Rekah (Klinik Gigi Senyum Rekah)  
**Dokumen Acuan:** `docs/PRD.md` (Bab 2, 3, dan 4)

---

## 1. Matriks Akses Pengguna

Matriks ini merangkum hak akses setiap kelompok pengguna dan peran terhadap seluruh fitur di Bab 4 PRD:
- **Pengunjung:** Pengguna yang belum melakukan login.
- **Pasien (Pelanggan):** Peran default akun baru (Andi, Maya).
- **Resepsionis (Staf Depan):** Staf klinik pengelola janji (Laras).
- **Dokter (Tenaga Ahli):** Dokter gigi pemeriksa (drg. Bima, drg. Sinta).
- **Super Admin:** Pemilik klinik dengan otoritas penuh (Bu Ratna).

| No | Fitur (Subbab PRD) | Pengunjung | Pasien (Pelanggan) | Resepsionis (Staf Depan) | Dokter (Tenaga Ahli) | Super Admin | Keterangan & Batasan PRD |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| 1 | Mendaftar akun baru (Email / Google) (4.1) | ✓ | ✕ | ✕ | ✕ | ✕ | Pengguna login dialihkan ke dasbor perannya |
| 2 | Masuk (Login) (Email / Google) (4.1) | ✓ | ✕ | ✕ | ✕ | ✕ | Pengguna login dialihkan ke dasbor perannya |
| 3 | Melihat Janji Terdekat & Tombol Buat Janji (4.2) | ✕ | ✓ milik sendiri | ✕ | ✕ | ✓ | Di halaman `/beranda` |
| 4 | Membuat Janji Temu Baru (4.3.1) | ✕ | ✓ milik sendiri | ✕ | ✕ | ✓ | Pilih layanan aktif, dokter, tanggal praktik, & slot kosong |
| 5 | Melihat Daftar & Rincian Janji Saya (4.3.2) | ✕ | ✓ milik sendiri | ✕ | ✕ | ✓ | Filter data berdasarkan `pasienId` |
| 6 | Membatalkan Janji Temu Mandiri (4.3.2) | ✕ | ✓ milik sendiri | ✕ | ✕ | ✓ | Hanya status Menunggu/Dikonfirmasi, maksimal H-1 |
| 7 | Melihat Riwayat Perawatan Selesai (4.4) | ✕ | ✓ milik sendiri | ✕ | ✕ | ✓ | Hanya janji status Selesai milik pasien sendiri |
| 8 | Melihat & Mengubah Profil (Nama & No HP) (4.5) | ✕ | ✓ milik sendiri | ✓ milik sendiri | ✓ milik sendiri | ✓ milik sendiri | Email & Role tidak dapat diubah di sini |
| 9 | Melihat Dasbor Resepsionis (4.6) | ✕ | ✕ | ✓ | ✕ | ✓ | Ringkasan janji hari ini per dokter & jumlah menunggu |
| 10 | Kelola Janji: Filter Status & Tanggal (4.7) | ✕ | ✕ | ✓ | ✕ | ✓ | Menampilkan seluruh janji klinik |
| 11 | Kelola Janji: Konfirmasi Janji Temu (4.7) | ✕ | ✕ | ✓ | ✕ | ✓ | Hanya untuk janji berstatus Menunggu |
| 12 | Kelola Janji: Jadwal Ulang (Reschedule) (4.7) | ✕ | ✕ | ✓ | ✕ | ✓ | Mengubah tanggal dan memilih slot jam baru yang kosong |
| 13 | Kelola Janji: Batalkan Janji + Alasan (4.7) | ✕ | ✕ | ✓ | ✕ | ✓ | Wajib mengisi alasan pembatalan |
| 14 | Kelola Janji: Tandai Pasien Hadir (4.7) | ✕ | ✕ | ✓ | ✕ | ✓ | Hanya janji Dikonfirmasi pada hari H |
| 15 | Melihat Kontak Pasien & Pencarian (4.8) | ✕ | ✕ | ✓ | ✕ | ✓ | Hanya Nama, Email, No HP (Tanpa catatan medis) |
| 16 | Melihat Dasbor Dokter (4.9) | ✕ | ✕ | ✕ | ✓ milik sendiri | ✓ | Hanya janji hari ini milik dokter bersangkutan |
| 17 | Mengisi Pemeriksaan & Catatan Perawatan (4.10) | ✕ | ✕ | ✕ | ✓ milik sendiri | ✓ | Hanya janji status Hadir dokter bersangkutan |
| 18 | Menandai Pemeriksaan Selesai (4.10) | ✕ | ✕ | ✕ | ✓ milik sendiri | ✓ | Menyimpan data ke `catatan_perawatan` |
| 19 | Melihat Riwayat Pasien Dokter (4.11) | ✕ | ✕ | ✕ | ✓ pasien terkait | ✓ | Hanya pasien yang pernah ditangani dokter bersangkutan |
| 20 | Melihat Dasbor Admin (4.12) | ✕ | ✕ | ✕ | ✕ | ✓ | Kunjungan hari ini & bulan ini, menunggu konfirmasi |
| 21 | Kelola Pengguna: Ubah Peran (Role) (4.13) | ✕ | ✕ | ✕ | ✕ | ✓ | Mengubah role: pasien, resepsionis, dokter, super_admin |
| 22 | Kelola Pengguna: Nonaktifkan Akun (4.13) | ✕ | ✕ | ✕ | ✕ | ✓ | Menonaktifkan akun (tidak bisa menonaktifkan diri sendiri) |
| 23 | Kelola Layanan Klinik (4.14) | ✕ | ✕ | ✕ | ✕ | ✓ | Tambah/ubah nama, durasi (kelipatan 30m), tarif, status aktif |
| 24 | Kelola Jadwal Praktik Dokter (4.15) | ✕ | ✕ | ✕ | ✕ | ✓ | Atur hari (Senin-Sabtu) dan jam praktik tiap dokter |
| 25 | Melihat Laporan Kunjungan Bulanan (4.16) | ✕ | ✕ | ✕ | ✕ | ✓ | Rekap per dokter dan per layanan per bulan |

---

## 2. Peta Route (Route Map) & Route Guard

Peta route ini memetakan seluruh alamat halaman di Bab 4 PRD beserta aturan proteksi route guard, penanganan unauthenticated (belum masuk), dan unauthorized (peran lain).

| No | Halaman | Alamat URL | Peran yang Boleh Membuka | Belum Masuk (Unauthenticated) | Peran Lain (Unauthorized) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Pendaftaran Akun | `/daftar` | Pengunjung (Publik) | Halaman terbuka | Dialihkan ke dasbor perannya |
| 2 | Masuk / Login | `/masuk` | Pengunjung (Publik) | Halaman terbuka | Dialihkan ke dasbor perannya |
| 3 | Beranda Pasien | `/beranda` | `pasien`, `super_admin` | Dialihkan ke `/masuk` | Tampil "Akses Ditolak" |
| 4 | Buat Janji Temu | `/janji/baru` | `pasien`, `super_admin` | Dialihkan ke `/masuk` | Tampil "Akses Ditolak" |
| 5 | Daftar Janji Saya | `/janji` | `pasien`, `super_admin` | Dialihkan ke `/masuk` | Tampil "Akses Ditolak" |
| 6 | Rincian Janji Saya | `/janji/[id]` | `pasien`, `super_admin` | Dialihkan ke `/masuk` | Tampil "Akses Ditolak" / "Janji tidak ditemukan" |
| 7 | Riwayat Perawatan | `/riwayat` | `pasien`, `super_admin` | Dialihkan ke `/masuk` | Tampil "Akses Ditolak" |
| 8 | Profil Pengguna | `/profil` | `pasien`, `resepsionis`, `dokter`, `super_admin` | Dialihkan ke `/masuk` | - (Semua peran berhak) |
| 9 | Dasbor Resepsionis | `/resepsionis` | `resepsionis`, `super_admin` | Dialihkan ke `/masuk` | Tampil "Akses Ditolak" |
| 10 | Kelola Janji Temu | `/resepsionis/janji` | `resepsionis`, `super_admin` | Dialihkan ke `/masuk` | Tampil "Akses Ditolak" |
| 11 | Rincian Janji Resepsionis | `/resepsionis/janji/[id]` | `resepsionis`, `super_admin` | Dialihkan ke `/masuk` | Tampil "Akses Ditolak" |
| 12 | Data Kontak Pasien | `/resepsionis/pasien` | `resepsionis`, `super_admin` | Dialihkan ke `/masuk` | Tampil "Akses Ditolak" |
| 13 | Dasbor Dokter | `/dokter` | `dokter`, `super_admin` | Dialihkan ke `/masuk` | Tampil "Akses Ditolak" |
| 14 | Pemeriksaan Dokter | `/dokter/janji/[id]` | `dokter`, `super_admin` | Dialihkan ke `/masuk` | Tampil "Akses Ditolak" / "Janji tidak ditemukan" |
| 15 | Riwayat Pasien Dokter | `/dokter/pasien/[id]` | `dokter`, `super_admin` | Dialihkan ke `/masuk` | Tampil "Akses Ditolak" / "Pasien tidak ditemukan" |
| 16 | Dasbor Admin | `/admin` | `super_admin` | Dialihkan ke `/masuk` | Tampil "Akses Ditolak" |
| 17 | Kelola Pengguna | `/admin/pengguna` | `super_admin` | Dialihkan ke `/masuk` | Tampil "Akses Ditolak" |
| 18 | Rincian / Ubah Pengguna | `/admin/pengguna/[id]` | `super_admin` | Dialihkan ke `/masuk` | Tampil "Akses Ditolak" |
| 19 | Kelola Layanan Klinik | `/admin/layanan` | `super_admin` | Dialihkan ke `/masuk` | Tampil "Akses Ditolak" |
| 20 | Kelola Jadwal Dokter | `/admin/jadwal-dokter` | `super_admin` | Dialihkan ke `/masuk` | Tampil "Akses Ditolak" |
| 21 | Laporan Kunjungan Bulanan | `/admin/laporan` | `super_admin` | Dialihkan ke `/masuk` | Tampil "Akses Ditolak" |

> **Catatan Pengalihan Default Setelah Masuk:**
> - Role `pasien` ➔ `/beranda`
> - Role `resepsionis` ➔ `/resepsionis`
> - Role `dokter` ➔ `/dokter`
> - Role `super_admin` ➔ `/admin`
> - Akun dengan status `aktif: false` ➔ Ditampilkan pesan: *"Akun Anda dinonaktifkan. Hubungi klinik."*

---

## 3. Keputusan Kunci Rancangan & Rujukan PRD

Berikut adalah jawaban atas 4 keputusan penting yang wajib dijawab untuk kasus **Klinik Gigi Senyum Rekah**, lengkap dengan dasar subbab PRD:

### 1. Bolehkah resepsionis membaca catatan perawatan?
* **Jawaban:** **TIDAK BOLEH.**
* **Dasar Rujukan PRD:**
  - **Bab 1 (Ringkasan Eksekutif):** *"Catatan perawatan tetap rahasia. Resepsionis tidak bisa membacanya, dan dokter hanya membaca catatan pasien yang ia tangani."*
  - **Bab 2.4 (Yang Tidak Boleh Dilihat Tiap Peran):** Pada tabel, kolom Catatan perawatan untuk Resepsionis tertulis tegas: **"Tidak tampil"**.
  - **Bab 4.7 (Kelola Janji):** *"Rincian untuk resepsionis tidak menampilkan catatan perawatan."*
  - **Bab 4.8 (Data Pasien):** *"Batasan v1: resepsionis tidak bisa membaca catatan perawatan dari halaman mana pun."*
  - **Bab 6.2 (Penjagaan Halaman dan Data):** Security Rules menolak resepsionis membaca koleksi `catatan_perawatan`.

---

### 2. Bolehkah drg. Bima membuka pemeriksaan janji drg. Sinta?
* **Jawaban:** **TIDAK BOLEH.**
* **Dasar Rujukan PRD:**
  - **Bab 1 (Ringkasan Eksekutif):** *"...dan dokter hanya membaca catatan pasien yang ia tangani."*
  - **Bab 2.4 (Yang Tidak Boleh Dilihat Tiap Peran):** Janji pasien lain untuk Dokter dibatasi: *"Hanya janji yang ia tangani"*.
  - **Bab 4.9 (Dasbor Dokter):** *"Hanya janji dengan dokterId miliknya yang tampil. Janji drg. Sinta tidak terlihat oleh drg. Bima."*
  - **Bab 4.10 (Pemeriksaan):** *"Validasi: hanya janji milik dokter itu yang berstatus Hadir yang bisa diisi. Bila ID diganti dengan janji dokter lain, tampil 'Janji tidak ditemukan'."*
  - **Bab 8 (Pengujian - Uji Tembus):** Menyebutkan secara eksplisit bahwa skenario drg. Bima membuka Pemeriksaan untuk janji drg. Sinta harus ditolak.

---

### 3. Bolehkah pasien melihat jam yang sudah terisi pasien lain?
* **Jawaban:** **TIDAK BOLEH melihat data janji atau identitas pasien lain, tetapi slot jam yang sudah terisi otomatis TIDAK DITAMPILKAN sebagai pilihan saat pasien membuat janji.**
* **Dasar Rujukan PRD:**
  - **Bab 1 (Ringkasan Eksekutif):** *"Janji tidak bentrok lagi. Pasien hanya bisa memilih slot jam yang masih kosong."*
  - **Bab 2.4 (Yang Tidak Boleh Dilihat Tiap Peran):** Data janji pasien lain untuk Pasien adalah **"Tidak tampil"**.
  - **Bab 4.3.1 (Buat Janji):** *"Sistem menampilkan slot jam yang masih kosong... Slot yang bertabrakan dengan janji lain dokter itu yang belum dibatalkan tidak ditampilkan. Untuk mengetahuinya, aplikasi membaca koleksi `slot_terisi` yang hanya berisi dokter, tanggal, jam, dan durasi, tanpa nama atau keluhan pasien."*

---

### 4. Halaman mana saja yang boleh dibuka Bu Ratna (Super Admin)?
* **Jawaban:** **SEMUA HALAMAN aplikasi dapat dibuka oleh Bu Ratna.**
* **Dasar Rujukan PRD:**
  - **Bab 2.1 (Empat Pemegang Akun):** *"Super Admin (Bu Ratna, pemilik klinik): Semua hak tiga peran lain, ditambah mengelola pengguna, layanan, jadwal dokter, dan laporan."*
  - **Bab 2.3 (Hak Akses Per Modul):** Tabel hak akses mencatat Super Admin memiliki akses "Penuh" atau "Lihat" di seluruh modul tanpa terkecuali (Beranda, Janji Saya, Riwayat Perawatan, Profil, Dasbor Resepsionis, Kelola Janji, Data Pasien, Dasbor Dokter, Pemeriksaan, Riwayat Pasien, Dasbor Admin, Layanan, Jadwal Dokter, Laporan, Kelola Pengguna).
  - **Bab 3.1 (Peta Modul):** *"Super Admin (semua menu peran lain, ditambah: Dasbor Admin, Kelola Pengguna, Layanan, Jadwal Dokter, Laporan)"*.
  - **Instruksi Tugas Mandiri Tahap 5:** *"Super Admin boleh membuka semuanya."*
