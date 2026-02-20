// ---------------------
// The First Impression - Stage 1.5 (Arcade)
// Age (5 tries) -> Salary (5 tries) -> Name (6 tries) -> Occupation (6 tries) -> State (5 tries w/ clues)
// ---------------------

// Real photo portraits (not AI-looking). These are real images from RandomUser.
const FACE_URLS = [
  "https://randomuser.me/api/portraits/men/11.jpg",
  "https://randomuser.me/api/portraits/men/22.jpg",
  "https://randomuser.me/api/portraits/men/33.jpg",
  "https://randomuser.me/api/portraits/men/44.jpg",
  "https://randomuser.me/api/portraits/men/55.jpg",
  "https://randomuser.me/api/portraits/women/12.jpg",
  "https://randomuser.me/api/portraits/women/23.jpg",
  "https://randomuser.me/api/portraits/women/34.jpg",
  "https://randomuser.me/api/portraits/women/45.jpg",
  "https://randomuser.me/api/portraits/women/56.jpg"
];

// Beta people list (we’ll replace with your real 20k profiles later)
const PEOPLE = [
  { name: "John", age: 28, salary: 42000, occupation: "Retail Associate", state: "California", faceIndex: 0, stateClues: ["West Coast", "Pacific", "High cost of living"] },
  { name: "Michael", age: 46, salary: 98000, occupation: "Accountant", state: "Texas", faceIndex: 5, stateClues: ["South", "Big state", "No state income tax"] },
  { name: "Ashley", age: 33, salary: 74000, occupation: "Nurse", state: "Florida", faceIndex: 6, stateClues: ["Southeast", "Warm climate", "Lots of coastline"] },
  { name: "David", age: 52, salary: 121000, occupation: "Software Engineer", state: "Washington", faceIndex: 1, stateClues: ["Pacific Northwest", "Rainy", "Tech-heavy"] },
  { name: "Samantha", age: 24, salary: 61000, occupation: "Teacher", state: "Ohio", faceIndex: 7, stateClues: ["Midwest", "Great Lakes region", "Four seasons"] }
];

const ROUND_ORDER = ["age", "name", "salary", "occupation", "state"];

let score = 0;
let person = null;
let roundIndex = 0;

let ageTries = 0;
let salaryTries = 0;
let nameTries = 0;
let occTries = 0;
let stateTries = 0;

const MAX_AGE_TRIES = 5;
const MAX_SALARY_TRIES = 5;
const MAX_NAME_TRIES = 6;
const MAX_OCC_TRIES = 6;
const MAX_STATE_TRIES = 5;

const STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia",
  "Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts",
  "Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey",
  "New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
  "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming"
];

function $(id){ return document.getElementById(id); }

function setReveal(id, value){ $(id).textContent = value; }

function pulse(el){
  el.classList.remove("pulse");
  void el.offsetWidth;
  el.classList.add("pulse");
}

function floatPoints(text){
  const el = document.createElement("div");
  el.className = "float fb-correct";
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 950);
}

function feedback(text, type, doShake=false){
  const fb = $("feedback");
  fb.className = "feedback anim-pop " + type;

  // force replay each time
  fb.classList.remove("shake");
  void fb.offsetWidth;
  if(doShake) fb.classList.add("shake");

  fb.textContent = text;

  // flash the face on each guess so it feels alive
  const faceWrap = document.querySelector(".face-wrap");
  faceWrap.classList.remove("flash");
  void faceWrap.offsetWidth;
  faceWrap.classList.add("flash");
}

function addScore(delta){
  score += delta;
  $("score").textContent = score;
  pulse($("score"));
  if(delta > 0) floatPoints("+" + delta);
}

function resetTries(){
  ageTries = salaryTries = nameTries = occTries = stateTries = 0;
}

function startNewPerson(){
  person = PEOPLE[Math.floor(Math.random()*PEOPLE.length)];
  roundIndex = 0;
  resetTries();

  setReveal("rAge","???");
  setReveal("rSalary","???");
  setReveal("rName","???");

  const img = $("face");
  img.src = FACE_URLS[person.faceIndex % FACE_URLS.length] + "?v=" + Date.now();

  feedback("GET READY…", "", false);
  renderRound();
}

