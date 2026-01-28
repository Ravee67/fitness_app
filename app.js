// Interactive behaviors for FitStart web app
document.addEventListener('DOMContentLoaded', function(){
  // Smooth scroll for nav links (progressive enhancement)
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if(href.startsWith('#')){
        e.preventDefault();
        const el = document.querySelector(href);
        if(el) el.scrollIntoView({behavior:'smooth'});
      }
    });
  });

  // Attach click handlers for opening tutorial links in new tab is handled by <a target="_blank"> already
  // Initialize theme from localStorage or system preference
  const themeToggle = document.getElementById('theme-toggle');
  const applyTheme = (t)=>{
    document.documentElement.setAttribute('data-theme', t);
    if(themeToggle){
      themeToggle.textContent = t === 'dark' ? 'Dark' : 'Light';
      themeToggle.setAttribute('aria-pressed', String(t === 'dark'));
    }
  };

  const saved = localStorage.getItem('fitstart-theme');
  if(saved) applyTheme(saved);
  else{
    // Prefer dark by default for a Netflix-like look, but respect prefers-color-scheme
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  if(themeToggle){
    themeToggle.addEventListener('click', ()=>{
      const curr = document.documentElement.getAttribute('data-theme') || 'light';
      const next = curr === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('fitstart-theme', next);
    });
  }
});

function showDetails(plan){
  // Toggle plan details visibility
  const el = document.getElementById('details-' + plan);
  if(!el) return;
  el.style.display = (el.style.display === 'none' || el.style.display === '') ? 'block' : 'none';
}

function selectPlan(name){
  // Update dashboard summary
  document.getElementById('selected-plan').textContent = name + ' plan selected.';
  const summary = document.getElementById('plan-summary');
  if(!summary) return;
  let html = '';
  if(name === 'Beginner'){
    html = `
      <p class="muted small"><strong>Daily routine:</strong> 30–40 min (walking, bodyweight, stretching)</p>
      <p class="muted small"><strong>Calories:</strong> ~220 kcal burned — Intake ~1,800 kcal</p>
      <p class="muted small">Beginner tip: Focus on form and habit. Aim for 3–5 sessions per week and hydrate well.</p>
    `;
  } else if(name === 'Moderate'){
    html = `
      <p class="muted small"><strong>Daily routine:</strong> 45–60 min (jogging, squats, push-ups, plank, jump rope)</p>
      <p class="muted small"><strong>Calories:</strong> ~460 kcal burned — Intake ~2,200 kcal</p>
      <p class="muted small">Moderate tip: Track progressive reps/tempo and add small increments weekly.</p>
    `;
  } else if(name === 'Advanced'){
    html = `
      <p class="muted small"><strong>Daily routine:</strong> 60–90 min (running, weight training, HIIT, core)</p>
      <p class="muted small"><strong>Calories:</strong> ~850 kcal burned — Intake ~2,800–3,000 kcal</p>
      <p class="muted small">Advanced tip: Prioritize recovery, nutrition timing, and progressive overload.</p>
    `;
  }
  summary.innerHTML = html;
  // Scroll dashboard into view to confirm selection
  document.getElementById('dashboard').scrollIntoView({behavior:'smooth'});
}

// Expose for console debugging if needed
window.showDetails = showDetails;
window.selectPlan = selectPlan;

// Dashboard profile handling
function saveProfile(){
  const profile = {
    name: (document.getElementById('p-name')||{}).value || '',
    age: Number((document.getElementById('p-age')||{}).value) || null,
    sex: (document.getElementById('p-sex')||{}).value || 'female',
    weight: Number((document.getElementById('p-weight')||{}).value) || null,
    height: Number((document.getElementById('p-height')||{}).value) || null,
    activity: Number((document.getElementById('p-activity')||{}).value) || 1.2
  };
  localStorage.setItem('fitstart-profile', JSON.stringify(profile));
  updateMetrics(profile);
  alert('Profile saved locally.');
}

function clearProfile(){
  localStorage.removeItem('fitstart-profile');
  const form = document.getElementById('profile-form');
  if(form) form.reset();
  const metrics = document.getElementById('metrics');
  if(metrics) metrics.textContent = 'No saved profile yet.';
}

function computeBMI(weightKg, heightCm){
  if(!weightKg || !heightCm) return null;
  const h = heightCm/100;
  return +(weightKg/(h*h)).toFixed(1);
}

function computeBMR(weightKg, heightCm, age, sex){
  // Mifflin-St Jeor Equation
  if(!weightKg || !heightCm || !age) return null;
  if(sex === 'male'){
    return Math.round(10*weightKg + 6.25*heightCm - 5*age + 5);
  } else {
    return Math.round(10*weightKg + 6.25*heightCm - 5*age - 161);
  }
}

function updateMetrics(profile){
  const metrics = document.getElementById('metrics');
  if(!metrics) return;
  if(!profile || !profile.weight || !profile.height){
    metrics.textContent = 'Please enter weight and height to calculate metrics.';
    return;
  }
  const bmi = computeBMI(profile.weight, profile.height);
  const bmr = computeBMR(profile.weight, profile.height, profile.age, profile.sex);
  const daily = bmr ? Math.round(bmr * (profile.activity || 1.2)) : null;
  metrics.innerHTML = `
    <p><strong>Name:</strong> ${profile.name || '-'} </p>
    <p><strong>BMI:</strong> ${bmi || '-'} ${bmi? '(' + bmiCategory(bmi) + ')' : ''}</p>
    <p><strong>BMR (est.):</strong> ${bmr ? bmr + ' kcal/day' : '-'}</p>
    <p><strong>Daily need (est.):</strong> ${daily ? daily + ' kcal/day' : '-'} (BMR × activity)</p>
  `;
}

function bmiCategory(bmi){
  if(bmi < 18.5) return 'Underweight';
  if(bmi < 25) return 'Normal';
  if(bmi < 30) return 'Overweight';
  return 'Obese';
}

function initDashboard(){
  try{
    const raw = localStorage.getItem('fitstart-profile');
    if(raw){
      const profile = JSON.parse(raw);
      // populate form
      if(document.getElementById('p-name')) document.getElementById('p-name').value = profile.name || '';
      if(document.getElementById('p-age')) document.getElementById('p-age').value = profile.age || '';
      if(document.getElementById('p-sex')) document.getElementById('p-sex').value = profile.sex || 'female';
      if(document.getElementById('p-weight')) document.getElementById('p-weight').value = profile.weight || '';
      if(document.getElementById('p-height')) document.getElementById('p-height').value = profile.height || '';
      if(document.getElementById('p-activity')) document.getElementById('p-activity').value = profile.activity || 1.2;
      updateMetrics(profile);
    }
  }catch(e){
    console.error('Failed to init dashboard', e);
  }
}
