// JS: Departments, courses, teachers
const departments = {
  bio:   'Biotechnology',
  bba:   'Business Administration',
  chem:  'Chemistry',
  com:   'Commerce',
  cs:    'Computer Science',
  crim:  'Criminology',
  eco:   'Economics',
  edu:   'Education',
  eng:   'English',
  env:   'Environmental Sciences',
  hist:  'History',
  ir:    'International Relations',
  isl:   'Islamic Studies',
  it:    'Information Technology',
  law:   'Law',
  lis:   'Library & Information Science',
  math:  'Mathematics',
  media: 'Media & Communication Studies',
  micro: 'Microbiology',
  pak:   'Pakistan Studies',
  phy:   'Physics',
  pol:   'Political Science',
  psy:   'Psychology',
  se:    'Software Engineering',
  soc:   'Sociology',
  stat:  'Statistics',
  tour:  'Tourism & Hospitality',
  urdu:  'Urdu',
  zoo:   'Zoology'
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

// ── GENERATE PAPERS (limit 20)
const papers = [];
const MAX_PAPERS = 20;
const deptKeys = Object.keys(departments);

for (let deptKey of deptKeys) {
  const courses = coursesByDept[deptKey] || [];
  const teachers = teachersByDept[deptKey] || ['TBA'];

  for (let course of courses) {
    for (let year of [2022, 2023, 2024]) {
      for (let type of examTypes) {
        if (papers.length >= MAX_PAPERS) break;
        papers.push({
          id: papers.length + 1,
          dept: deptKey,
          deptName: departments[deptKey],
          course: course,
          courseCode: course.split(':')[0].trim(),
          courseName: course.split(':')[1].trim(),
          teacher: teachers[Math.floor(Math.random() * teachers.length)],
          type: type,
          year: year
        });
      }
    }
  }
}

// ── STATE
let activeType = 'all';
let filteredPapers = [...papers];

// ── Populate dropdowns
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

// Populate department dropdown
const deptSel = document.getElementById('deptFilter');
Object.entries(departments).sort((a,b)=>a[1].localeCompare(b[1])).forEach(([key, name]) => {
  const o = document.createElement('option');
  o.value = key;
  o.textContent = name;
  deptSel.appendChild(o);
});

populateCourseDropdown('');
populateTeacherDropdown('');

// ── Event Listeners
deptSel.addEventListener('change', function() {
  const dept = this.value;
  populateCourseDropdown(dept);
  populateTeacherDropdown(dept);
  document.getElementById('courseFilter').value = '';
  document.getElementById('teacherFilter').value = '';
  applyFilters();
});

document.getElementById('courseFilter').addEventListener('change', applyFilters);
document.getElementById('teacherFilter').addEventListener('change', applyFilters);
document.getElementById('yearFrom').addEventListener('input', applyFilters);
document.getElementById('yearTo').addEventListener('input', applyFilters);

// Exam type pills
document.querySelectorAll('.pill').forEach(pill => {
  pill.addEventListener('click', function() {
    document.querySelectorAll('.pill').forEach(p => p.className = 'pill');
    activeType = this.dataset.type;
    this.classList.add(activeType==='all'?'active-all':'active-'+activeType.toLowerCase().replace(' ',''));
    applyFilters();
  });
});

// ── Filters
function applyFilters() {
  const search  = document.getElementById('searchInput').value.toLowerCase();
  const dept    = document.getElementById('deptFilter').value;
  const course  = document.getElementById('courseFilter').value;
  const teacher = document.getElementById('teacherFilter').value;
  const yearFrom = parseInt(document.getElementById('yearFrom').value) || 0;
  const yearTo   = parseInt(document.getElementById('yearTo').value) || 9999;
  const sort     = document.getElementById('sortSelect').value;

  filteredPapers = papers.filter(p => {
    if (dept    && p.dept    !== dept)    return false;
    if (course  && p.course  !== course)  return false;
    if (teacher && p.teacher !== teacher) return false;
    if (activeType !== 'all' && p.type !== activeType) return false;
    if (p.year < yearFrom || p.year > yearTo) return false;
    if (search && !(`${p.courseName} ${p.courseCode} ${p.teacher} ${p.deptName}`.toLowerCase().includes(search))) return false;
    return true;
  });

  if (sort==='newest') filteredPapers.sort((a,b)=>b.year-a.year);
  else if (sort==='oldest') filteredPapers.sort((a,b)=>a.year-b.year);
  else if (sort==='az') filteredPapers.sort((a,b)=>a.courseName.localeCompare(b.courseName));
  else if (sort==='za') filteredPapers.sort((a,b)=>b.courseName.localeCompare(a.courseName));

  renderPapers();
  renderChips(dept, course, teacher);
}

// ── Render papers
function tagClass(type) {
  if (type==='Final Term') return 'tag-final';
  if (type==='Mid Term') return 'tag-mid';
  return 'tag-quiz';
}

function renderPapers() {
  const grid = document.getElementById('papersGrid');
  document.getElementById('shownCount')?.textContent = filteredPapers.length;

  if (!filteredPapers.length) {
    grid.innerHTML = `<div class="empty-state"><h3>No papers found</h3></div>`;
    return;
  }

  grid.innerHTML = filteredPapers.map(p=>`
    <div class="paper-card">
      <div class="card-top">
        <span class="exam-tag ${tagClass(p.type)}">${p.type}</span>
        <span class="card-year">${p.year}</span>
      </div>
      <div class="card-title">${p.courseName}</div>
      <div class="card-code">${p.courseCode}</div>
      <div class="card-dept"><i class="fas fa-building"></i> ${p.deptName}</div>
      <div class="card-footer">
        <span class="card-teacher"><i class="fas fa-user-tie"></i> ${p.teacher}</span>
        <button class="dl-btn" onclick="downloadPaper(${p.id})"><i class="fas fa-download"></i> Download</button>
      </div>
    </div>
  `).join('');
}

// ── Chips
function renderChips(dept, course, teacher){
  const chips = document.getElementById('activeChips');
  let html = '';
  if(dept) html += `<span class="filter-chip" onclick="clearFilter('dept')"><i class="fas fa-times"></i> ${departments[dept]}</span>`;
  if(course) html += `<span class="filter-chip" onclick="clearFilter('course')"><i class="fas fa-times"></i> ${course.split(':')[0]}</span>`;
  if(teacher) html += `<span class="filter-chip" onclick="clearFilter('teacher')"><i class="fas fa-times"></i> ${teacher}</span>`;
  if(activeType!=='all') html += `<span class="filter-chip" onclick="clearFilter('type')"><i class="fas fa-times"></i> ${activeType}</span>`;
  chips.innerHTML = html;
}

// ── Clear filters
function clearFilter(type){
  if(type==='dept'){document.getElementById('deptFilter').value=''; populateCourseDropdown(''); populateTeacherDropdown('');}
  if(type==='course'){document.getElementById('courseFilter').value='';}
  if(type==='teacher'){document.getElementById('teacherFilter').value='';}
  if(type==='type'){activeType='all'; document.querySelectorAll('.pill').forEach(p=>p.className='pill'); document.querySelector('[data-type="all"]').classList.add('active-all');}
  applyFilters();
}

function clearFilters(){
  document.getElementById('deptFilter').value='';
  document.getElementById('courseFilter').value='';
  document.getElementById('teacherFilter').value='';
  document.getElementById('searchInput').value='';
  document.getElementById('yearFrom').value='';
  document.getElementById('yearTo').value='';
  document.getElementById('sortSelect').value='newest';
  activeType='all';
  document.querySelectorAll('.pill').forEach(p=>p.className='pill');
  document.querySelector('[data-type="all"]').classList.add('active-all');
  populateCourseDropdown(''); populateTeacherDropdown('');
  applyFilters();
}

// ── Dummy download
function downloadPaper(id){ alert('Download feature coming soon! Paper #'+id); }

// ── Initial render
applyFilters();