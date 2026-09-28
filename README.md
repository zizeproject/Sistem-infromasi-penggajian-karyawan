# Stradivarius Payroll

Web app sederhana untuk sistem informasi penggajian karyawan retail fashion.

## Struktur

- `frontend/` - HTML, CSS, dan JavaScript dashboard
- `backend/app.js` - API Node.js tanpa dependency eksternal
- `backend/schema.sql` - ERD 3 entitas dan schema Supabase Postgres

## Menjalankan tanpa instalasi tambahan

1. Jalankan seluruh isi `backend/schema.sql` di SQL Editor Supabase.
2. Pastikan URL Supabase dan anon key terisi di `frontend/app.js`.
3. Buka `frontend/index.html` langsung di browser.

Frontend akan membaca dan menyimpan data langsung melalui Supabase REST API. Jika Supabase belum siap, dashboard memakai data demo. `backend/app.js` tetap tersedia sebagai API opsional jika lingkungan sudah memiliki Node.js 18+, tetapi tidak diperlukan untuk menjalankan frontend.

## ERD

`employees` 1-to-many `payrolls` many-to-one `payroll_periods`.

Detail absensi, pendapatan, dan potongan disimpan dalam kolom JSONB di `payrolls`, sehingga ERD tetap terdiri dari tiga entitas inti tanpa menghilangkan fleksibilitas komponen payroll.
