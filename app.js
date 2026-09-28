const API_BASE = 'http://localhost:3000/api';
const SUPABASE_URL = 'https://yfcvzfmsxbqcqbucracs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmY3Z6Zm1zeGJxY3FidWNyYWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMjYyNzIsImV4cCI6MjEwNTgwMjI3Mn0.c5xubKtmo_Q_RpmzN3XIeRLyM2UMqMpKvxzq78aC7Uc';

const demoEmployees = [
  { id: 'ST-00124', name: 'Nadia Putri', position: 'Store Manager', employment_status: 'Tetap', tax_status: 'TK/0', basic_salary: 8500000, active: true },
  { id: 'ST-00131', name: 'Raka Fadhil', position: 'Sales Associate', employment_status: 'Tetap', tax_status: 'K/0', basic_salary: 4750000, active: true },
  { id: 'ST-00137', name: 'Salsa Anindya', position: 'Visual Merchandiser', employment_status: 'Kontrak', tax_status: 'TK/0', basic_salary: 5200000, active: true },
  { id: 'ST-00142', name: 'Dimas Pratama', position: 'Sales Associate', employment_status: 'Tetap', tax_status: 'TK/0', basic_salary: 4500000, active: true },
  { id: 'ST-00151', name: 'Maya Lestari', position: 'Freelance Stylist', employment_status: 'Freelance', tax_status: 'TK/0', basic_salary: 0, active: true }
];
const demoPayroll = [
  { employee_name: 'Nadia Putri', employee_code: 'ST-00124', position: 'Store Manager', gross_pay: 9120000, total_deductions: 670000, net_pay: 8450000 },
  { employee_name: 'Raka Fadhil', employee_code: 'ST-00131', position: 'Sales Associate', gross_pay: 5080000, total_deductions: 359500, net_pay: 4720500 },
  { employee_name: 'Salsa Anindya', employee_code: 'ST-00137', position: 'Visual Merchandiser', gross_pay: 5570000, total_deductions: 390000, net_pay: 5180000 },
  { employee_name: 'Dimas Pratama', employee_code: 'ST-00142', position: 'Sales Associate', gross_pay: 4800000, total_deductions: 300000, net_pay: 4500000 }
];

const formatIDR = value => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value).replace('IDR', 'Rp');
const initials = name => name.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase();
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));

