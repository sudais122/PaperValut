const departments = {
  cs:   'Computer Science',
  math: 'Mathematics',
  bba:  'Business Administration',
  eng:  'English Literature',
  phy:  'Physics',
  chem: 'Chemistry',
  eco:  'Economics',
  edu:  'Education'
};

const coursesByDept = {
  cs:   ['CS-101: Intro to Computing','CS-201: OOP','CS-301: Data Structures','CS-401: Database Systems','CS-501: Software Engineering','CS-601: AI & Machine Learning'],
  math: ['MTH-101: Calculus I','MTH-201: Calculus II','MTH-301: Linear Algebra','MTH-401: Differential Equations','MTH-501: Numerical Methods'],
  bba:  ['MGT-101: Principles of Management','MGT-201: Marketing','MGT-301: HRM','MGT-401: Financial Management','MGT-501: Business Strategy'],
  eng:  ['ENG-101: English Composition','ENG-201: British Literature','ENG-301: American Literature','ENG-401: Linguistics'],
  phy:  ['PHY-101: Mechanics','PHY-201: Electricity & Magnetism','PHY-301: Quantum Mechanics','PHY-401: Optics'],
  chem: ['CHM-101: General Chemistry','CHM-201: Organic Chemistry','CHM-301: Physical Chemistry','CHM-401: Analytical Chemistry'],
  eco:  ['ECO-101: Microeconomics','ECO-201: Macroeconomics','ECO-301: International Trade','ECO-401: Development Economics'],
  edu:  ['EDU-101: Philosophy of Education','EDU-201: Educational Psychology','EDU-301: Curriculum Development','EDU-401: Research Methods']
};

const teachersByDept = {
  cs:   ['Dr. Ahmad Khan','Prof. Usman Tariq','Ms. Fatima Raza','Dr. Zubair Hassan'],
  math: ['Prof. Nadia Shah','Dr. Irfan Malik','Mr. Khalid Rehman'],
  bba:  ['Mr. Bilal Yousaf','Dr. Sara Nawaz','Prof. Omar Siddiqui'],
  eng:  ['Ms. Amna Qureshi','Dr. Zara Ali','Prof. Tariq Mehmood'],
  phy:  ['Dr. Imran Farooq','Prof. Asad Javed','Dr. Hina Batool'],
  chem: ['Dr. Rabia Siddiqui','Prof. Faisal Ahmed','Dr. Saima Bibi'],
  eco:  ['Mr. Naveed Iqbal','Dr. Bushra Khattak','Prof. Asif Mehmood'],
  edu:  ['Ms. Rukhsana Bibi','Dr. Adnan Yousaf','Prof. Saira Noor']
};

const examTypes = ['Final Term', 'Mid Term', 'Quiz'];

// ── UPLOADERS ──
const uploaders = [
  { name: 'Ali Khan',     initials: 'AK', uploads: 7,  email: 'ali.khan@awkum.edu.pk'         },
  { name: 'Sara Ali',     initials: 'SA', uploads: 2,  email: 'sara.ali@student.awkum.edu.pk' },
  { name: 'Hamza Tariq',  initials: 'HT', uploads: 12, email: 'hamza.90@student.edu.pk'       },
  { name: 'Zara Malik',   initials: 'ZM', uploads: 2,  email: 'zara.malik@student.edu.pk'     },
  { name: 'Bilal Yousaf', initials: 'BY', uploads: 18, email: 'bilal.yousaf@edu.pk'           },
  { name: 'Nadia CS',     initials: 'NC', uploads: 5,  email: 'nadia.cs@student.edu.pk'       },
  { name: 'Imran Bba',    initials: 'IB', uploads: 9,  email: 'imran.bba@student.edu.pk'      },
  { name: 'Fatima Chem',  initials: 'FC', uploads: 3,  email: 'fatima.chem@student.edu.pk'    },
];

// ── GENERATE PAPERS ──
const papers = [];
const MAX_PAPERS = 20;

const deptKeys = Object.keys(departments);

