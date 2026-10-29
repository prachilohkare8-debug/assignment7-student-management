const API = '/api/students';
const state = { page: 1, pages: 1, total: 0, students: [], editingId: null, requestNumber: 0 };
const $ = (selector) => document.querySelector(selector);
const elements = {
  body: $('#students-body'), search: $('#search-input'), department: $('#department-filter'), year: $('#year-filter'), sort: $('#sort-select'),
  total: $('#stat-total'), departments: $('#stat-departments'), cgpa: $('#stat-cgpa'), resultCount: $('#result-count'), pageLabel: $('#page-label'),
  prev: $('#prev-page'), next: $('#next-page'), modal: $('#student-modal'), form: $('#student-form'), modalTitle: $('#modal-title'),
  formError: $('#form-error'), save: $('#save-student-btn'), toast: $('#toast'), dbStatus: $('#db-status'), statusDot: $('.status-dot')
};
let searchTimer;

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase() || 'ST';
}
function yearLabel(year) { return ({ 1: 'First year', 2: 'Second year', 3: 'Third year', 4: 'Fourth year' })[year] || `Year ${year}`; }
function showToast(message, isError = false) {
  elements.toast.textContent = message;
  elements.toast.classList.toggle('error', isError);
  elements.toast.classList.remove('hidden');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => elements.toast.classList.add('hidden'), 3500);
}
async function request(url, options = {}) {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) throw new Error(payload.message || `Request failed with status ${response.status}`);
  return payload;
}
function buildQuery() {
  const [sortBy, order] = elements.sort.value.split(':');
  const params = new URLSearchParams({ page: String(state.page), limit: '8', sortBy, order });
  if (elements.search.value.trim()) params.set('q', elements.search.value.trim());
  if (elements.department.value !== 'all') params.set('department', elements.department.value);
  if (elements.year.value !== 'all') params.set('year', elements.year.value);
  return params.toString();
}
async function loadStudents() {
  const requestNumber = ++state.requestNumber;
  elements.body.innerHTML = '<tr><td colspan="6" class="empty-state">Loading student records…</td></tr>';
  try {
    const data = await request(`${API}?${buildQuery()}`);
    if (requestNumber !== state.requestNumber) return;
    state.students = data.students;
    state.total = data.total;
    state.pages = data.pages;
    renderStudents();
    updateStats();
    elements.resultCount.textContent = `Showing ${data.total === 0 ? 0 : (data.page - 1) * data.limit + 1}–${Math.min(data.page * data.limit, data.total)} of ${data.total} students`;
    elements.pageLabel.textContent = `Page ${data.page} of ${data.pages}`;
    elements.prev.disabled = data.page <= 1;
    elements.next.disabled = data.page >= data.pages;
  } catch (error) {
    elements.body.innerHTML = `<tr><td colspan="6" class="empty-state">${escapeHtml(error.message)} — check that the server and database are running.</td></tr>`;
    elements.resultCount.textContent = 'Could not load records';
    showToast(error.message, true);
  }
}
function renderStudents() {
  if (!state.students.length) {
    elements.body.innerHTML = '<tr><td colspan="6" class="empty-state">No students found. Add a student or change your search filters.</td></tr>';
    return;
  }
  elements.body.innerHTML = state.students.map((student) => `
    <tr>
      <td><div class="student-cell"><div class="student-avatar">${escapeHtml(initials(student.fullName))}</div><div><div class="student-name">${escapeHtml(student.fullName)}</div><div class="student-email">${escapeHtml(student.email)}</div></div></div></td>
      <td class="prn">${escapeHtml(student.prn)}</td>
      <td><span class="department-pill">${escapeHtml(student.department)}</span></td>
      <td><span class="year-pill">${escapeHtml(yearLabel(student.year))}</span></td>
      <td class="cgpa">${Number(student.cgpa).toFixed(2)}</td>
      <td><div class="actions"><button class="action-btn" data-action="edit" data-id="${escapeHtml(student._id)}" type="button">Edit</button><button class="action-btn delete" data-action="delete" data-id="${escapeHtml(student._id)}" type="button">Delete</button></div></td>
    </tr>`).join('');
}
function updateStats() {
  // The dashboard summaries are calculated from the current filtered result set.
  elements.total.textContent = state.total;
  const departments = new Set(state.students.map((student) => student.department));
  elements.departments.textContent = departments.size;
  const average = state.students.length ? state.students.reduce((sum, student) => sum + Number(student.cgpa), 0) / state.students.length : 0;
  elements.cgpa.textContent = state.students.length ? average.toFixed(2) : '—';
}
async function checkHealth() {
  try {
    const data = await request('/api/health');
    const connected = data.database === 'connected';
    elements.dbStatus.textContent = connected ? 'Connected to MongoDB' : 'Database disconnected';
    elements.statusDot.classList.toggle('online', connected);
  } catch {
    elements.dbStatus.textContent = 'Server unavailable';
  }
}
function openModal(student = null) {
  state.editingId = student ? student._id : null;
  elements.form.reset();
  elements.formError.classList.add('hidden');
  elements.modalTitle.textContent = student ? 'Edit student' : 'Add student';
  elements.save.textContent = student ? 'Save changes' : 'Save student';
  if (student) {
    for (const field of ['fullName', 'prn', 'email', 'department', 'year', 'cgpa']) {
      elements.form.elements[field].value = student[field];
    }
  }
  elements.modal.classList.remove('hidden');
  elements.form.elements.fullName.focus();
}
function closeModal() {
  elements.modal.classList.add('hidden');
  state.editingId = null;
}
function showFormError(message) {
  elements.formError.textContent = message;
  elements.formError.classList.remove('hidden');
}

