# **Tabel Pengujian Empat Peran: Portal Janji Senyum Rekah**

Bootcamp AI Web Programming · Tugas Mandiri Sesi 6  
Aplikasi: **Portal Janji Senyum Rekah** (Klinik Gigi Senyum Rekah Makassar)  
Dokumen Uji: `docs/uji.md`

---

## **1. Identitas Akun Uji Coba**

| No | Peran | Nama Akun | Email Akun Uji | Keterangan Akses |
| :-: | :--- | :--- | :--- | :--- |
| 1 | **Super Admin** | Bu Ratna | `ratna@senyumrekah.id` | Pemilik klinik, memiliki akses penuh ke seluruh kelompok halaman & konfigurasi sistem |
| 2 | **Resepsionis** | Laras | `laras@senyumrekah.id` | Staf depan, mengelola janji temu, konfirmasi, kehadiran pasien, dan kontak |
| 3 | **Dokter** | drg. Bima | `bima@senyumrekah.id` | Tenaga ahli, menangani pemeriksaan gigi dan pengisian rekam medis/catatan perawatan |
| 4 | **Pasien** | Andi Pratama | `andi@gmail.com` | Pelanggan / pasien terdaftar, membuat janji temu dan membaca riwayat perawatan |
| 5 | **Pengunjung** | Tanpa Akun | *(Belum Masuk)* | Pengguna publik yang belum terautentikasi |

---

## **2. Matriks Pengujian Hak Akses & Route Guard (Minimal 16 Baris + Kasus Kritis)**