function renderRound(){
  const area = $("roundArea");
  const round = ROUND_ORDER[roundIndex];

  if(round === "age"){
    area.innerHTML = `
      <h2>AGE ROUND — ${ageTries}/${MAX_AGE_TRIES}</h2>
      <div class="controls">
        <input id="ageInput" type="number" placeholder="Enter age" inputmode="numeric" />
        <button id="ageBtn">SUBMIT</button>
      </div>
      <div style="opacity:.85;margin-top:10px;font-size:14px;">Higher/Lower • Within 10 = CLOSE</div>
    `;
    $("ageBtn").onclick = onAge;
    $("ageInput").focus();
    $("ageInput").addEventListener("keydown", e=>{ if(e.key==="Enter") onAge(); });
    return;
  }

  if(round === "salary"){
    area.innerHTML = `
      <h2>SALARY ROUND — ${salaryTries}/${MAX_SALARY_TRIES}</h2>
      <div class="controls">
        <input id="salaryInput" type="number" placeholder="Enter salary" inputmode="numeric" />
        <button id="salaryBtn">SUBMIT</button>
      </div>
      <div style="opacity:.85;margin-top:10px;font-size:14px;">Higher/Lower • Within $10,000 = CLOSE</div>
    `;
    $("salaryBtn").onclick = onSalary;
    $("salaryInput").focus();
    $("salaryInput").addEventListener("keydown", e=>{ if(e.key==="Enter") onSalary(); });
    return;
  }

  if(round === "name"){
    area.innerHTML = `
      <h2>NAME ROUND — ${nameTries}/${MAX_NAME_TRIES}</h2>
      <div class="controls">
        <input id="nameInput" type="text" placeholder="Enter first name" autocomplete="off" />
        <button id="nameBtn">SUBMIT</button>
      </div>
      <div style="opacity:.85;margin-top:10px;font-size:14px;">Points: 1–2=10, 3=8, 4=6, 5=4, 6=2</div>
    `;
    $("nameBtn").onclick = onName;
    $("nameInput").focus();
    $("nameInput").addEventListener("keydown", e=>{ if(e.key==="Enter") onName(); });
    return;
  }

  if(round === "occupation"){
    area.innerHTML = `
      <h2>OCCUPATION ROUND — ${occTries}/${MAX_OCC_TRIES}</h2>
      <div class="controls">
        <input id="occInput" type="text" placeholder="Enter occupation" autocomplete="off" />
        <button id="occBtn">SUBMIT</button>
      </div>
      <div style="opacity:.85;margin-top:10px;font-size:14px;">(Wordle-style tiles next upgrade) • Same points ladder as Name</div>
    `;
    $("occBtn").onclick = onOcc;
    $("occInput").focus();
    $("occInput").addEventListener("keydown", e=>{ if(e.key==="Enter") onOcc(); });
    return;
  }

  // State “map-style” beta: dropdown + clue reveal each miss (interactive map is next upgrade)
  area.innerHTML = `
    <h2>STATE ROUND — ${stateTries}/${MAX_STATE_TRIES}</h2>
    <div class="controls">
      <select id="stateSelect">${STATES.map(s=>`<option value="${s}">${s}</option>`).join("")}</select>
      <button id="stateBtn">GUESS STATE</button>
    </div>
    <div id="clues" style="margin-top:12px; opacity:.95; font-size:15px;"></div>
    <div style="opacity:.75;margin-top:10px;font-size:13px;">Interactive clickable US map is the next build step.</div>
  `;
  $("stateBtn").onclick = onState;
  renderClues();
}

function renderClues(){
  const cluesEl = $("clues");
  if(!cluesEl) return;

  const cluesToShow = Math.min(stateTries, (person.stateClues||[]).length);
  const list = (person.stateClues||[]).slice(0, cluesToShow);

  cluesEl.innerHTML = list.length
    ? `<b>CLUES:</b> ${list.map(c=>`<span style="display:inline-block;margin:4px 6px;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.10)">${c}</span>`).join("")}`
    : `<b>CLUES:</b> (none yet — miss a guess to reveal)`;
}

function advanceRound(){
  roundIndex++;
  if(roundIndex >= ROUND_ORDER.length){
    feedback("ROUND COMPLETE! 🔥 NEW FACE…", "fb-correct", false);
    setTimeout(startNewPerson, 1200);
    return;
  }
  renderRound();
}

/* ---- Handlers ---- */

