let goals = JSON.parse(localStorage.getItem("goals")||"[]");
let currentYear, currentMonth;
let holidayData={};

// 保存
function save() {
  localStorage.setItem("goals", JSON.stringify(goals));
}

// 祝日データ取得
async function loadHolidayData(year){
  try{
    const res = await fetch(`https://holidays-jp.github.io/api/v1/${year}/date.json`);
    holidayData = await res.json();
  }catch{
    holidayData={};
  }
}

// 詳細タスク自動生成
function generateTasks(title){
  title = title.toLowerCase();
  if(title.includes("ダイエット")) return [
    { text: "毎朝の体重記録", done:false, deadline:"" },
    { text: "運動（ジョギング30分）", done:false, deadline:"" },
    { text: "食事管理（日記記入）", done:false, deadline:"" },
    { text: "水を2L飲む", done:false, deadline:"" },
    { text: "夜は21時までに就寝", done:false, deadline:"" }
  ];
  if(title.includes("英語")) return [
    { text: "単語10個暗記", done:false, deadline:"" },
    { text: "リスニング30分", done:false, deadline:"" },
    { text: "リーディング1章", done:false, deadline:"" },
    { text: "スピーキング練習5分", done:false, deadline:"" },
    { text: "前日の復習", done:false, deadline:"" }
  ];
  if(title.includes("プログラミング")||title.includes("勉強")) return [
    { text: "学習計画を立てる", done:false, deadline:"" },
    { text: "参考資料を読む", done:false, deadline:"" },
    { text: "コードを書いて実践", done:false, deadline:"" },
    { text: "課題を整理", done:false, deadline:"" },
    { text: "進捗を振り返る", done:false, deadline:"" }
  ];
  return [
    { text: "目標を紙に書き出す", done:false, deadline:"" },
    { text: "情報収集", done:false, deadline:"" },
    { text: "最初の一歩を決める", done:false, deadline:"" },
    { text: "行動する", done:false, deadline:"" },
    { text: "結果を振り返る", done:false, deadline:"" }
  ];
}

// 通知表示（目標カラー・アイコン・完了ボタン・アニメーション）
function showNotification(goal, task, daysLeft){
  const area = document.getElementById("notificationArea");
  const note = document.createElement("div");
  note.className = "notification";
  note.style.background = goal.color;
  note.style.opacity = 0;           // 初期透明度
  note.style.transform = "translateY(-20px)"; // 初期位置上

  const span = document.createElement("span");
  if(daysLeft===0){
    span.textContent = `${goal.icon} ${goal.title} - "${task.text}"の期限は今日です！`;
  } else {
    span.textContent = `${goal.icon} ${goal.title} - "${task.text}"の期限はあと${daysLeft}日`;
  }
  note.appendChild(span);

  const btn = document.createElement("button");
  btn.textContent = "完了";
  btn.onclick = () => {
    fadeOut(note);
  };
  note.appendChild(btn);

  area.appendChild(note);
  fadeIn(note);

  // 自動で5秒後に消える
  setTimeout(()=>{ fadeOut(note); },5000);
}

// フェードインアニメーション
function fadeIn(element){
  let op = 0;
  element.style.display = "flex";
  const timer = setInterval(()=>{
    if(op>=1){
      clearInterval(timer);
    }
    element.style.opacity = op;
    element.style.transform = `translateY(${20*(1-op)}px)`;
    op += 0.05;
  },16);
}

// フェードアウトアニメーション
function fadeOut(element){
  let op = 1;
  const timer = setInterval(()=>{
    if(op<=0){
      clearInterval(timer);
      element.remove();
    }
    element.style.opacity = op;
    element.style.transform = `translateY(${20*(1-op)}px)`;
    op -= 0.05;
  },16);
}

// タスク期限チェック（3日前と当日）
function checkTaskNotifications(){
  const today = new Date();
  goals.forEach(goal=>{
    goal.tasks.forEach(t=>{
      if(!t.deadline) return;
      const deadline = new Date(t.deadline);
      const diff = Math.ceil((deadline - today)/(1000*60*60*24));
      if(diff===3 || diff===0){
        showNotification(goal, t, diff);
      }
    });
  });
}

// 目標追加
addGoalBtn.onclick = () => {
  const title = goalInput.value.trim();
  const deadline = goalDeadline.value;
  const icon = goalIcon.value;
  if(!title || !deadline) return;
  const color = `hsl(${Math.random()*360},70%,60%)`;
  goals.push({
    id: Date.now(),
    title,
    icon,
    deadline,
    color,
    tasks: generateTasks(title),
    progress: 0
  });
  goalInput.value = "";
  goalDeadline.value = "";
  save();
  renderMonthCalendar();
  renderGoals();
  checkTaskNotifications();
};

// 一括削除
deleteAllBtn.onclick = () => {
  if(!confirm("すべて削除しますか？")) return;
  goals = [];
  save();
  renderMonthCalendar();
  renderGoals();
};

// 進捗更新
function updateProgress(goal){
  const total = goal.tasks.length;
  const done = goal.tasks.filter(t=>t.done).length;
  goal.progress = total?Math.round(done/total*100):0;
  save();
  renderMonthCalendar();
  renderGoals();
  checkTaskNotifications();
}