async function getApi(path, fallback) {
  try {
    const restPath = path.startsWith('/employees') ? '/rest/v1/employees?select=*&active=eq.true&order=name.asc' : '/rest/v1/payrolls?select=*,employees(name,employee_code,position)&order=created_at.desc';
    const response = await fetch(`${SUPABASE_URL}${restPath}`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } });
    if (!response.ok) throw new Error('Supabase unavailable');
    const data = await response.json();
    return { data: data.map(item => ({ ...item, employee_name: item.employees?.name || item.employee_name, employee_code: item.employees?.employee_code || item.employee_code })), source: 'supabase' };
  } catch (supabaseError) {
    try {
      const response = await fetch(`${API_BASE}${path}`);
      if (!response.ok) throw new Error('API unavailable');
      return await response.json();
    } catch (backendError) { return fallback; }
  }
}
async function saveEmployee(employee) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/employees`, { method: 'POST', headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(employee) });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || 'Data karyawan gagal disimpan');
  }
  return (await response.json())[0];
}
async function updateEmployee(id, employee) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/employees?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(employee) });
  if (!response.ok) throw new Error((await response.text()) || 'Data karyawan gagal diperbarui');
  return (await response.json())[0];
}
async function archiveEmployee(id) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/employees?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ active: false }) });
  if (!response.ok) throw new Error((await response.text()) || 'Karyawan gagal dihapus');
}
async function savePayroll(payroll) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/payrolls`, { method: 'POST', headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(payroll) });
  if (!response.ok) throw new Error((await response.text()) || 'Payroll gagal disimpan');
  return (await response.json())[0];
}
async function updatePayroll(id, payroll) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/payrolls?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(payroll) });
  if (!response.ok) throw new Error((await response.text()) || 'Payroll gagal diperbarui');
  return (await response.json())[0];
}
async function deletePayroll(id) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/payrolls?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } });
  if (!response.ok) throw new Error((await response.text()) || 'Payroll gagal dihapus');
}
async function getActivePeriod() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/payroll_periods?select=id,start_date,end_date&order=start_date.desc&limit=1`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } });
  if (!response.ok) throw new Error('Periode payroll belum tersedia');
  return (await response.json())[0];
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message; toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 3000);
}
function avatarClass(index) { return ['pink-bg', 'blue-bg', 'green-bg'][index % 3]; }
function renderEmployees(employees) {
  document.querySelector('#employee-list').innerHTML = employees.map((employee, index) => `<tr><td><div class="person-cell"><div class="avatar avatar-sm ${avatarClass(index)}">${initials(employee.name)}</div><span><strong>${escapeHtml(employee.name)}</strong><small>${escapeHtml(employee.id || employee.employee_code)}</small></span></div></td><td>${escapeHtml(employee.position)}</td><td>${escapeHtml(employee.employment_status)}</td><td>${escapeHtml(employee.tax_status || 'TK/0')}</td><td>${employee.basic_salary ? formatIDR(employee.basic_salary) : 'Sesuai proyek'}</td><td><span class="status-badge paid">Aktif</span></td><td><div class="row-actions"><button class="row-action" data-action="edit-employee" data-id="${escapeHtml(employee.id)}">Edit</button><button class="row-action danger" data-action="delete-employee" data-id="${escapeHtml(employee.id)}">Hapus</button></div></td></tr>`).join('');
}
function renderPayroll(rows) {
  document.querySelector('#payroll-list').innerHTML = rows.map((row, index) => `<tr><td><div class="person-cell"><div class="avatar avatar-sm ${avatarClass(index)}">${initials(row.employee_name)}</div><span><strong>${escapeHtml(row.employee_name)}</strong><small>${escapeHtml(row.employee_code)}</small></span></div></td><td>${formatIDR(row.gross_pay - (row.incentive || 0) - (row.overtime_pay || 0))}</td><td>${formatIDR(row.incentive || 0)}</td><td>${formatIDR(row.overtime_pay || 0)}</td><td>${formatIDR(row.total_deductions)}</td><td><strong>${formatIDR(row.net_pay)}</strong></td><td><div class="row-actions"><button class="row-action" data-action="edit-payroll" data-id="${escapeHtml(row.id || index)}">Edit</button><button class="row-action danger" data-action="delete-payroll" data-id="${escapeHtml(row.id || index)}">Hapus</button></div></td></tr>`).join('');
}
function activateView(view) {
  document.querySelectorAll('.page-view').forEach(page => page.classList.toggle('active', page.id === `view-${view}`));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === view));
  const active = document.querySelector(`[data-view="${view}"]`);
  document.querySelector('#page-title').textContent = active ? active.textContent.trim().replace(/^\d+\s*/, '') : 'Ringkasan';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function init() {
  const employeesResponse = await getApi('/employees', { data: demoEmployees });
  const payrollResponse = await getApi('/payrolls?period=active', { data: demoPayroll });
  let employees = employeesResponse.data || demoEmployees;
  let payroll = payrollResponse.data || demoPayroll;
  renderEmployees(employees); renderPayroll(payroll);
  document.querySelector('#active-employees').textContent = employees.filter(item => item.active !== false).length || 24;

  document.querySelectorAll('.nav-item').forEach(item => item.addEventListener('click', () => activateView(item.dataset.view)));
  document.querySelectorAll('[data-view-target]').forEach(item => item.addEventListener('click', () => activateView(item.dataset.viewTarget)));
  document.querySelector('#employee-search').addEventListener('input', event => {
    const query = event.target.value.toLowerCase();
    renderEmployees(employees.filter(item => `${item.name} ${item.id} ${item.position}`.toLowerCase().includes(query)));
  });
  const payrollDialog = document.querySelector('#payroll-dialog');
  const payrollForm = document.querySelector('#payroll-form');
  const payrollEmployee = document.querySelector('#payroll-employee');
  const payrollBasicSalary = document.querySelector('#payroll-basic-salary');
  const payrollPreview = document.querySelector('#payroll-preview');
  payrollEmployee.innerHTML = employees.map(employee => `<option value="${escapeHtml(employee.id)}" data-salary="${employee.basic_salary || 0}">${escapeHtml(employee.name)} (${escapeHtml(employee.employee_code || employee.id)})</option>`).join('');
  const getPayrollNumbers = () => Object.fromEntries([...new FormData(payrollForm)].map(([key, value]) => [key, Number(value) || 0]));
  const updatePayrollPreview = () => {
    const values = getPayrollNumbers();
    const proratedSalary = values.basic_salary / Math.max(values.scheduled_days, 1) * values.payable_days;
    const hourlyRate = values.basic_salary / 173;
    const overtimePay = values.overtime_hours > 0 ? hourlyRate * 1.5 + Math.max(values.overtime_hours - 1, 0) * hourlyRate * 2 : 0;
    const grossPay = proratedSalary + values.fixed_allowance + values.variable_allowance + values.individual_incentive + values.store_incentive + overtimePay;
    const deductions = values.pph21 + values.bpjs_health + values.bpjs_tk + values.late_penalty + values.absence_deduction;
    payrollPreview.textContent = formatIDR(grossPay - deductions);
    return { values, proratedSalary, overtimePay, grossPay, deductions };
  };
  payrollEmployee.addEventListener('change', event => { payrollBasicSalary.value = event.target.selectedOptions[0]?.dataset.salary || 0; updatePayrollPreview(); });
  payrollForm.addEventListener('input', updatePayrollPreview);
  const closePayrollDialog = () => payrollDialog.close();
  const openPayrollForm = row => {
    payrollForm.reset();
    payrollForm.dataset.editId = row?.id || '';
    payrollForm.dataset.periodId = row?.period_id || '';
    if (row) {
      const attendance = row.attendance || {};
      const earnings = row.earnings || {};
      const deductions = row.deductions || {};
      payrollEmployee.value = row.employee_id || employees.find(employee => employee.employee_code === row.employee_code)?.id || '';
      payrollForm.elements.scheduled_days.value = attendance.scheduled_days || 26;
      payrollForm.elements.payable_days.value = attendance.payable_days || 26;
      payrollBasicSalary.value = employees.find(employee => String(employee.id) === String(payrollEmployee.value))?.basic_salary || earnings.basic_salary || 0;
      payrollForm.elements.fixed_allowance.value = earnings.fixed_allowance || 0;
      payrollForm.elements.variable_allowance.value = earnings.variable_allowance || 0;
      payrollForm.elements.individual_incentive.value = earnings.individual_incentive || 0;
      payrollForm.elements.store_incentive.value = earnings.store_incentive || 0;
      payrollForm.elements.overtime_hours.value = attendance.overtime_hours || 0;
      payrollForm.elements.pph21.value = deductions.pph21 || 0;
      payrollForm.elements.bpjs_health.value = deductions.bpjs_health || 0;
      payrollForm.elements.bpjs_tk.value = deductions.bpjs_tk || 0;
      payrollForm.elements.late_penalty.value = deductions.late_penalty || 0;
      payrollForm.elements.absence_deduction.value = deductions.absence_deduction || 0;
    }
    payrollEmployee.dispatchEvent(new Event('change')); updatePayrollPreview(); payrollDialog.showModal();
  };
  document.querySelectorAll('#run-payroll, #generate-payroll').forEach(button => button.addEventListener('click', () => openPayrollForm()));
  document.querySelector('#close-payroll-dialog').addEventListener('click', closePayrollDialog);
  document.querySelector('#cancel-payroll-dialog').addEventListener('click', closePayrollDialog);
  payrollForm.addEventListener('submit', async event => {
    event.preventDefault();
    const selectedEmployee = employees.find(employee => String(employee.id) === String(payrollEmployee.value));
    const calculation = updatePayrollPreview();
    const { values, proratedSalary, overtimePay, grossPay, deductions } = calculation;
    const payrollRecord = { period_id: null, employee_id: selectedEmployee?.id, attendance: { scheduled_days: values.scheduled_days, payable_days: values.payable_days, overtime_hours: values.overtime_hours }, earnings: { basic_salary: proratedSalary, fixed_allowance: values.fixed_allowance, variable_allowance: values.variable_allowance, individual_incentive: values.individual_incentive, store_incentive: values.store_incentive, overtime_pay: overtimePay }, deductions: { pph21: values.pph21, bpjs_health: values.bpjs_health, bpjs_tk: values.bpjs_tk, late_penalty: values.late_penalty, absence_deduction: values.absence_deduction }, gross_pay: grossPay, total_deductions: deductions, status: 'Review' };
    try {
      const period = payrollForm.dataset.periodId ? { id: payrollForm.dataset.periodId } : await getActivePeriod();
      payrollRecord.period_id = period.id;
      const saved = payrollForm.dataset.editId ? await updatePayroll(payrollForm.dataset.editId, payrollRecord) : await savePayroll(payrollRecord);
      const savedRow = { ...saved, employee_name: selectedEmployee.name, employee_code: selectedEmployee.employee_code, incentive: values.individual_incentive + values.store_incentive, overtime_pay: overtimePay, net_pay: grossPay - deductions };
      payroll = payrollForm.dataset.editId ? payroll.map(row => row.id === payrollForm.dataset.editId ? savedRow : row) : [savedRow, ...payroll];
      renderPayroll(payroll); payrollDialog.close(); showToast(payrollForm.dataset.editId ? 'Payroll berhasil diperbarui.' : 'Payroll berhasil disimpan ke Supabase.');
    } catch (error) {
      const localRow = { employee_name: selectedEmployee?.name || 'Karyawan', employee_code: selectedEmployee?.employee_code || '-', gross_pay: grossPay, total_deductions: deductions, net_pay: grossPay - deductions, incentive: values.individual_incentive + values.store_incentive, overtime_pay: overtimePay };
      payroll = payrollForm.dataset.editId ? payroll.map((row, index) => (row.id === payrollForm.dataset.editId || (!row.id && String(index) === payrollForm.dataset.editId)) ? { ...row, ...localRow } : row) : [localRow, ...payroll];
      renderPayroll(payroll); payrollDialog.close(); showToast(`${payrollForm.dataset.editId ? 'Diperbarui' : 'Disimpan'} di tampilan lokal: ${error.message}`);
    }
  });
  document.querySelector('#export-button').addEventListener('click', () => {
    const csv = ['Karyawan,Kode,Take Home Pay', ...payroll.map(row => `"${row.employee_name}","${row.employee_code}",${row.net_pay}`)].join('\n');
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = 'laporan-payroll-stradivarius.csv'; link.click(); URL.revokeObjectURL(link.href);
    showToast('Laporan payroll berhasil diunduh.');
  });
  const attendanceFile = document.querySelector('#attendance-file');
  document.querySelector('#import-attendance').addEventListener('click', () => attendanceFile.click());
  attendanceFile.addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    const text = await file.text();
    const rows = text.trim().split(/\r?\n/).filter(Boolean).length - 1;
    showToast(`${Math.max(rows, 0)} baris absensi terbaca. Gunakan kolom karyawan, tanggal, masuk, dan pulang.`);
    event.target.value = '';
  });
  const dialog = document.querySelector('#employee-dialog');
  const form = document.querySelector('#employee-form');
  const closeDialog = () => dialog.close();
  const employeeDialogTitle = document.querySelector('#employee-dialog-title');
  const employeeEditId = document.querySelector('#employee-edit-id');
  const openEmployeeForm = employee => {
    form.reset(); employeeEditId.value = employee?.id || '';
    employeeDialogTitle.textContent = employee ? 'Edit karyawan' : 'Tambah karyawan';
    if (employee) Object.entries(employee).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value ?? ''; });
    dialog.showModal();
  };
  document.querySelector('#add-employee').addEventListener('click', () => openEmployeeForm());
  document.querySelector('#close-dialog').addEventListener('click', closeDialog);
  document.querySelector('#cancel-dialog').addEventListener('click', closeDialog);
  document.querySelector('#employee-list').addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const employee = employees.find(item => String(item.id) === button.dataset.id);
    if (button.dataset.action === 'edit-employee' && employee) openEmployeeForm(employee);
    if (button.dataset.action === 'delete-employee' && employee) {
      if (!window.confirm(`Arsipkan karyawan ${employee.name}?`)) return;
      archiveEmployee(employee.id).then(() => { employees = employees.filter(item => String(item.id) !== button.dataset.id); renderEmployees(employees); showToast('Karyawan berhasil diarsipkan.'); }).catch(error => showToast(`Gagal menghapus: ${error.message}`));
    }
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const formData = new FormData(form);
    const employee = { employee_code: formData.get('employee_code'), name: formData.get('name'), position: formData.get('position'), employment_status: formData.get('employment_status'), workplace_type: formData.get('workplace_type'), tax_status: formData.get('tax_status'), start_date: formData.get('start_date'), basic_salary: Number(formData.get('basic_salary')), active: true };
    try {
      const savedEmployee = employeeEditId.value ? await updateEmployee(employeeEditId.value, employee) : await saveEmployee(employee);
      employees = employeeEditId.value ? employees.map(item => String(item.id) === employeeEditId.value ? { ...item, ...savedEmployee } : item) : [savedEmployee, ...employees];
      renderEmployees(employees);
      form.reset(); dialog.close(); showToast(employeeEditId.value ? 'Data karyawan berhasil diperbarui.' : 'Karyawan berhasil disimpan ke Supabase.');
    } catch (error) { showToast(`Gagal menyimpan: ${error.message}`); }
  });
  document.querySelector('#payroll-list').addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const rowIndex = Number(button.dataset.id);
    const row = payroll.find((item, index) => item.id === button.dataset.id || (!item.id && index === rowIndex));
    if (!row) return;
    if (button.dataset.action === 'edit-payroll') openPayrollForm(row);
    if (button.dataset.action === 'delete-payroll') {
      if (!window.confirm(`Hapus payroll ${row.employee_name}?`)) return;
      const remove = row.id ? deletePayroll(row.id) : Promise.resolve();
      remove.then(() => { payroll = payroll.filter(item => item !== row); renderPayroll(payroll); showToast('Payroll berhasil dihapus.'); }).catch(error => showToast(`Gagal menghapus payroll: ${error.message}`));
    }
  });
}
init();