function onAge(){
  const val = parseInt($("ageInput").value);
  if(Number.isNaN(val)) return;

  ageTries++;

  if(val === person.age){
    setReveal("rAge", String(person.age));
    addScore(10);
    feedback("✅ EXACT! AGE LOCKED IN!", "fb-correct", false);
    setTimeout(advanceRound, 950);
    return;
  }

  const diff = Math.abs(val - person.age);
  if(diff <= 10){
    feedback("🔥 CLOSE! " + (val < person.age ? "⬆️ HIGHER" : "⬇️ LOWER"), "fb-close", true);
  } else {
    feedback(val < person.age ? "⬆️ HIGHER" : "⬇️ LOWER", "fb-wrong", true);
  }

  if(ageTries >= MAX_AGE_TRIES){
    setReveal("rAge", String(person.age));
    feedback("❌ OUT OF GUESSES — AGE: " + person.age, "fb-wrong", false);
    setTimeout(advanceRound, 1100);
  } else {
    renderRound();
  }
}

function onSalary(){
  const val = parseInt($("salaryInput").value);
  if(Number.isNaN(val)) return;

  salaryTries++;

  if(val === person.salary){
    setReveal("rSalary", "$" + person.salary.toLocaleString());
    addScore(10);
    feedback("✅ EXACT! SALARY LOCKED IN!", "fb-correct", false);
    setTimeout(advanceRound, 950);
    return;
  }

  const diff = Math.abs(val - person.salary);
  if(diff <= 10000){
    feedback("💸 CLOSE! " + (val < person.salary ? "⬆️ HIGHER" : "⬇️ LOWER"), "fb-close", true);
  } else {
    feedback(val < person.salary ? "⬆️ HIGHER" : "⬇️ LOWER", "fb-wrong", true);
  }

  if(salaryTries >= MAX_SALARY_TRIES){
    setReveal("rSalary", "$" + person.salary.toLocaleString());
    feedback("❌ OUT OF GUESSES — $" + person.salary.toLocaleString(), "fb-wrong", false);
    setTimeout(advanceRound, 1100);
  } else {
    renderRound();
  }
}

function onName(){
  const guess = $("nameInput").value.trim();
  if(!guess) return;

  nameTries++;

  if(guess.toLowerCase() === person.name.toLowerCase()){
    const ladder = [10,10,8,6,4,2];
    const points = ladder[nameTries-1] || 0;
    setReveal("rName", person.name);
    addScore(points);
    feedback("🎉 NAME CORRECT! +" + points, "fb-correct", false);
    setTimeout(advanceRound, 950);
    return;
  }

  const remaining = MAX_NAME_TRIES - nameTries;
  if(remaining <= 0){
    setReveal("rName", person.name);
    feedback("❌ FAIL — NAME WAS: " + person.name, "fb-wrong", false);
    setTimeout(advanceRound, 1100);
    return;
  }

  feedback("❌ WRONG — " + remaining + " LEFT", "fb-wrong", true);
  renderRound();
}

function onOcc(){
  const guess = $("occInput").value.trim();
  if(!guess) return;

  occTries++;

  if(guess.toLowerCase() === person.occupation.toLowerCase()){
    const ladder = [10,10,8,6,4,2];
    const points = ladder[occTries-1] || 0;
    addScore(points);
    feedback("🎉 OCCUPATION CORRECT! +" + points, "fb-correct", false);
    setTimeout(advanceRound, 950);
    return;
  }

  const remaining = MAX_OCC_TRIES - occTries;
  if(remaining <= 0){
    feedback("❌ FAIL — OCCUPATION: " + person.occupation, "fb-wrong", false);
    setTimeout(advanceRound, 1100);
    return;
  }

  feedback("❌ WRONG — " + remaining + " LEFT", "fb-wrong", true);
  renderRound();
}

function onState(){
  const pick = $("stateSelect").value;
  stateTries++;

  if(pick === person.state){
    addScore([10,8,6,4,2][stateTries-1] || 0);
    feedback("🗺️ STATE CORRECT! " + person.state, "fb-correct", false);
    setTimeout(advanceRound, 950);
    return;
  }

  renderClues();
  const remaining = MAX_STATE_TRIES - stateTries;

  if(remaining <= 0){
    feedback("❌ FAIL — STATE WAS: " + person.state, "fb-wrong", false);
    setTimeout(advanceRound, 1100);
    return;
  }

  feedback("❌ WRONG STATE — " + remaining + " LEFT (CLUE ADDED)", "fb-wrong", true);
  renderRound();
}

// Boot
window.addEventListener("load", () => {
  $("score").textContent = "0";
  startNewPerson();
});
