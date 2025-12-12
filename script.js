/* GoalTodoApp — complete script
   - goals structure (goal.tasks[])
   - auto task gen
   - motivation points + goal bonus
   - summary modal + calendar modal
   - notification (前日)
   - legacy quick tasks preserved (tasks array)
*/

/* -------------------------
   Storage keys & state
   -------------------------*/
   const STORAGE_GOALS = "goals_v1";
   const STORAGE_POINTS = "motivationPoints";
   const STORAGE_NOTIFIED = "notifiedTasks";
   
   let goals = JSON.parse(localStorage.getItem(STORAGE_GOALS) || "[]");
   let motivationPoints = Number(localStorage.getItem(STORAGE_POINTS) || 0);
   let notifiedTasks = JSON.parse(localStorage.getItem(STORAGE_NOTIFIED) || "[]"); // ["goalId_index"]
   
   /* DOM */
   const goalsContainer = document.getElementById("goalsContainer");
   const addGoalBtn = document.getElementById("addGoalBtn");
   const goalInput = document.getElementById("goalInput");
   const goalDeadline = document.getElementById("goalDeadline");
   const summaryBtn = document.getElementById("summaryBtn");
   const calendarBtn = document.getElementById("calendarBtn");
   const closeSummary = document.getElementById("closeSummary");
   const closeCalendar = document.getElementById("closeCalendar");
   const summaryModal = document.getElementById("summaryModal");
   const calendarModal = document.getElementById("calendarModal");
   const todayListEl = document.getElementById("todayList");
   const weekListEl = document.getElementById("weekList");
   const calendarEl = document.getElementById("calendar");
   const pointsValueEl = document.getElementById("pointsValue");
   const addTaskBtn = document.getElementById("addTaskBtn");
   const taskInput = document.getElementById("taskInput");
   const progressGauge = document.getElementById("progressGauge");
   
   const PALETTE = ["#ff5252","#ff9800","#00e676","#40c4ff","#e040fb"];
   let colorIndex = goals.length;
   
   /* -------------------------
      Helpers
      -------------------------*/
   function saveAll() {
     localStorage.setItem(STORAGE_GOALS, JSON.stringify(goals));
     localStorage.setItem(STORAGE_POINTS, String(motivationPoints));
     localStorage.setItem(STORAGE_NOTIFIED, JSON.stringify(notifiedTasks));
   }
   
   function updatePointsDisplay() {
     if (pointsValueEl) pointsValueEl.textContent = motivationPoints;
   }
   
   /* simple auto task generator */
   function generateTasksByTitle(title) {
     const t = (title || "").toLowerCase();
     if (t.includes("ダイエット") || t.includes("体重") || t.includes("運動")) {
       return [
         "毎日30分ウォーキング",
         "間食を控える",
         "体重を記録する",
         "水を1.5L以上飲む",
         "夜22時以降は食べない"
       ];
     }
     if (t.includes("プログラミング") || t.includes("コード") || t.includes("開発")) {
       return [
         "毎日30分コードを書く",
         "ドキュメントを読む",
         "小さな課題を1つ解く",
         "GitHubへ1回コミット",
         "今日学んだことをメモ"
       ];
     }
     if (t.includes("英語") || t.includes("english")) {
       return [
         "単語を10個覚える",
         "英語で短文を書く",
         "リスニングを10分",
         "英語動画を10分見る",
         "シャドーイングを3分"
       ];
     }
     return [
       "情報収集をする",
       "環境を整える",
       "毎日少し進める",
       "進捗を記録する",
       "週に1回振り返る"
     ];
   }
   
   /* -------------------------
      Render functions
      -------------------------*/
   function render() {
     goalsContainer.innerHTML = "";
     if (!goals || !Array.isArray(goals)) goals = [];
   
     goals.forEach((goal, gi) => {
       // ensure structure
       if (!goal.tasks) goal.tasks = [];
       if (typeof goal.pointsAwarded === "undefined") goal.pointsAwarded = false;
       if (!goal.id) goal.id = Date.now() + gi;
   
       // card
       const card = document.createElement("div");
       card.className = "goal-card";
   
       // accent
       const acc = document.createElement("div");
       acc.className = "goal-accent";
       acc.style.background = PALETTE[goal.color % PALETTE.length];
       card.appendChild(acc);
   
       // top
       const top = document.createElement("div");
       top.className = "goal-top";
       const titleWrap = document.createElement("div");
       const title = document.createElement("div");
       title.className = "goal-title";
       title.textContent = goal.title;
       titleWrap.appendChild(title);
       const meta = document.createElement("div");
       meta.className = "goal-meta";
       const dl = document.createElement("div");
       dl.textContent = `期限：${goal.deadline || "未設定"}`;
       const pct = document.createElement("div");
       pct.className = "goal-percent";
       meta.appendChild(dl);
       meta.appendChild(pct);
       top.appendChild(titleWrap);
       top.appendChild(meta);
       card.appendChild(top);
   
       // progress
       const progressWrap = document.createElement("div");
       progressWrap.className = "progress-wrap";
       const bar = document.createElement("div");
       bar.className = "progress-bar";
       const fill = document.createElement("div");
       fill.className = "progress-fill";
       bar.appendChild(fill);
       progressWrap.appendChild(bar);
       card.appendChild(progressWrap);
   
       // tasks
       const ul = document.createElement("ul");
       ul.className = "task-list";
   
       let doneCount = 0;
       goal.tasks.forEach((task, ti) => {
         const li = document.createElement("li");
         li.className = "task-item" + (task.done ? " done" : "");
   
         // checkbox
         const cb = document.createElement("input");
         cb.type = "checkbox";
         cb.checked = !!task.done;
         cb.addEventListener("change", () => {
           // add/sub points
           if (cb.checked && !task.done) {
             motivationPoints += 5;
           } else if (!cb.checked && task.done) {
             motivationPoints = Math.max(0, motivationPoints - 5);
           }
           task.done = cb.checked;
           saveAll();
           updatePointsDisplay();
           render();
         });
   
         // text
         const span = document.createElement("div");
         span.className = "task-text";
         span.textContent = task.text;
   
         // deadline
         const td = document.createElement("input");
         td.type = "date";
         td.className = "task-deadline";
         td.value = task.deadline || "";
         td.addEventListener("change", () => {
           task.deadline = td.value || null;
           saveAll();
           render();
         });
   
         // delete
         const del = document.createElement("button");
         del.className = "btn-delete";
         del.textContent = "削除";
         del.addEventListener("click", () => {
           goal.tasks.splice(ti, 1);
           saveAll();
           render();
         });
   
         li.appendChild(cb);
         li.appendChild(span);
         li.appendChild(td);
         li.appendChild(del);
   
         if (task.done) doneCount++;
         ul.appendChild(li);
       });
   
       // progress calc
       const total = Math.max(goal.tasks.length, 1);
       const percent = Math.round((doneCount / total) * 100);
       fill.style.width = `${percent}%`;
       pct.textContent = `達成率：${percent}%`;
   
       // D: goal bonus (once)
       if (!goal.pointsAwarded && percent === 100) {
         motivationPoints += 50;
         goal.pointsAwarded = true;
         saveAll();
         updatePointsDisplay();
       }
   
       // controls: add task manually
       const controls = document.createElement("div");
       controls.style.display = "flex";
       controls.style.gap = "8px";
       controls.style.marginTop = "10px";
   
       const newTaskInput = document.createElement("input");
       newTaskInput.type = "text";
       newTaskInput.placeholder = "手動でタスク追加";
       newTaskInput.style.flex = "1";
       newTaskInput.style.padding = "8px";
       newTaskInput.style.borderRadius = "8px";
       newTaskInput.style.border = "none";
       newTaskInput.style.background = "rgba(255,255,255,0.02)";
       newTaskInput.style.color = "var(--text)";
   
       const addTaskBtnLocal = document.createElement("button");
       addTaskBtnLocal.className = "small-cta";
       addTaskBtnLocal.textContent = "＋ タスク";
       addTaskBtnLocal.addEventListener("click", () => {
         const v = newTaskInput.value.trim();
         if (!v) return;
         goal.tasks.push({ text: v, done: false, deadline: null });
         newTaskInput.value = "";
         saveAll();
         render();
       });
   
       controls.appendChild(newTaskInput);
       controls.appendChild(addTaskBtnLocal);
   
       card.appendChild(ul);
       card.appendChild(controls);
   
       // append card
       goalsContainer.appendChild(card);
     });
   
     // overall progress (legacy)
     updateOverallProgress();
   }
   
   /* -------------------------
      add goal handler
      -------------------------*/
   addGoalBtn.addEventListener("click", () => {
     const title = (goalInput.value || "").trim();
     const dl = goalDeadline.value || null;
     if (!title) { alert("目標名を入力してください"); return; }
     // generate tasks
     const tasksGenerated = generateTasksByTitle(title).map(t => ({ text: t, done: false, deadline: null }));
   
     const goal = {
       id: Date.now(),
       title,
       deadline: dl,
       color: colorIndex % PALETTE.length,
       tasks: tasksGenerated,
       pointsAwarded: false
     };
   
     colorIndex++;
     goals.push(goal);
     saveAll();
     render();
   
     goalInput.value = "";
     goalDeadline.value = "";
   });
   
   /* -------------------------
      quick legacy tasks (keeps old behavior)
      -------------------------*/
   addTaskBtn.addEventListener("click", () => {
     const txt = (taskInput.value || "").trim();
     if (!txt) return;
     // put as inbox goal (quick)
     const inbox = goals.find(g => g.title === "__inbox");
     if (inbox) {
       inbox.tasks.push({ text: txt, done: false, deadline: null });
     } else {
       const g = { id: Date.now(), title: "__inbox", deadline: null, color: colorIndex % PALETTE.length, tasks: [{ text: txt, done: false, deadline: null }], pointsAwarded: false };
       colorIndex++;
       goals.unshift(g);
     }
     taskInput.value = "";
     saveAll();
     render();
   });
   
   /* -------------------------
      overall progress
      -------------------------*/
   function updateOverallProgress(){
     const allTasks = goals.flatMap(g => g.tasks || []);
     const total = allTasks.length;
     const done = allTasks.filter(t => t.done).length;
     const percent = total === 0 ? 0 : Math.round((done / total) * 100);
     if (progressGauge) {
       progressGauge.style.width = percent + "%";
       progressGauge.textContent = percent + "%";
     }
     // small bonus when everything done across goals (optional)
     if (percent === 100 && goals.length>0) {
       // prevent multiple awarding by scanning goals for pointsAwarded - already handled per-goal
     }
   }
   
   /* -------------------------
      E: Modal controls & renderers
      -------------------------*/
   calendarBtn.addEventListener("click", () => { renderCalendar(); calendarModal.style.display = "block"; });
   closeCalendar.addEventListener("click", () => { calendarModal.style.display = "none"; });
   
   summaryBtn.addEventListener("click", () => { renderSummary(); summaryModal.style.display = "block"; });
   closeSummary.addEventListener("click", () => { summaryModal.style.display = "none"; });
   
   // click outside to close
   window.addEventListener("click", (e) => {
     if (e.target === calendarModal) calendarModal.style.display = "none";
     if (e.target === summaryModal) summaryModal.style.display = "none";
   });
   
   function renderSummary(){
     const todayISO = new Date().toISOString().slice(0,10);
     const todayList = [];
     const weekList = [];
   
     const now = new Date();
     const weekEnd = new Date();
     weekEnd.setDate(now.getDate() + (7 - now.getDay())); // end of week
   
     goals.forEach(goal => {
       goal.tasks.forEach((task, ti) => {
         if (!task.deadline) return;
         const d = new Date(task.deadline);
         const iso = task.deadline;
         // today
         if (iso === todayISO && !task.done) {
           todayList.push({ goalTitle: goal.title, text: task.text, deadline: iso });
         }
         // this week
         if (d >= now && d <= weekEnd && !task.done) {
           weekList.push({ goalTitle: goal.title, text: task.text, deadline: iso });
         }
       });
     });
   
     todayListEl.innerHTML = "<h3>今日のタスク</h3>" + (todayList.length ? todayList.map(t=>`<p>🔹 <b>${t.goalTitle}</b>: ${t.text} <small>(${t.deadline})</small></p>`).join("") : "<p>なし</p>");
     weekListEl.innerHTML = "<h3>今週のタスク</h3>" + (weekList.length ? weekList.map(t=>`<p>🔸 <b>${t.goalTitle}</b>: ${t.text} <small>(${t.deadline})</small></p>`).join("") : "<p>なし</p>");
   }
   
   /* -------- renderCalendar (簡易) -------- */
   function renderCalendar(){
     calendarEl.innerHTML = "";
     const now = new Date();
     const year = now.getFullYear();
     const month = now.getMonth();
     const first = new Date(year, month, 1);
     const last = new Date(year, month + 1, 0);
     const numDays = last.getDate();
   
     for (let d=1; d<=numDays; d++){
       const dateStr = new Date(year, month, d).toISOString().slice(0,10);
       const dayEl = document.createElement("div");
       dayEl.className = "calendar-day";
       dayEl.innerHTML = `<div class="date-num">${d}</div>`;
   
       goals.forEach(goal=>{
         goal.tasks.forEach((task,ti)=>{
           if (task.deadline === dateStr) {
             const ev = document.createElement("div");
             ev.className = "calendar-event";
             ev.textContent = `${goal.title}: ${task.text}`;
             dayEl.appendChild(ev);
           }
         });
       });
   
       calendarEl.appendChild(dayEl);
     }
   }
   
   /* -------------------------
      F: Notification (締切前日通知)
      -------------------------*/
   if ("Notification" in window) {
     if (Notification.permission === "default") {
       Notification.requestPermission();
     }
   }
   
   function checkNotifications() {
     if (!("Notification" in window) || Notification.permission !== "granted") return;
   
     const today = new Date();
     goals.forEach((goal, gi) => {
       goal.tasks.forEach((task, ti) => {
         if (!task.deadline || task.done) return;
         const id = `${goal.id}_${ti}`;
         if (notifiedTasks.includes(id)) return; // already notified
   
         const d = new Date(task.deadline);
         const diffDays = (d.setHours(0,0,0,0) - new Date(today.getFullYear(),today.getMonth(),today.getDate()).getTime()) / 86400000;
   
         if (diffDays === 1) {
           new Notification("締切が近いタスクがあります", {
             body: `${goal.title} — ${task.text} (締切: ${task.deadline})`
           });
           notifiedTasks.push(id);
           saveAll();
         }
       });
     });
   }
   
   checkNotifications();
   setInterval(checkNotifications, 1000 * 60 * 60);
   
   /* -------------------------
      init
      -------------------------*/
   updatePointsDisplay();
   render();
   