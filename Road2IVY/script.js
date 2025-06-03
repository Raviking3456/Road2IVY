// Road2IVY – script.js

// Tab switching logic for new tabs
function showTab(tabName) {
  document.querySelectorAll('.tab-section').forEach(tab => {
    tab.style.display = 'none';
  });
  document.getElementById(tabName).style.display = 'block';
  document.querySelectorAll('.navbar li').forEach(li => li.classList.remove('active'));
  document.getElementById('tab-' + tabName).classList.add('active');
}

// ================= MY JOURNEY TODAY =================
const journeyTasks = [
  { id: 'sat-study', label: 'SAT Study' },
  { id: 'board-study', label: 'Board Study' },
  { id: 'essay-writing', label: 'Essay Writing' },
  { id: 'blog-posted', label: 'Blog Posted' },
  { id: 'gym-reflection', label: 'Gym / Reflection' }
];

function getJourneyKey(date) {
  return 'journey-' + date;
}

function loadJourney(dateStr) {
  const key = getJourneyKey(dateStr);
  const state = JSON.parse(localStorage.getItem(key) || '[]');
  journeyTasks.forEach((task, i) => {
    document.getElementById(task.id).checked = !!state[i];
  });
}

function saveJourney(dateStr) {
  const state = journeyTasks.map(task => document.getElementById(task.id).checked);
  localStorage.setItem(getJourneyKey(dateStr), JSON.stringify(state));
}

function setJourneyDateToToday() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  document.getElementById('journey-date').value = `${yyyy}-${mm}-${dd}`;
}

function showPastTasks(dateStr) {
  const key = getJourneyKey(dateStr);
  const state = JSON.parse(localStorage.getItem(key) || '[]');
  let html = '<ul class="checklist">';
  journeyTasks.forEach((task, i) => {
    html += `<li><input type="checkbox" disabled ${state[i] ? 'checked' : ''}> <label>${task.label}</label></li>`;
  });
  html += '</ul>';
  document.getElementById('past-tasks').innerHTML = html;
}

// ================= DEADLINES =================
const defaultDeadlines = [
  { title: 'Common App Opens', date: '2025-08-01' },
  { title: 'SAT', date: '2025-08-24' },
  { title: 'SAT', date: '2025-09-28' },
  { title: 'Harvard RD', date: '2026-01-01' },
  { title: 'Yale RD', date: '2026-01-02' },
  { title: 'MIT RD', date: '2026-01-04' },
  { title: 'Stanford RD', date: '2026-01-05' },
  { title: 'CBSE Boards Start', date: '2026-02-15' }
];

function getDeadlines() {
  let deadlines = JSON.parse(localStorage.getItem('deadlines') || 'null');
  if (!deadlines) {
    deadlines = defaultDeadlines;
    localStorage.setItem('deadlines', JSON.stringify(deadlines));
  }
  return deadlines;
}

function saveDeadlines(deadlines) {
  localStorage.setItem('deadlines', JSON.stringify(deadlines));
}

function renderDeadlines() {
  const deadlines = getDeadlines();
  const now = new Date();
  deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));
  const ul = document.getElementById('deadlines-list');
  ul.innerHTML = '';
  deadlines.forEach(dl => {
    const days = Math.ceil((new Date(dl.date) - now) / (1000 * 60 * 60 * 24));
    let color = 'green';
    if (days < 10) color = 'red';
    else if (days < 30) color = 'orange';
    ul.innerHTML += `<li style="border-left:6px solid ${color};padding-left:0.7em;margin-bottom:0.7em;">
      <b>${dl.title}</b> – <span>${dl.date}</span> <span style="color:${color};font-weight:600;">(${days >= 0 ? days : 0} days left)</span>
    </li>`;
  });
}

// ================= ESSAYS =================
const essayTypes = [
  'Common App Personal Statement',
  'Harvard Supplement',
  'Yale Supplement',
  'MIT Essays',
  'Why College Essay'
];

function getEssayKey(type) {
  return 'essay-' + type;
}

function loadEssay(type) {
  const data = JSON.parse(localStorage.getItem(getEssayKey(type)) || 'null');
  document.getElementById('essay-text').value = data ? data.text : '';
  document.getElementById('essay-last-saved').textContent = data ? `Last saved: ${data.saved}` : '';
  updateEssayWordCount();
}

function saveEssay(type) {
  const text = document.getElementById('essay-text').value;
  const saved = new Date().toLocaleString();
  localStorage.setItem(getEssayKey(type), JSON.stringify({ text, saved }));
  document.getElementById('essay-last-saved').textContent = `Last saved: ${saved}`;
  updateEssayDrafts();
}

