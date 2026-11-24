# Dokumentasi SIBER EVIDENCE

Dokumen perancangan dan pengujian Aplikasi Pengelolaan Barang Bukti Berbasis Web
(Studi Kasus: Subbid Siber Ditreskrimsus Polda Sulawesi Utara).

| No | Dokumen | Isi |
| --- | --- | --- |
| 1 | [Kebutuhan & Use Case](01-kebutuhan-dan-use-case.md) | Aktor, kebutuhan fungsional/non-fungsional, diagram & skenario use case |
| 2 | [Activity Diagram](02-activity-diagram.md) | Login, tambah perkara, daftar barang bukti, catat kejadian, laporan, nonaktifkan pengguna |
| 3 | [Class Diagram](03-class-diagram.md) | Kelas model, atribut, metode, relasi |
| 4 | [ERD & Kamus Data](04-erd-dan-kamus-data.md) | ERD dan rincian kolom setiap tabel |
| 5 | [Pengujian Black Box](05-pengujian-black-box.md) | 66 skenario uji (hasil diisi saat pengujian) |
| 6 | [Panduan Penggunaan](06-panduan-penggunaan.md) | Panduan untuk Petugas dan Administrator |
| 7 | [Setup Supabase & Deploy Vercel](07-setup-supabase.md) | Membuat proyek Supabase, menjalankan SQL, mengisi data contoh, menjalankan lokal, deploy ke Vercel |

## Merender diagram

- **Mermaid** (ERD): langsung tampil di GitHub, GitLab, VS Code (ekstensi Markdown Preview Mermaid), atau
  [mermaid.live](https://mermaid.live).
- **PlantUML** (use case, activity, class): salin blok kode ke [plantuml.com/plantuml](https://www.plantuml.com/plantuml),
  ekstensi PlantUML di VS Code/IntelliJ, atau draw.io (*Arrange → Insert → Advanced → PlantUML*), lalu ekspor PNG/SVG
  untuk laporan.

Data contoh yang menjadi dasar ERD ada di [`fe/src/data/`](../fe/src/data/).
