/* 完成形 ToDo — ダーク版
 - 目標追加で自動5タスク生成
 - 目標/タスクに期限（Date）を持てる
 - 達成率表示（バー＋％）
 - リストごとに色分け
 - localStorage に保存
*/

/* --- elements --- */
const goalInput = document.getElementById("goalInput");
const goalDeadline = document.getElementById("goalDeadline");
const addGoalBtn = document.getElementById("addGoalBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const goalsContainer = document.getElementById("goalsContainer");

const STORAGE_KEY = "todo_complete_v1";

/* --- app state --- */
let goals = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let colorIndex = goals.length || 0; // continue colors if existing

/* --- palette for goal accent (5 colors) --- */
const PALETTE = ["#ff5252","#ff9800","#00e676","#40c4ff","#e040fb"];

/* --- helpers --- */
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

/* very small AI-like generator (offline heuristics) */
function generateTasksByTitle(title) {
  const t = title.toLowerCase();
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
  // default generic
  return [
    "情報収集をする",
    "環境を整える",
    "毎日少し進める",
    "進捗を記録する",
    "週に1回振り返る"
  ];
}

/* --- render --- */
function render() {
  goalsContainer.innerHTML = "";

  goals.forEach((goal, gi) => {
    // wrapper card
    const card = document.createElement("div");
    card.className = "goal-card";

    // accent stripe
    const accent = document.createElement("div");
    accent.className = "goal-accent";
    accent.style.background = PALETTE[goal.color % PALETTE.length];
    card.appendChild(accent);

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

    // progress bar
    const progressWrap = document.createElement("div");
    progressWrap.className = "progress-wrap";
    const bar = document.createElement("div");
    bar.className = "progress-bar";
    const fill = document.createElement("div");
    fill.className = "progress-fill";
    bar.appendChild(fill);
    progressWrap.appendChild(bar);
    card.appendChild(progressWrap);

    // task list
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
        task.done = cb.checked;
        save();
        render();
      });

      // text
      const span = document.createElement("div");
      span.className = "task-text";
      span.textContent = task.text;

      // deadline (editable)
      const td = document.createElement("input");
      td.type = "date";
      td.className = "task-deadline";
      td.value = task.deadline || "";

      td.addEventListener("change", () => {
        task.deadline = td.value || null;
        save();
        render();
      });

      // delete
      const del = document.createElement("button");
      del.className = "btn-delete";
      del.textContent = "削除";
      del.addEventListener("click", () => {
        goal.tasks.splice(ti, 1);
        save();
        render();
      });

      li.appendChild(cb);
      li.appendChild(span);
      li.appendChild(td);
      li.appendChild(del);

      if (task.done) doneCount++;
      ul.appendChild(li);
    });

    // fill progress
    const total = Math.max(goal.tasks.length, 1);
    const percent = Math.round((doneCount / total) * 100);
    fill.style.width = `${percent}%`;
    pct.textContent = `達成率：${percent}%`;

    card.appendChild(ul);

    // controls row: add task button + set task manually
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
    newTaskInput.style.background = "#07101a";
    newTaskInput.style.color = "#e6eef8";

    const addTaskBtn = document.createElement("button");
    addTaskBtn.textContent = "＋ タスク";
    addTaskBtn.className = "icon-btn";
    addTaskBtn.style.background = "linear-gradient(90deg,#33d69f,#2bb6ff)";
    addTaskBtn.style.color = "#001217";
    addTaskBtn.addEventListener("click", () => {
      const v = newTaskInput.value.trim();
      if (!v) return;
      goal.tasks.push({ text: v, done: false, deadline: null });
      newTaskInput.value = "";
      save();
      render();
    });

    // append controls
    controls.appendChild(newTaskInput);
    controls.appendChild(addTaskBtn);

    card.appendChild(controls);

    // push to container
    goalsContainer.appendChild(card);
  });
}

/* --- add goal handler --- */
addGoalBtn.addEventListener("click", () => {
  const title = goalInput.value.trim();
  const dl = goalDeadline.value;

  if (!title || !dl) {
    alert("目標名と期限を入力してください（期限は必須です）");
    return;
  }

  const tasks = generateTasksByTitle(title).map(t => ({ text: t, done: false, deadline: null }));

  const goal = {
    id: Date.now(),
    title,
    deadline: dl,
    color: colorIndex % PALETTE.length,
    tasks
  };

  colorIndex++;
  goals.push(goal);
  save();
  render();

  goalInput.value = "";
  goalDeadline.value = "";
});

/* clear all */
clearAllBtn.addEventListener("click", () => {
  if (!confirm("本当にすべてのデータを消しますか？")) return;
  goals = [];
  colorIndex = 0;
  save();
  render();
});

/* initial render */
render();
