-- ERD: 3 entitas inti
-- employees 1 --- n payrolls n --- 1 payroll_periods
-- Detail absensi, pendapatan, dan potongan disimpan sebagai JSONB pada payrolls
-- agar struktur tetap sederhana dan mudah dikembangkan.

create extension if not exists pgcrypto;

drop table if exists payrolls cascade;
drop table if exists payroll_periods cascade;
drop table if exists employees cascade;

create table employees (
  id uuid primary key default gen_random_uuid(),
  employee_code varchar(30) unique not null,
  name varchar(120) not null,
  national_id varchar(32) unique,
  position varchar(80) not null,
  employment_status varchar(20) not null check (employment_status in ('Tetap', 'Kontrak', 'Freelance')),
  workplace_type varchar(20) not null default 'Toko' check (workplace_type in ('Kantor', 'Toko')),
  tax_status varchar(10) not null default 'TK/0',
  bank_name varchar(60),
  bank_account varchar(40),
  start_date date not null,
  end_date date,
  basic_salary numeric(14,2) not null default 0,
  freelance_rate numeric(14,2) not null default 0,
  freelance_unit varchar(10) check (freelance_unit in ('jam', 'shift')),
  bpjs_health boolean not null default true,
  bpjs_employment boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table payroll_periods (
  id uuid primary key default gen_random_uuid(),
  period_name varchar(80) not null,
  start_date date not null,
  end_date date not null,
  payment_date date not null,
  status varchar(20) not null default 'Draft' check (status in ('Draft', 'Review', 'Ready', 'Paid')),
  work_days_office integer not null default 22,
  work_days_store integer not null default 26,
  created_at timestamptz not null default now(),
  unique (start_date, end_date)
);

create table payrolls (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references payroll_periods(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete restrict,
  attendance jsonb not null default '{}'::jsonb,
  earnings jsonb not null default '{}'::jsonb,
  deductions jsonb not null default '{}'::jsonb,
  gross_pay numeric(14,2) not null default 0,
  total_deductions numeric(14,2) not null default 0,
  net_pay numeric(14,2) generated always as (gross_pay - total_deductions) stored,
  status varchar(20) not null default 'Draft' check (status in ('Draft', 'Review', 'Ready', 'Paid')),
  created_at timestamptz not null default now(),
  unique (period_id, employee_id)
);

create index payrolls_period_id_idx on payrolls(period_id);
create index payrolls_employee_id_idx on payrolls(employee_id);

insert into payroll_periods (period_name, start_date, end_date, payment_date, status, work_days_office, work_days_store)
values ('21 Agu - 20 Sep 2026', '2026-08-21', '2026-09-20', '2026-09-25', 'Ready', 21, 26);

insert into employees (employee_code, name, position, employment_status, workplace_type, tax_status, start_date, basic_salary)
values
  ('ST-00124', 'Nadia Putri', 'Store Manager', 'Tetap', 'Toko', 'TK/0', '2023-03-01', 8500000),
  ('ST-00131', 'Raka Fadhil', 'Sales Associate', 'Tetap', 'Toko', 'K/0', '2024-01-15', 4750000),
  ('ST-00137', 'Salsa Anindya', 'Visual Merchandiser', 'Kontrak', 'Toko', 'TK/0', '2025-02-10', 5200000);

-- Contoh payload payroll:
-- attendance: {"scheduled_days":26,"present_days":24,"late_count":1,"overtime_hours":4,"leave_days":1,"absence_days":0}
-- earnings: {"basic_salary":4750000,"fixed_allowance":300000,"variable_allowance":250000,"individual_incentive":450000,"store_incentive":220000,"overtime_pay":130636}
-- deductions: {"pph21":120000,"bpjs_health":47500,"jht":95000,"jp":47500,"late_penalty":10000,"absence_deduction":0}

-- Rumus aplikasi:
-- upah_sejam = gaji_bulanan / 173
-- lembur hari kerja = jam pertama 1.5 x upah_sejam, jam berikutnya 2 x upah_sejam
-- prorata = gaji_bulanan / hari_kerja_terjadwal x hari_kerja_yang_menjadi_hak
-- BPJS Kesehatan = 1% karyawan, 4% perusahaan
-- BPJS TK JHT = 2% karyawan, 3.7% perusahaan
-- BPJS TK JP = 1% karyawan, 2% perusahaan
