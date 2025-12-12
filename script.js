/* -------------------------
  データ保存
------------------------- */
let goals = JSON.parse(localStorage.getItem("goals") || "[]");
function save(){ localStorage.setItem("goals", JSON.stringify(goals)); }

/* -------------------------
  自動タスク生成
------------------------- */
function generateTasks(title){
  title = title.toLowerCase();

  if(title.includes("ダイエット")) return [
    {text:"食事を記録",done:false},
    {text:"運動を10分",done:false},
    {text:"水を1L飲む",done:false},
    {text:"間食を控える",done:false},
    {text:"体重を記録",done:false},
  ];

  if(title.includes("英語")) return [
    {text:"英単語10個",done:false},
    {text:"英語アプリ10分",done:false},
    {text:"英語日記を書く",done:false},
    {text:"リスニング15分",done:false},
    {text:"会話練習5分",done:false},
  ];

  return [
    {text:"必要な手順を書き出す",done:false},
    {text:"今日する最初の1つを決める",done:false},
    {text:"関連情報を調べる",done:false},
    {text:"進捗を記録",done:false},
    {text:"翌日の計画を立てる",done:false},
  ];
}

/* -------------------------
  初期表示
------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  renderGoals();
  renderCalendar();
});

/* -------------------------
  Goal 追加
------------------------- */
document.getElementById("addGoalBtn").addEventListener("click", () => {
  const title = goalInput.value.trim();
  const deadline = goalDeadline.value;
  if(!title || !deadline) return;

  goals.push({
    id: Date.now(),
    title,
    deadline,
    tasks: generateTasks(title),
    progress: 0
  });

  goalInput.value = "";
  goalDeadline.value = "";

  save();
  renderGoals();
  renderCalendar();
});

/* -------------------------
 全削除
------------------------- */
document.getElementById("deleteAllBtn").addEventListener("click", () => {
  if(!confirm("全て削除しますか？")) return;
  goals = [];
  save();
  renderGoals();
  renderCalendar();
});

/* -------------------------
  Goal 表示
------------------------- */
function renderGoals(){
  const box = document.getElementById("goalsContainer");
  box.innerHTML = "";

  goals.forEach(goal=>{
    const card = document.createElement("div");
    card.className = "goal-card";

    const header = document.createElement("div");
    header.className = "goal-header";
    header.innerHTML = `
      <span class="goal-title">${goal.title}</span>
      <span class="goal-deadline">${goal.deadline}</span>
    `;

    const ul = document.createElement("ul");
    ul.className = "task-list";

    goal.tasks.forEach((t, idx)=>{
      const li = document.createElement("li");
      li.className = "task-item";

      const chk = document.createElement("input");
      chk.type = "checkbox";
      chk.checked = t.done;
      chk.onchange = ()=>{
        t.done = chk.checked;
        updateGoalProgress(goal);
      };

      const txt = document.createElement("span");
      txt.textContent = t.text;

      const del = document.createElement("button");
      del.textContent = "削除";
      del.onclick = ()=>{
        goal.tasks.splice(idx,1);
        updateGoalProgress(goal);
      };

      li.append(chk, txt, del);
      ul.appendChild(li);
    });

    const wrap = document.createElement("div");
    wrap.className = "progress-wrap";

    const bar = document.createElement("div");
    bar.className = "progress-bar";

    const fill = document.createElement("div");
    fill.className = "progress-fill";
    fill.style.width = goal.progress + "%";

    bar.appendChild(fill);
    wrap.appendChild(bar);

    card.append(header, ul, wrap);
    box.appendChild(card);
  });

  updateOverallProgress();
}

/* -------------------------
  Progress 更新
------------------------- */
function updateGoalProgress(goal){
  const total = goal.tasks.length;
  const done = goal.tasks.filter(t=>t.done).length;
  goal.progress = total===0 ? 0 : Math.round(done/total*100);
  save();
  renderGoals();
  renderCalendar();
}

function updateOverallProgress(){
  const gauge = document.getElementById("progressGauge");

  const tasks = goals.flatMap(g=>g.tasks);
  const done = tasks.filter(t=>t.done).length;

  const percent = tasks.length===0 ? 0 : Math.round(done/tasks.length*100);
  gauge.style.width = percent+"%";
  gauge.textContent = percent+"%";
}

/* -------------------------
  Calendar
------------------------- */
document.getElementById("calendarBtn").onclick = ()=>{
  renderCalendar();
  calendarModal.style.display="block";
};
document.getElementById("closeCalendar").onclick = ()=>{
  calendarModal.style.display="none";
};

function renderCalendar(){
  const cal = document.getElementById("calendar");
  cal.innerHTML = "";

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const first = new Date(y,m,1);
  const last = new Date(y,m+1,0);

  for(let i=0;i<first.getDay();i++){
    cal.appendChild(document.createElement("div"));
  }

  for(let d=1; d<=last.getDate(); d++){
    const cell = document.createElement("div");
    cell.className="calendar-day";
    cell.innerHTML=`<strong>${d}</strong>`;

    const dateStr = `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

    goals.forEach(g=>{
      if(g.deadline===dateStr){
        const ev=document.createElement("div");
        ev.className="calendar-event";
        ev.textContent=g.title;
        cell.appendChild(ev);
      }
    });

    cal.appendChild(cell);
  }
}

/* -------------------------
  Summary
------------------------- */
document.getElementById("summaryBtn").onclick = ()=>{
  renderSummary();
  summaryModal.style.display="block";
};
document.getElementById("closeSummary").onclick = ()=>{
  summaryModal.style.display="none";
};

function renderSummary(){
  const todayList=document.getElementById("todayList");
  const weekList=document.getElementById("weekList");
  todayList.innerHTML="";
  weekList.innerHTML="";

  const now=new Date();
  const weekEnd=new Date();
  weekEnd.setDate(now.getDate()+7);

  goals.forEach(g=>{
    const d=new Date(g.deadline);
    if(isSameDay(d, now)) todayList.innerHTML += `<p>📌 ${g.title}</p>`;
    if(d>=now && d<=weekEnd) weekList.innerHTML += `<p>🗓 ${g.title} / ${g.deadline}</p>`;
  });
}
function isSameDay(a,b){
  return a.toDateString()===b.toDateString();
}