function updateEssayWordCount() {
  const text = document.getElementById('essay-text').value.trim();
  const count = text ? text.split(/\s+/).length : 0;
  document.getElementById('essay-word-count').textContent = count + ' words';
}

function updateEssayDrafts() {
  const ul = document.getElementById('essay-drafts');
  ul.innerHTML = '';
  essayTypes.forEach(type => {
    const data = JSON.parse(localStorage.getItem(getEssayKey(type)) || 'null');
    if (data && data.text) {
      ul.innerHTML += `<li style="cursor:pointer;text-decoration:underline;" onclick="selectEssayDraft('${type.replace(/'/g, "\\'")}')">${type} <span style='color:#888;font-size:0.9em;'>(${data.saved})</span></li>`;
    }
  });
}

function selectEssayDraft(type) {
  document.getElementById('essay-type').value = type;
  loadEssay(type);
}

// ========== OLD TABS FUNCTIONALITY RESTORED ==========
// Tracker logic & avatar movement
function moveCharacter() {
  const checkboxes = document.querySelectorAll('#tracker input[type="checkbox"]');
  let completed = 0;
  checkboxes.forEach(cb => { if (cb.checked) completed++; });
  // Save state
  localStorage.setItem('trackerState', JSON.stringify(Array.from(checkboxes).map(cb => cb.checked)));
  // Move avatar
  const avatar = document.getElementById('avatar');
  if (avatar) avatar.style.left = (40 + completed * 25) + 'px';
  checkEndgame();
}

function restoreTracker() {
  const state = JSON.parse(localStorage.getItem('trackerState') || '[]');
  const checkboxes = document.querySelectorAll('#tracker input[type="checkbox"]');
  checkboxes.forEach((cb, i) => {
    cb.checked = !!state[i];
  });
  moveCharacter();
}

// Blog logic
function postBlog() {
  const title = document.getElementById('blog-title').value.trim();
  const content = document.getElementById('blog-content').value.trim();
  if (!title || !content) return;
  const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
  posts.unshift({
    title,
    content,
    date: new Date().toLocaleString()
  });
  localStorage.setItem('blogPosts', JSON.stringify(posts));
  document.getElementById('blog-title').value = '';
  document.getElementById('blog-content').value = '';
  loadBlogPosts();
  loadProgress();
}

function loadBlogPosts() {
  const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
  const container = document.getElementById('blog-posts');
  if (!container) return;
  container.innerHTML = '';
  posts.forEach(post => {
    const div = document.createElement('div');
    div.className = 'blog-post';
    div.innerHTML = `<div class="blog-post-title">${post.title}</div>
      <div class="blog-post-date">${post.date}</div>
      <div>${post.content}</div>`;
    container.appendChild(div);
  });
}

// Countdown logic
function startCountdowns() {
  function updateCountdown(id, targetDate) {
    const now = new Date();
    const diff = targetDate - now;
    const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    const el = document.getElementById(id);
    if (el) el.textContent = days + ' days left';
  }
  setInterval(() => {
    updateCountdown('countdown-harvard', new Date('2025-01-01'));
    updateCountdown('countdown-sat', new Date('2024-10-05'));
    updateCountdown('countdown-board', new Date('2025-02-15'));
  }, 1000 * 60 * 60);
  updateCountdown('countdown-harvard', new Date('2025-01-01'));
  updateCountdown('countdown-sat', new Date('2024-10-05'));
  updateCountdown('countdown-board', new Date('2025-02-15'));
}

// Vision Board logic
function handleVisionUpload(e) {
  const files = Array.from(e.target.files);
  if (!files.length) return;
  const images = JSON.parse(localStorage.getItem('visionImages') || '[]');
  files.forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      images.push({ src: ev.target.result, alt: file.name });
      localStorage.setItem('visionImages', JSON.stringify(images));
      loadVisionBoard();
    };
    reader.readAsDataURL(file);
  });
  e.target.value = '';
}

function loadVisionBoard() {
  const images = JSON.parse(localStorage.getItem('visionImages') || '[]');
  const grid = document.getElementById('vision-grid');
  if (!grid) return;
  grid.innerHTML = '';
  images.forEach(img => {
    const image = document.createElement('img');
    image.src = img.src;
    image.alt = img.alt || 'Vision image';
    grid.appendChild(image);
  });
}