// 月間カレンダー描画
async function renderMonthCalendar(monthChange=0){
  const container = document.getElementById("monthCalendar");
  container.innerHTML = "";
  const now = new Date();
  if(monthChange!==0){
    const d = new Date(currentYear, currentMonth+monthChange, 1);
    currentYear = d.getFullYear();
    currentMonth = d.getMonth();
  } else {
    currentYear = now.getFullYear();
    currentMonth = now.getMonth();
  }

  await loadHolidayData(currentYear);

  const header = document.createElement("div");
  header.className = "header-controls";
  const prevBtn = document.createElement("button"); prevBtn.textContent="◀ 前月"; prevBtn.onclick = ()=>renderMonthCalendar(-1);
  const nextBtn = document.createElement("button"); nextBtn.textContent="次月 ▶"; nextBtn.onclick = ()=>renderMonthCalendar(1);
  const monthLabel = document.createElement("div"); monthLabel.className="month-label"; monthLabel.textContent=`${currentYear}年 ${currentMonth+1}月`;
  header.append(prevBtn, monthLabel, nextBtn);
  container.appendChild(header);

  const weekdayRow = document.createElement("div"); weekdayRow.className="weekday-labels";
  ["日","月","火","水","木","金","土"].forEach(d=>{
    const wd = document.createElement("div");
    wd.textContent = d;
    weekdayRow.appendChild(wd);
  });
  container.appendChild(weekdayRow);

  const grid = document.createElement("div"); grid.className="calendar-grid";
  const first = new Date(currentYear, currentMonth,1).getDay();
  const last = new Date(currentYear, currentMonth+1,0).getDate();

  for(let i=0;i<first;i++) grid.appendChild(document.createElement("div"));

  for(let d=1; d<=last; d++){
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    cell.innerHTML = `<strong>${d}</strong>`;
    const dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const dow = new Date(currentYear, currentMonth, d).getDay();
    if(dow===6) cell.style.background="rgba(100,150,255,0.3)";
    if(dow===0 || holidayData[dateStr]) cell.style.background="rgba(255,100,100,0.3)";
    if(holidayData[dateStr]){
      const hname = document.createElement("div");
      hname.className = "holiday-name";
      hname.textContent = holidayData[dateStr];
      cell.appendChild(hname);
    }

    goals.forEach(goal=>{
      goal.tasks.forEach(t=>{
        if(t.deadline===dateStr){
          const ev = document.createElement("div");
          ev.className = "calendar-task";
          ev.style.background = goal.color;
          ev.textContent = `${goal.icon} ${t.text}`;
          cell.appendChild(ev);
        }
      });
    });

    grid.appendChild(cell);
  }
  container.appendChild(grid);
}

// 目標カード描画
function renderGoals(){
  goalsContainer.innerHTML="";
  goals.forEach(goal=>{
    const card = document.createElement("div");
    card.className = "goal-card";

    const header = document.createElement("div");
    header.className = "goal-header";
    header.innerHTML = `<div class="goal-title" style="color:${goal.color}">${goal.icon} ${goal.title}</div>
                        <div class="goal-deadline">目標期限: ${goal.deadline}</div>`;

    const taskBox = document.createElement("div");
    taskBox.className = "task-box";

    const ul = document.createElement("ul");
    ul.className = "task-list";

    goal.tasks.forEach((t,i)=>{
      const li = document.createElement("li");
      li.className = "task-item";

      const chk = document.createElement("input");
      chk.type = "checkbox";
      chk.checked = t.done;
      chk.onchange = ()=>{ t.done = chk.checked; updateProgress(goal); }

      const span = document.createElement("span");
      span.textContent = t.text;

      const date = document.createElement("input");
      date.type = "date";
      date.value = t.deadline;
      date.onchange = ()=>{
        t.deadline = date.value;
        save();
        renderMonthCalendar();
        renderGoals();
        checkTaskNotifications();
      }

      const del = document.createElement("button");
      del.textContent="削除";
      del.onclick = ()=>{ goal.tasks.splice(i,1); updateProgress(goal); }

      li.append(chk, span, date, del);
      ul.appendChild(li);
    });

    const addBtn = document.createElement("button");
    addBtn.className="add-task-btn";
    addBtn.textContent="＋ タスクを追加";
    addBtn.onclick = ()=>{
      const text = prompt("タスク名を入力");
      if(!text) return;
      goal.tasks.push({text, done:false, deadline:""});
      updateProgress(goal);
    }

    const progressText = document.createElement("div");
    progressText.className="progress-text";
    progressText.textContent = `進捗 ${goal.progress}%`;

    const bar = document.createElement("div");
    bar.className="progress-bar";
    const fill = document.createElement("div");
    fill.className="progress-fill";
    fill.style.width = goal.progress + "%";
    bar.appendChild(fill);

    taskBox.append(ul, addBtn);
    card.appendChild(header);
    card.appendChild(taskBox);
    card.append(progressText, bar);
    goalsContainer.appendChild(card);
  });
}

// 初期描画
renderMonthCalendar();
renderGoals();
checkTaskNotifications();