| No | Akun / Peran | Halaman yang Dituju | Tindakan yang Dilakukan | Hasil yang Diharapkan (PRD & Instruksi) | Status | Lolos? |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: |
| 1 | **Belum masuk** | `/beranda` | Buka langsung URL di bilah browser | Dialihkan otomatis ke `/masuk?redirect=%2Fberanda` | Sesuai | ☑ |
| 2 | **Belum masuk** | `/janji/baru` | Buka langsung URL di bilah browser | Dialihkan otomatis ke `/masuk?redirect=%2Fjanji%2Fbaru` | Sesuai | ☑ |
| 3 | **Belum masuk** | `/resepsionis` | Ketik URL di bilah browser | Dialihkan otomatis ke `/masuk?redirect=%2Fresepsionis` | Sesuai | ☑ |
| 4 | **Belum masuk** | `/dokter` | Ketik URL di bilah browser | Dialihkan otomatis ke `/masuk?redirect=%2Fdokter` | Sesuai | ☑ |
| 5 | **Belum masuk** | `/admin` | Ketik URL di bilah browser | Dialihkan otomatis ke `/masuk?redirect=%2Fadmin` | Sesuai | ☑ |
| 6 | **Pasien** (Andi) | `/beranda` | Masuk lalu buka halaman beranda | Halaman Beranda terbuka, menampilkan janji terdekat | Sesuai | ☑ |
| 7 | **Pasien** (Andi) | `/janji/baru` | Klik menu Buat Janji | Halaman form pembuatan janji terbuka | Sesuai | ☑ |
| 8 | **Pasien** (Andi) | `/riwayat` | Klik menu Riwayat Perawatan | Halaman Riwayat Perawatan terbuka | Sesuai | ☑ |
| 9 | **Pasien** (Andi) | `/resepsionis` | Ketik URL resepsionis di browser | Ditolak, tampil layar **Akses Ditolak** | Sesuai | ☑ |
| 10 | **Pasien** (Andi) | `/dokter` | Ketik URL dasbor dokter di browser | Ditolak, tampil layar **Akses Ditolak** | Sesuai | ☑ |
| 11 | **Pasien** (Andi) | `/admin` | Ketik URL dasbor admin di browser | Ditolak, tampil layar **Akses Ditolak** | Sesuai | ☑ |
| 12 | **Resepsionis** (Laras) | `/resepsionis` | Masuk ke portal | Langsung tiba di Dasbor Resepsionis | Sesuai | ☑ |
| 13 | **Resepsionis** (Laras) | `/resepsionis/janji` | Buka menu Kelola Janji | Halaman Kelola Janji terbuka (filter & daftar) | Sesuai | ☑ |
| 14 | **Resepsionis** (Laras) | `/beranda` | Ketik URL beranda pasien | Ditolak, tampil layar **Akses Ditolak** | Sesuai | ☑ |
| 15 | **Resepsionis** (Laras) | `/dokter` | Ketik URL dasbor dokter di browser | Ditolak, tampil layar **Akses Ditolak** | Sesuai | ☑ |
| 16 | **Resepsionis** (Laras) | `/admin` | Ketik URL admin di browser | Ditolak, tampil layar **Akses Ditolak** | Sesuai | ☑ |
| 17 | **Dokter** (drg. Bima) | `/dokter` | Masuk ke portal | Langsung tiba di Dasbor Dokter | Sesuai | ☑ |
| 18 | **Dokter** (drg. Bima) | `/beranda` | Ketik URL beranda pasien | Ditolak, tampil layar **Akses Ditolak** | Sesuai | ☑ |
| 19 | **Dokter** (drg. Bima) | `/resepsionis` | Ketik URL dasbor resepsionis | Ditolak, tampil layar **Akses Ditolak** | Sesuai | ☑ |
| 20 | **Dokter** (drg. Bima) | `/admin` | Ketik URL dasbor admin | Ditolak, tampil layar **Akses Ditolak** | Sesuai | ☑ |
| 21 | **Dokter** (drg. Bima) | `/dokter/janji/janji_3` | Buka janji milik drg. Sinta | Tampil peringatan **"Janji tidak ditemukan"** (isolasi dokter) | Sesuai | ☑ |
| 22 | **Super Admin** (Bu Ratna) | `/admin` | Masuk ke portal | Langsung tiba di Dasbor Admin | Sesuai | ☑ |
| 23 | **Super Admin** (Bu Ratna) | `/admin/pengguna` | Buka Kelola Pengguna | Halaman Kelola Pengguna terbuka (bisa ubah peran & status) | Sesuai | ☑ |
| 24 | **Super Admin** (Bu Ratna) | `/beranda` | Buka halaman pasien | Halaman terbuka tanpa blokir | Sesuai | ☑ |
| 25 | **Super Admin** (Bu Ratna) | `/resepsionis` | Buka halaman resepsionis | Halaman terbuka tanpa blokir | Sesuai | ☑ |
| 26 | **Super Admin** (Bu Ratna) | `/dokter` | Buka halaman dokter | Halaman terbuka tanpa blokir | Sesuai | ☑ |

---

## **3. Pengujian Muat Ulang Halaman (Reload Test) & Status Akun**

| No | Kasus Uji | Akun | Langkah Uji | Hasil Pengamatan | Lolos? |
| :-: | :--- | :--- | :--- | :--- | :---: |
| 1 | **Muat ulang Pasien** | Andi | Berada di `/beranda`, tekan `F5` / Refresh browser | Layar memuat peran tampil sejenak, tidak mental ke `/masuk`, tidak muncul kedipan Akses Ditolak, tetap di `/beranda` | ☑ |
| 2 | **Muat ulang Resepsionis** | Laras | Berada di `/resepsionis/janji`, tekan `F5` / Refresh | Peran terbaca dari state, tetap berada di `/resepsionis/janji` | ☑ |
| 3 | **Muat ulang Dokter** | drg. Bima | Berada di `/dokter`, tekan `F5` / Refresh | Tetap berada di `/dokter` dan jadwal praktik tampil utuh | ☑ |
| 4 | **Muat ulang Super Admin** | Bu Ratna | Berada di `/admin/pengguna`, tekan `F5` / Refresh | Tetap berada di `/admin/pengguna` dengan data pengguna lengkap | ☑ |
| 5 | **Pengalihan setelah login** | Andi | Buka `/beranda` saat logout -> dialihkan ke `/masuk` -> berhasil login | Otomatis dialihkan kembali ke URL semula (`/beranda`) | ☑ |
| 6 | **Akun Dinonaktifkan** | Maya (`aktif: false`) | Masuk ke portal menggunakan akun nonaktif | Muncul layar khusus **"Akun Anda Dinonaktifkan"**, dilarang membuka halaman apa pun | ☑ |
| 7 | **Proteksi Akun Sendiri** | Bu Ratna | Membuka detail akunnya di `/admin/pengguna/[id]` | Sistem mengunci tombol dan menolak Bu Ratna menurunkan peran atau menonaktifkan dirinya sendiri | ☑ |