// Progress logic
function loadProgress() {
  const satMath = parseInt(localStorage.getItem('satMath') || '60');
  const satReading = parseInt(localStorage.getItem('satReading') || '40');
  const board = parseInt(localStorage.getItem('boardSubjects') || '30');
  const blogPosts = (JSON.parse(localStorage.getItem('blogPosts') || '[]')).length;
  setProgressBar('progress-sat-math', satMath);
  setProgressBar('progress-sat-reading', satReading);
  setProgressBar('progress-board', board);
  setProgressBar('progress-blog', Math.min(100, blogPosts));
}

function setProgressBar(id, percent) {
  const bar = document.getElementById(id);
  if (!bar) return;
  let color = 'red';
  if (percent >= 70) color = 'green';
  else if (percent >= 40) color = 'orange';
  bar.innerHTML = `<div class="progress-bar-inner ${color}" style="width:${percent}%"></div>`;
}

// Reflection logic
const reflectionPrompts = [
  "What inspired you today?",
  "Describe a challenge you overcame this week.",
  "What are you grateful for right now?",
  "How did you help someone recently?",
  "What is your biggest goal for this month?"
];

function setReflectionPrompt() {
  const idx = new Date().getDate() % reflectionPrompts.length;
  const el = document.getElementById('reflection-prompt');
  if (el) el.textContent = reflectionPrompts[idx];
}

function submitReflection() {
  const text = document.getElementById('reflection-input').value.trim();
  if (!text) return;
  const date = new Date().toLocaleDateString();
  const reflections = JSON.parse(localStorage.getItem('reflections') || '[]');
  reflections.unshift({ date, text });
  localStorage.setItem('reflections', JSON.stringify(reflections));
  document.getElementById('reflection-input').value = '';
  loadReflections();
  moveCharacter();
}

function loadReflections() {
  const reflections = JSON.parse(localStorage.getItem('reflections') || '[]');
  const container = document.getElementById('reflection-history');
  if (!container) return;
  container.innerHTML = '';
  reflections.forEach(r => {
    const div = document.createElement('div');
    div.className = 'reflection-entry';
    div.innerHTML = `<div>"${r.text}"</div><div style="font-size:0.9em;color:#888;">${r.date}</div>`;
    container.appendChild(div);
  });
}

// Endgame logic
function checkEndgame() {
  const tracker = Array.from(document.querySelectorAll('#tracker input[type="checkbox"]')).every(cb => cb.checked);
  const blog = (JSON.parse(localStorage.getItem('blogPosts') || '[]')).length > 0;
  const vision = (JSON.parse(localStorage.getItem('visionImages') || '[]')).length > 0;
  const reflection = (JSON.parse(localStorage.getItem('reflections') || '[]')).length > 0;
  if (tracker && blog && vision && reflection) {
    triggerEndgame();
  }
}

function triggerEndgame() {
  const avatar = document.getElementById('avatar');
  if (avatar) avatar.style.left = 'calc(100% - 70px)';
  showConfetti();
  setTimeout(() => {
    alert("You walked every step. Now walk in proud. Welcome to the other side.");
  }, 1200);
}

// Simple confetti animation
function showConfetti() {
  for (let i = 0; i < 60; i++) {
    const conf = document.createElement('div');
    conf.className = 'confetti';
    conf.style.left = Math.random() * 100 + '%';
    conf.style.background = `hsl(${Math.random()*360},90%,60%)`;
    conf.style.animationDelay = (Math.random()*0.7)+'s';
    document.body.appendChild(conf);
    setTimeout(() => conf.remove(), 2000);
  }
}

(function(){
  const style = document.createElement('style');
  style.textContent = `.confetti {
    position: fixed;
    top: -20px;
    width: 10px;
    height: 18px;
    border-radius: 3px;
    opacity: 0.8;
    z-index: 9999;
    animation: confetti-fall 1.7s cubic-bezier(.6,1.5,.5,1) forwards;
  }
  @keyframes confetti-fall {
    to {
      top: 100vh;
      transform: rotate(360deg) scale(0.7);
      opacity: 0.2;
    }
  }`;
  document.head.appendChild(style);
})();

