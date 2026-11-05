/*
  Подключение Google Sheets:
  1. Создайте таблицу с колонками: question, option1, option2, option3, option4, answer, category.
  2. Откройте доступ "Anyone with the link / Viewer".
  3. Опубликуйте таблицу: Файл → Поделиться → Опубликовать в интернете → CSV.
  4. Вставьте ссылку в GOOGLE_SHEET_CSV_URL ниже.
  answer — номер правильного варианта от 1 до 4.
*/
const GOOGLE_SHEET_CSV_URL = "";

const demoQuestions = [
  { question: "Какой тип данных хранит целое число в C#?", options: ["string", "int", "bool", "double"], answer: 2, category: "БАЗОВЫЕ ТИПЫ" },
  { question: "Как объявить константу в C#?", options: ["static", "readonly", "const", "fixed"], answer: 3, category: "СИНТАКСИС" },
  { question: "Какое ключевое слово используется для создания экземпляра класса?", options: ["class", "new", "this", "create"], answer: 2, category: "ООП" },
  { question: "Какая коллекция не допускает дубликатов?", options: ["List<T>", "Queue<T>", "HashSet<T>", "Array"], answer: 3, category: "КОЛЛЕКЦИИ" },
  { question: "Что выведет Console.WriteLine(2 + 2)?", options: ["22", "4", "Ошибка компиляции", "null"], answer: 2, category: "БАЗОВЫЕ ТИПЫ" },
  { question: "Какой модификатор делает член доступным только внутри класса?", options: ["public", "protected", "internal", "private"], answer: 4, category: "ООП" },
  { question: "Какой оператор используется для проверки равенства?", options: ["=", "==", "===", "equals"], answer: 2, category: "СИНТАКСИС" },
  { question: "Как обозначается метод, который может иметь несколько реализаций?", options: ["overload", "override", "virtual", "Все перечисленные"], answer: 4, category: "ООП" },
  { question: "Что делает оператор ??", options: ["Сравнивает строки", "Возвращает левое значение, если оно не null", "Создаёт объект", "Объединяет массивы"], answer: 2, category: "СИНТАКСИС" },
  { question: "Какой цикл гарантированно выполнится хотя бы один раз?", options: ["for", "while", "do...while", "foreach"], answer: 3, category: "УПРАВЛЕНИЕ ПОТОКОМ" }
];

const state = { questions: demoQuestions, current: 0, selected: null, correct: 0 };
const $ = (id) => document.getElementById(id);
const screens = { intro: $("introScreen"), quiz: $("quizScreen"), result: $("resultScreen") };

function parseCsv(text) {
  const rows = []; let row = []; let cell = ""; let quoted = false;
  for (let i = 0; i < text.length; i++) { const char = text[i]; const next = text[i + 1];
    if (char === '"' && quoted && next === '"') { cell += '"'; i++; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(cell.trim()); cell = ""; }
    else if ((char === '\n' || char === '\r') && !quoted) { if (char === '\r' && next === '\n') i++; row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = ""; }
    else cell += char;
  }
  if (cell || row.length) { row.push(cell.trim()); rows.push(row); }
  return rows;
}

function mapSheetRows(text) {
  const rows = parseCsv(text); if (rows.length < 2) throw new Error("В таблице нет строк");
  const headers = rows[0].map((h) => h.toLowerCase().replace(/\s+/g, ""));
  const get = (r, name) => r[headers.indexOf(name)] || "";
  return rows.slice(1).map((r) => ({ question: get(r, "question"), options: [1,2,3,4].map((n) => get(r, `option${n}`)), answer: Number(get(r, "answer")), category: get(r, "category") || "ВОПРОС" })).filter((q) => q.question && q.options.some(Boolean) && q.answer >= 1);
}

async function loadQuestions() {
  const sheetUrl = new URLSearchParams(location.search).get("sheet") || GOOGLE_SHEET_CSV_URL;
  if (!sheetUrl) return;
  try { const response = await fetch(sheetUrl); if (!response.ok) throw new Error(); const loaded = mapSheetRows(await response.text()); if (loaded.length) { state.questions = loaded; $("sourceBadge").innerHTML = '<span class="status-dot"></span> Google Sheets'; } }
  catch { showToast("Не удалось загрузить Google Sheets — использован демо-набор"); }
}

function showScreen(name) { Object.values(screens).forEach((screen) => screen.classList.add("hidden")); screens[name].classList.remove("hidden"); window.scrollTo({ top: 0, behavior: "smooth" }); }
function renderQuestion() { const q = state.questions[state.current]; $("currentNumber").textContent = String(state.current + 1).padStart(2, "0"); $("totalNumber").textContent = state.questions.length; $("progressBar").style.width = `${(state.current / state.questions.length) * 100}%`; $("questionTag").textContent = q.category; $("questionText").textContent = q.question; $("answers").innerHTML = q.options.map((option, index) => `<button class="answer" data-index="${index + 1}"><span class="answer-letter">${String.fromCharCode(65 + index)}</span>${option}</button>`).join(""); $("nextButton").disabled = true; $("answerHint").textContent = "Выбери один вариант ответа"; document.querySelectorAll(".answer").forEach((button) => button.addEventListener("click", () => selectAnswer(button))); }
function selectAnswer(button) { state.selected = Number(button.dataset.index); document.querySelectorAll(".answer").forEach((item) => item.classList.remove("selected")); button.classList.add("selected"); $("nextButton").disabled = false; $("answerHint").textContent = "Ответ выбран"; }
function startQuiz() { state.current = 0; state.selected = null; state.correct = 0; renderQuestion(); showScreen("quiz"); }
function nextQuestion() { if (!state.selected) return; if (state.selected === state.questions[state.current].answer) state.correct++; state.current++; if (state.current < state.questions.length) { state.selected = null; renderQuestion(); } else showResult(); }
function showResult() { const percent = Math.round((state.correct / state.questions.length) * 100); $("scoreValue").textContent = `${percent}%`; $("correctCount").textContent = state.correct; $("resultTotal").textContent = state.questions.length; $("scoreRing").style.setProperty("--score", `${percent}%`); $("resultTitle").textContent = percent >= 80 ? "Отличный результат!" : percent >= 50 ? "Хорошая база!" : "Есть куда расти!"; $("resultLead").textContent = percent >= 80 ? "Ты уверенно ориентируешься в основах C# — так держать." : "Повтори темы, в которых были ошибки, и попробуй ещё раз."; showScreen("result"); }
function showToast(message) { const toast = $("toast"); toast.textContent = message; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 3500); }

$("questionCount").textContent = `${state.questions.length} вопросов`; $("startButton").addEventListener("click", startQuiz); $("nextButton").addEventListener("click", nextQuestion); $("restartButton").addEventListener("click", startQuiz); $("homeButton").addEventListener("click", () => showScreen("intro")); $("quitButton").addEventListener("click", () => showScreen("intro")); loadQuestions().then(() => { $("questionCount").textContent = `${state.questions.length} вопросов`; $("totalNumber").textContent = state.questions.length; });