$('#add-student-btn').addEventListener('click', () => openModal());
$('#close-modal').addEventListener('click', closeModal);
$('#cancel-modal').addEventListener('click', closeModal);
elements.modal.addEventListener('click', (event) => { if (event.target === elements.modal) closeModal(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });
elements.search.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { state.page = 1; loadStudents(); }, 250); });
[elements.department, elements.year, elements.sort].forEach((element) => element.addEventListener('change', () => { state.page = 1; loadStudents(); }));
elements.prev.addEventListener('click', () => { if (state.page > 1) { state.page -= 1; loadStudents(); } });
elements.next.addEventListener('click', () => { if (state.page < state.pages) { state.page += 1; loadStudents(); } });

elements.body.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const student = state.students.find((item) => item._id === button.dataset.id);
  if (!student) return;
  if (button.dataset.action === 'edit') return openModal(student);
  if (button.dataset.action === 'delete') {
    if (!window.confirm(`Delete the record for ${student.fullName} (${student.prn})? This cannot be undone.`)) return;
    try {
      const result = await request(`${API}/${encodeURIComponent(student._id)}`, { method: 'DELETE' });
      showToast(result.message);
      if (state.students.length === 1 && state.page > 1) state.page -= 1;
      await loadStudents();
    } catch (error) { showToast(error.message, true); }
  }
});

elements.form.addEventListener('submit', async (event) => {
  event.preventDefault();
  elements.formError.classList.add('hidden');
  if (!elements.form.reportValidity()) return;
  const formData = new FormData(elements.form);
  const body = Object.fromEntries(formData.entries());
  body.fullName = body.fullName.trim();
  body.prn = body.prn.trim().toUpperCase();
  body.email = body.email.trim().toLowerCase();
  body.year = Number(body.year);
  body.cgpa = Number(body.cgpa);
  if (!Number.isFinite(body.cgpa) || body.cgpa < 0 || body.cgpa > 10) return showFormError('CGPA must be a number between 0 and 10.');
  elements.save.disabled = true;
  elements.save.textContent = 'Saving…';
  try {
    const isEditing = Boolean(state.editingId);
    const url = isEditing ? `${API}/${encodeURIComponent(state.editingId)}` : API;
    const result = await request(url, { method: isEditing ? 'PUT' : 'POST', body: JSON.stringify(body) });
    closeModal();
    state.page = 1;
    showToast(result.message);
    await loadStudents();
  } catch (error) {
    showFormError(error.message);
  } finally {
    elements.save.disabled = false;
    elements.save.textContent = state.editingId ? 'Save changes' : 'Save student';
  }
});

$('#today-label').textContent = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()).toUpperCase();
checkHealth();
loadStudents();
