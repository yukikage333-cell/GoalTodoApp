let goals = JSON.parse(localStorage.getItem("goals") || "[]");

function save() {
  localStorage.setItem("goals", JSON.stringify(goals));
}

/* --------------------------------
   自動タスク生成（以前のまま）
-------------------------------- */
function generateTasks(title) {
  title = title.toLowerCase();

  if (title.includes("ダイエット"))
    return ["体重を計る","食事を記録","運動する","水を飲む","間食を減らす"]
      .map(t => ({ text: t, done: false, deadline: "" }));

  if (title.includes("英語"))
    return ["単語10個","リスニング10分","日記を書く","シャドーイング","アプリ学習"]
      .map(t => ({ text: t, done: false, deadline: "" }));

  return ["計画を立てる","調べる","最初の一歩","進捗を見る","次の計画"]
      .map(t => ({ text: t, done: false, deadline: "" }));
}

/* --------------------------------
   ランダムカラー
-------------------------------- */
function getRandomColor() {
  const colors = [
    "#ff7675", "#74b9ff", "#55efc4",
    "#ffeaa7", "#a29bfe", "#fab1a0",
    "#81ecec", "#fd79a8", "#6c5ce7"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/* --------------------------------
   初期表示
-------------------------------- */
document.addEventListener("DOMContentLoaded", renderGoals);

/* --------------------------------
   目標追加
-------------------------------- */
document.getElementById("addGoalBtn").addEventListener("click", () => {
  const title = goalInput.value.trim();
  const deadline = goalDeadline.value;
  if (!title || !deadline) return;

  goals.push({
    id: Date.now(),
    title,
    deadline,
    tasks: generateTasks(title),
    progress: 0,
    color: getRandomColor()   // ★ 色追加
  });

  goalInput.value = "";
  goalDeadline.value = "";

  save();
  renderGoals();
});

/* --------------------------------
   一括削除
-------------------------------- */
document.getElementById("deleteAllBtn").addEventListener("click", () => {
  if (!confirm("すべて削除しますか？")) return;
  goals = [];
  save();
  renderGoals();
});

/* --------------------------------
   目標表示
-------------------------------- */
function renderGoals() {
  const box = document.getElementById("goalsContainer");
  box.innerHTML = "";

  goals.forEach(goal => {
    const card = document.createElement("div");
    card.className = "goal-card";

    const accent = document.createElement("div");
    accent.className = "goal-accent";
    accent.style.background = goal.color;

    const header = document.createElement("div");
    header.className = "goal-header";
    header.innerHTML = `
      <span class="goal-title">${goal.title}</span>
      <span class="goal-deadline">${goal.deadline}</span>
    `;

    /* タスク一覧 */
    const ul = document.createElement("ul");
    ul.className = "task-list";

    goal.tasks.forEach((task, idx) => {
      const li = document.createElement("li");
      li.className = "task-item";

      const chk = document.createElement("input");
      chk.type = "checkbox";
      chk.checked = task.done;
      chk.onchange = () => {
        task.done = chk.checked;
        updateGoalProgress(goal);
      };

      const text = document.createElement("span");
      text.textContent = task.text;

      const date = document.createElement("input");
      date.type = "date";
      date.className = "task-date";
      date.value = task.deadline;
      date.onchange = () => {
        task.deadline = date.value;
        save();
      };

      const del = document.createElement("button");
      del.textContent = "削除";
      del.onclick = () => {
        goal.tasks.splice(idx, 1);
        updateGoalProgress(goal);
      };

      li.append(chk, text, date, del);
      ul.appendChild(li);
    });

    /* 進捗バー */
    const progressWrap = document.createElement("div");
    progressWrap.className = "progress-wrap";

    const progressText = document.createElement("div");
    progressText.className = "progress-text";
    progressText.textContent = `${goal.progress}% 完了`;

    const bar = document.createElement("div");
    bar.className = "progress-bar";

    const fill = document.createElement("div");
    fill.className = "progress-fill";
    fill.style.width = goal.progress + "%";

    bar.appendChild(fill);
    progressWrap.append(progressText, bar);

    card.append(accent, header, ul, progressWrap);
    box.appendChild(card);
  });
}

/* --------------------------------
   進捗計算
-------------------------------- */
function updateGoalProgress(goal) {
  const total = goal.tasks.length;
  const done = goal.tasks.filter(t => t.done).length;

  goal.progress = total === 0 ? 0 : Math.round((done / total) * 100);
  save();
  renderGoals();
}