// ========== END OLD TABS FUNCTIONALITY ==========
// ================= INIT =================
document.addEventListener('DOMContentLoaded', () => {
  // Tab switching
  showTab('journey');

  // My Journey Today
  setJourneyDateToToday();
  loadJourney(document.getElementById('journey-date').value);
  document.getElementById('journey-date').addEventListener('change', e => {
    loadJourney(e.target.value);
  });
  document.getElementById('save-journey').addEventListener('click', () => {
    saveJourney(document.getElementById('journey-date').value);
    alert('Progress saved!');
  });
  document.getElementById('view-past-tasks').addEventListener('click', () => {
    const date = document.getElementById('view-date').value;
    if (!date) return alert('Select a date!');
    showPastTasks(date);
  });

  // Deadlines
  renderDeadlines();
  document.getElementById('add-deadline-btn').addEventListener('click', () => {
    document.getElementById('add-deadline-form').style.display = 'block';
  });
  document.getElementById('cancel-deadline').addEventListener('click', () => {
    document.getElementById('add-deadline-form').style.display = 'none';
    document.getElementById('deadline-title').value = '';
    document.getElementById('deadline-date').value = '';
  });
  document.getElementById('save-deadline').addEventListener('click', () => {
    const title = document.getElementById('deadline-title').value.trim();
    const date = document.getElementById('deadline-date').value;
    if (!title || !date) return alert('Enter title and date!');
    const deadlines = getDeadlines();
    deadlines.push({ title, date });
    saveDeadlines(deadlines);
    renderDeadlines();
    document.getElementById('add-deadline-form').style.display = 'none';
    document.getElementById('deadline-title').value = '';
    document.getElementById('deadline-date').value = '';
  });

  // Essays
  loadEssay(document.getElementById('essay-type').value);
  updateEssayDrafts();
  document.getElementById('essay-type').addEventListener('change', e => {
    loadEssay(e.target.value);
  });
  document.getElementById('essay-text').addEventListener('input', updateEssayWordCount);
  document.getElementById('save-essay').addEventListener('click', () => {
    saveEssay(document.getElementById('essay-type').value);
    alert('Essay saved!');
  });

  // Tracker
  restoreTracker();
  document.querySelectorAll('#tracker input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', moveCharacter);
  });

  // Blog
  loadBlogPosts();

  // Countdown
  startCountdowns();

  // Vision Board
  loadVisionBoard();

  // Progress
  loadProgress();

  // Reflection
  setReflectionPrompt();
  loadReflections();
});

// Expose for inline onclick
window.selectEssayDraft = selectEssayDraft;

// Confetti CSS (injected for demo)
(function(){
  const style = document.createElement('style');
  style.textContent = `.confetti {
    position: fixed;
    top: -20px;
    width: 10px;
    height: 18px;
    border-radius: 3px;
    opacity: 0.8;
    z-index: 9999;
    animation: confetti-fall 1.7s cubic-bezier(.6,1.5,.5,1) forwards;
  }
  @keyframes confetti-fall {
    to {
      top: 100vh;
      transform: rotate(360deg) scale(0.7);
      opacity: 0.2;
    }
  }`;
  document.head.appendChild(style);
})();

// ========== AI Essay Rating Assistant ==========
async function rateEssay() {
  const essay = document.getElementById('ai-essay-input').value.trim();
  const feedbackDiv = document.getElementById('ai-feedback');
  if (!essay) {
    feedbackDiv.innerHTML = '<span style="color:#e53935;">Please paste your essay above.</span>';
    return;
  }
  feedbackDiv.innerHTML = '<span style="color:#ffd700;">Rating your essay with AI... <span class="loader"></span></span>';
  try {
    const response = await fetch('/api/rateEssay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ essay })
    });
    if (!response.ok) throw new Error('Network error');
    const data = await response.json();
    if (data && typeof data.score !== 'undefined') {
      feedbackDiv.innerHTML = `
        <div style='font-size:1.2em;font-weight:600;'>⭐ Score: <span style='color:#ffd700;'>${data.score} / 10</span></div>
        <div style='margin-top:0.7em;'><b>Strengths:</b><br><span style='color:#00e676;'>${Array.isArray(data.strengths) ? data.strengths.join('<br>') : data.strengths}</span></div>
        <div style='margin-top:0.7em;'><b>Weaknesses:</b><br><span style='color:#e53935;'>${Array.isArray(data.weaknesses) ? data.weaknesses.join('<br>') : data.weaknesses}</span></div>
        <div style='margin-top:0.7em;'><b>Suggestions:</b><br><span style='color:#ffd700;'>${data.suggestions}</span></div>
      `;
    } else {
      throw new Error('Invalid AI response');
    }
  } catch (e) {
    feedbackDiv.innerHTML = '<span style="color:#e53935;">AI could not rate your essay. Try again.</span>';
  }
}