deptKeys.forEach(deptKey => {
  const courses  = coursesByDept[deptKey];
  const teachers = teachersByDept[deptKey];

  courses.forEach(course => {
    [2022, 2023, 2024].forEach(year => {
      examTypes.forEach(type => {

        if (papers.length >= MAX_PAPERS) return;

        papers.push({
          id:         papers.length + 1,
          dept:       deptKey,
          deptName:   departments[deptKey],
          course:     course,
          courseCode: course.split(':')[0].trim(),
          courseName: course.split(':')[1].trim(),
          teacher:    teachers[Math.floor(Math.random() * teachers.length)],
          type:       type,
          year:       year,
          uploader:   uploaders[Math.floor(Math.random() * uploaders.length)]
        });

      });
    });
  });
});

// ── STATE ──
let activeType = 'all';
let filteredPapers = [...papers];

// ── POPULATE DROPDOWNS ──
function populateCourseDropdown(deptKey) {
  const sel = document.getElementById('courseFilter');
  sel.innerHTML = '<option value="">All Courses</option>';
  const courses = deptKey ? coursesByDept[deptKey] || [] : [...new Set(papers.map(p => p.course))].sort();
  courses.forEach(c => {
    const o = document.createElement('option');
    o.value = c; o.textContent = c;
    sel.appendChild(o);
  });
}

function populateTeacherDropdown(deptKey) {
  const sel = document.getElementById('teacherFilter');
  sel.innerHTML = '<option value="">All Teachers</option>';
  const teachers = deptKey ? teachersByDept[deptKey] || [] : [...new Set(papers.map(p => p.teacher))].sort();
  teachers.forEach(t => {
    const o = document.createElement('option');
    o.value = t; o.textContent = t;
    sel.appendChild(o);
  });
}

populateCourseDropdown('');
populateTeacherDropdown('');

document.getElementById('deptFilter').addEventListener('change', function () {
  populateCourseDropdown(this.value);
  populateTeacherDropdown(this.value);
  document.getElementById('courseFilter').value  = '';
  document.getElementById('teacherFilter').value = '';
  applyFilters();
});

document.getElementById('courseFilter').addEventListener('change',  applyFilters);
document.getElementById('teacherFilter').addEventListener('change', applyFilters);
document.getElementById('yearFrom').addEventListener('input', applyFilters);
document.getElementById('yearTo').addEventListener('input',   applyFilters);

// ── EXAM TYPE PILLS ──
document.querySelectorAll('.pill').forEach(pill => {
  pill.addEventListener('click', function () {
    document.querySelectorAll('.pill').forEach(p => p.className = 'pill');
    activeType = this.dataset.type;
    if      (activeType === 'all')        this.classList.add('active-all');
    else if (activeType === 'Final Term') this.classList.add('active-final');
    else if (activeType === 'Mid Term')   this.classList.add('active-mid');
    else if (activeType === 'Quiz')       this.classList.add('active-quiz');
    applyFilters();
  });
});