---

## **4. Pengujian Alur Inti End-to-End (Tahap 7)**

Alur wajib PRD: Pasien booking (4.3) → Resepsionis konfirmasi & hadir (4.7) → Dokter periksa & selesai (4.10) → Pasien baca riwayat (4.4).

| Langkah | Peran Pelaku | Halaman | Tindakan Pengujian | Perubahan Data di Cloud Firestore | Lolos? |
| :-: | :--- | :--- | :--- | :--- | :---: |
| **Langkah 1** | **Pasien** (Andi) | `/janji/baru` | 1. Memilih Layanan: *Pembersihan Karang Gigi (Scaling)*<br>2. Memilih Dokter: *drg. Bima*<br>3. Memilih Tanggal & Slot Jam: `10:00 WITA`<br>4. Mengisi Keluhan: *"Gigi ngilu saat minum dingin"*<br>5. Klik **Kirim Janji Temu** | - Dokumen baru terbuat di koleksi `janji_temu` dengan status `menunggu`.<br>- Dokumen baru terbuat di koleksi `slot_terisi` untuk memblokir slot bentrok. | ☑ |
| **Langkah 2** | **Resepsionis** (Laras) | `/resepsionis/janji` & `/resepsionis/janji/[id]` | 1. Membuka rincian janji Andi yang berstatus `menunggu`.<br>2. Mengklik tombol **Konfirmasi Janji**.<br>3. Mengklik tombol **Tandai Hadir** saat pasien tiba. | - Field `status` pada dokumen janji di koleksi `janji_temu` berubah menjadi `dikonfirmasi`.<br>- Setelah tiba, field `status` berubah menjadi `hadir`. | ☑ |
| **Langkah 3** | **Dokter** (drg. Bima) | `/dokter` & `/dokter/janji/[id]` | 1. Di Dasbor Dokter muncul status **⚡ Siap Diperiksa**.<br>2. Klik tombol **Mulai Pemeriksaan**.<br>3. Mengisi *Tindakan Medis*: *"Scaling ultrasonic rahang atas dan bawah, pemolesan pasta profilaksis"*, serta *Catatan & Anjuran*: *"Gunakan pasta gigi sensitif, hindari minuman dingin selama 3 hari"*, lalu klik **Tandai Selesai**. | - Dokumen baru tersimpan di koleksi `catatan_perawatan` berisi tindakan & anjuran dokter.<br>- Field `status` pada dokumen `janji_temu` berubah menjadi `selesai`. | ☑ |
| **Langkah 4** | **Pasien** (Andi) | `/riwayat` | Pasien membuka halaman Riwayat Perawatan. | Halaman menampilkan kartu kunjungan selesai lengkap dengan tindakan medis dan catatan dokter yang dibaca langsung dari Firestore. | ☑ |

---

## **Kesimpulan Pengujian**
Seluruh 26 skenario matriks akses, 7 pengujian stabilitas muat ulang & status akun, serta 4 langkah alur inti end-to-end terbukti **100% LOLOS** dan terintegrasi langsung dengan basis data Cloud Firestore di region `asia-southeast2` (Jakarta).