// ── APPLY FILTERS ──
function applyFilters() {
  const search   = document.getElementById('searchInput').value.toLowerCase();
  const dept     = document.getElementById('deptFilter').value;
  const course   = document.getElementById('courseFilter').value;
  const teacher  = document.getElementById('teacherFilter').value;
  const yearFrom = parseInt(document.getElementById('yearFrom').value) || 0;
  const yearTo   = parseInt(document.getElementById('yearTo').value)   || 9999;
  const sort     = document.getElementById('sortSelect').value;

  filteredPapers = papers.filter(p => {
    if (dept    && p.dept    !== dept)    return false;
    if (course  && p.course  !== course)  return false;
    if (teacher && p.teacher !== teacher) return false;
    if (activeType !== 'all' && p.type !== activeType) return false;
    if (p.year < yearFrom || p.year > yearTo) return false;
    if (search) {
      const hay = `${p.courseName} ${p.courseCode} ${p.teacher} ${p.deptName}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });

  if      (sort === 'newest') filteredPapers.sort((a, b) => b.year - a.year);
  else if (sort === 'oldest') filteredPapers.sort((a, b) => a.year - b.year);
  else if (sort === 'az')     filteredPapers.sort((a, b) => a.courseName.localeCompare(b.courseName));
  else if (sort === 'za')     filteredPapers.sort((a, b) => b.courseName.localeCompare(a.courseName));

  renderPapers();
  renderChips(dept, course, teacher);
}

// ── RENDER CARDS ──
function tagClass(type) {
  if (type === 'Final Term') return 'tag-final';
  if (type === 'Mid Term')   return 'tag-mid';
  return 'tag-quiz';
}

function renderPapers() {
  const grid = document.getElementById('papersGrid');
  document.getElementById('shownCount').textContent = filteredPapers.length;

  if (filteredPapers.length === 0) {
    grid.innerHTML = `<div class="empty-state">
      <div class="empty-icon"><i class="fas fa-search"></i></div>
      <h3>No papers found</h3>
      <p>Try adjusting your filters or search term.</p>
    </div>`;
    return;
  }

  grid.innerHTML = filteredPapers.map(p => `
    <div class="paper-card">

      <div class="card-top">
        <span class="exam-tag ${tagClass(p.type)}">${p.type}</span>
        <span class="card-year">${p.year}</span>
      </div>

      <div class="card-title">${p.courseName}</div>
      <div class="card-code">${p.courseCode}</div>

      <div class="card-dept">
        <i class="fas fa-building"></i> ${p.deptName}
      </div>

      <div class="card-uploader">
        <div class="uploader-avatar">${p.uploader.initials}</div>
        <div class="uploader-info">
          <div class="uploader-name">${p.uploader.name}</div>
          <div class="uploader-meta">
            <i class="fas fa-file-alt"></i> ${p.uploader.uploads} papers uploaded
          </div>
        </div>
      </div>

      <div class="card-footer">
        <span class="card-teacher"><i class="fas fa-user-tie"></i> ${p.teacher}</span>
        <button class="dl-btn" onclick="downloadPaper(${p.id})">
          <i class="fas fa-download"></i> Download
        </button>
      </div>

    </div>
  `).join('');
}

// ── CHIPS ──
function renderChips(dept, course, teacher) {
  const chips = document.getElementById('activeChips');
  let html = '';
  if (dept)    html += `<span class="filter-chip" onclick="clearFilter('dept')"><i class="fas fa-times"></i> ${departments[dept]}</span>`;
  if (course)  html += `<span class="filter-chip" onclick="clearFilter('course')"><i class="fas fa-times"></i> ${course.split(':')[0]}</span>`;
  if (teacher) html += `<span class="filter-chip" onclick="clearFilter('teacher')"><i class="fas fa-times"></i> ${teacher}</span>`;
  if (activeType !== 'all') html += `<span class="filter-chip" onclick="clearFilter('type')"><i class="fas fa-times"></i> ${activeType}</span>`;
  chips.innerHTML = html;
}

function clearFilter(type) {
  if (type === 'dept')    { document.getElementById('deptFilter').value = ''; populateCourseDropdown(''); populateTeacherDropdown(''); }
  if (type === 'course')  { document.getElementById('courseFilter').value  = ''; }
  if (type === 'teacher') { document.getElementById('teacherFilter').value = ''; }
  if (type === 'type')    {
    activeType = 'all';
    document.querySelectorAll('.pill').forEach(p => p.className = 'pill');
    document.querySelector('[data-type="all"]').classList.add('active-all');
  }
  applyFilters();
}

function clearFilters() {
  document.getElementById('deptFilter').value    = '';
  document.getElementById('courseFilter').value  = '';
  document.getElementById('teacherFilter').value = '';
  document.getElementById('searchInput').value   = '';
  document.getElementById('yearFrom').value      = '';
  document.getElementById('yearTo').value        = '';
  document.getElementById('sortSelect').value    = 'newest';
  activeType = 'all';
  document.querySelectorAll('.pill').forEach(p => p.className = 'pill');
  document.querySelector('[data-type="all"]').classList.add('active-all');
  populateCourseDropdown('');
  populateTeacherDropdown('');
  applyFilters();
}

function downloadPaper(id) {
  alert('Download feature coming soon! Paper #' + id);
}

// Initial render
applyFilters();