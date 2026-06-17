import { createQuestion, findElementByAtomicNumber, getSearchPool, pickQuizElements } from "./elements.js";
import { renderAtomSvg } from "./atom-renderer.js";
import { compressImage } from "./image-utils.js";
import { completeSession, createSession, getSettings, listFeedback, listSubmissions, saveFeedback, saveSettings, saveSubmission } from "./firebase-service.js";

const ADMIN_PASSWORD = "hy3932662";
const ADMIN_SESSION_TIMEOUT_MS = 30 * 60 * 1000;
let adminLogoutTimer = null;
const FIELD_LABELS = { atomicNumber: "원소 번호", name: "이름", symbol: "기호", protons: "양성자 수", neutrons: "중성자 수", electrons: "전자 수" };
const state = { profile: null, sessionId: null, questions: [], currentIndex: 0, settings: { answerRevealEnabled: false, elementSearchEnabled: false }, submissions: [], feedback: [] };
const views = { start: document.querySelector("#studentStartView"), quiz: document.querySelector("#quizView"), results: document.querySelector("#resultsView"), search: document.querySelector("#searchView"), admin: document.querySelector("#adminView") };
const messageBox = document.querySelector("#messageBox");
document.querySelector("#adminOpenButton").addEventListener("click", () => { if (isAdminUnlocked()) { renderAdminDashboard(); return; } renderAdminLogin(); });
init();

async function init() { await refreshSettings(); renderStart(); }
function showView(name) { Object.values(views).forEach((view) => view.classList.remove("active-view")); views[name].classList.add("active-view"); }
function showMessage(message, isError = false) { messageBox.textContent = message; messageBox.classList.toggle("danger-text", isError); if (message) setTimeout(() => { if (messageBox.textContent === message) messageBox.textContent = ""; }, 4200); }
async function refreshSettings() { try { state.settings = await getSettings(); } catch (error) { showMessage(`설정 불러오기 실패: ${error.message}`, true); } }
function clean(value) { return String(value ?? "").trim(); }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]); }
function isAdminUnlocked() { const unlocked = localStorage.getItem("atomQuizAdminUnlocked") === "true"; const unlockedAt = Number(localStorage.getItem("atomQuizAdminUnlockedAt") || 0); if (!unlocked || !unlockedAt || Date.now() - unlockedAt > ADMIN_SESSION_TIMEOUT_MS) { logoutAdmin(); return false; } return true; }
function unlockAdmin() { localStorage.setItem("atomQuizAdminUnlocked", "true"); localStorage.setItem("atomQuizAdminUnlockedAt", String(Date.now())); scheduleAdminLogout(); }
function scheduleAdminLogout() { clearTimeout(adminLogoutTimer); adminLogoutTimer = setTimeout(logoutAdmin, ADMIN_SESSION_TIMEOUT_MS); }
function logoutAdmin() { clearTimeout(adminLogoutTimer); localStorage.removeItem("atomQuizAdminUnlocked"); localStorage.removeItem("atomQuizAdminUnlockedAt"); if (views.admin.classList.contains("active-view")) { renderAdminLogin(); showMessage("관리자 접속 시간이 지나 자동 로그아웃되었습니다.", true); } }

function renderStart() {
  views.start.innerHTML = `<section class="panel stack"><div><h2>학생 정보 입력</h2><p class="muted">학년, 반, 조, 번호, 이름을 입력한 뒤 시작하세요.</p></div><form id="startForm" class="stack"><div class="form-grid"><label>학년 <input name="gradeName" required placeholder="예: 1학년" /></label><label>반 <input name="className" required placeholder="예: 1반" /></label><label>조 <input name="teamName" required placeholder="예: 3조" /></label><label>번호 <input name="studentNumber" inputmode="numeric" required placeholder="예: 12" /></label><label>이름 <input name="studentName" required placeholder="예: 홍길동" /></label></div><div class="actions"><button type="submit">게임 시작</button>${state.settings.elementSearchEnabled ? `<button id="openSearchButton" class="secondary-button" type="button">원소 검색</button>` : ""}</div></form></section>`;
  views.start.querySelector("#startForm").addEventListener("submit", handleStart);
  views.start.querySelector("#openSearchButton")?.addEventListener("click", renderSearch);
  showView("start");
}

async function handleStart(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const profile = { gradeName: clean(form.get("gradeName")), className: clean(form.get("className")), teamName: clean(form.get("teamName")), studentNumber: clean(form.get("studentNumber")), studentName: clean(form.get("studentName")) };
  if (Object.values(profile).some((value) => !value)) return showMessage("학생 정보를 모두 입력해 주세요.", true);
  event.submitter.disabled = true;
  try { state.profile = profile; state.sessionId = await createSession(profile); state.questions = pickQuizElements(3).map(createQuestion); state.currentIndex = 0; renderQuiz(); }
  catch (error) { showMessage(`시작 실패: ${error.message}`, true); }
  finally { event.submitter.disabled = false; }
}

function renderQuiz() {
  const question = state.questions[state.currentIndex];
  views.quiz.innerHTML = `<section class="panel stack"><div><p class="quiz-status">${state.currentIndex + 1} / ${state.questions.length} 문제</p><h2>제시된 정보를 보고 원자 모형을 그려보세요</h2></div><form id="quizForm" class="stack">${renderQuestionTable(question.element, question.blankFields)}<label>직접 그린 원자 모형 사진 <input id="imageInput" name="image" type="file" accept="image/*" required /></label><img id="imagePreview" class="preview-image" alt="" hidden /><div class="actions"><button type="submit">제출하고 다음으로</button></div></form></section>`;
  views.quiz.querySelector("#imageInput").addEventListener("change", previewImage);
  views.quiz.querySelector("#quizForm").addEventListener("submit", handleQuestionSubmit);
  showView("quiz");
}

function renderQuestionTable(element, blankFields) { return `<div class="table-wrap"><table><thead><tr><th>항목</th><th>정보</th></tr></thead><tbody>${["atomicNumber", "name", "symbol", "protons", "neutrons", "electrons"].map((field) => `<tr><th>${FIELD_LABELS[field]}</th><td>${blankFields.includes(field) ? `<input name="${field}" required aria-label="${FIELD_LABELS[field]} 입력" />` : escapeHtml(element[field])}</td></tr>`).join("")}</tbody></table></div>`; }
function previewImage(event) { const file = event.currentTarget.files[0]; const preview = views.quiz.querySelector("#imagePreview"); if (!file) return; preview.src = URL.createObjectURL(file); preview.hidden = false; }
async function handleQuestionSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const question = state.questions[state.currentIndex];
  const studentAnswers = {};
  question.blankFields.forEach((field) => { studentAnswers[field] = clean(form.get(field)); });
  if (Object.values(studentAnswers).some((value) => !value)) return showMessage("빈칸을 모두 입력해 주세요.", true);
  event.submitter.disabled = true; event.submitter.textContent = "저장 중...";
  try {
    const imageData = await compressImage(form.get("image"));
    await saveSubmission({ sessionId: state.sessionId, ...state.profile, questionIndex: state.currentIndex + 1, elementNumber: question.element.atomicNumber, blankFields: question.blankFields, studentAnswers, imageData });
    state.currentIndex += 1;
    if (state.currentIndex < state.questions.length) renderQuiz(); else { await completeSession(state.sessionId); showMessage("3문제 제출이 완료되었습니다."); await renderResults("team"); }
  } catch (error) { showMessage(error.message, true); }
  finally { event.submitter.disabled = false; event.submitter.textContent = "제출하고 다음으로"; }
}

async function refreshClassData() { try { [state.submissions, state.feedback] = await Promise.all([listSubmissions(), listFeedback()]); } catch (error) { showMessage(`결과 불러오기 실패: ${error.message}`, true); } }
async function renderResults(scope = "team") {
  await refreshSettings(); await refreshClassData();
  const visible = scope === "team" ? state.submissions.filter((item) => item.className === state.profile?.className && item.teamName === state.profile?.teamName) : state.submissions;
  views.results.innerHTML = `<section class="panel stack"><div><h2>${scope === "team" ? "우리 조 결과" : "전체 조 결과"}</h2><p class="muted">친구의 원자 모형을 보고 이름이 보이는 피드백을 남겨보세요.</p></div><div class="actions"><button id="teamResultsButton" class="secondary-button" type="button">우리 조 결과</button><button id="allResultsButton" class="secondary-button" type="button">전체 조 결과</button>${state.settings.elementSearchEnabled ? `<button id="searchFromResultsButton" class="secondary-button" type="button">원소 검색</button>` : ""}</div><div class="result-grid">${visible.length ? visible.map((item) => renderSubmissionCard(item, false)).join("") : `<p class="muted">아직 제출된 결과가 없습니다.</p>`}</div></section>`;
  views.results.querySelector("#teamResultsButton").addEventListener("click", () => renderResults("team"));
  views.results.querySelector("#allResultsButton").addEventListener("click", () => renderResults("all"));
  views.results.querySelector("#searchFromResultsButton")?.addEventListener("click", renderSearch);
  views.results.querySelectorAll("[data-feedback-form]").forEach((form) => form.addEventListener("submit", handleFeedbackSubmit));
  showView("results");
}

function renderSubmissionCard(submission, adminMode) {
  const element = findElementByAtomicNumber(submission.elementNumber);
  const feedbackItems = state.feedback.filter((item) => item.submissionId === submission.id);
  const reveal = adminMode || state.settings.answerRevealEnabled;
  return `<article class="card stack"><div class="submission-meta"><span class="pill">${escapeHtml(submission.gradeName || "학년 미입력")}</span><span class="pill">${escapeHtml(submission.className)}</span><span class="pill">${escapeHtml(submission.teamName)}</span><span class="pill">${escapeHtml(submission.studentNumber)}번 ${escapeHtml(submission.studentName)}</span><span class="pill">${submission.questionIndex}번 문제</span></div><img class="submission-image" src="${submission.imageData}" alt="${escapeHtml(submission.studentName)} 학생 제출 이미지" />${renderAnswerSummary(submission, element)}${reveal ? renderCorrectAnswer(element) : `<p class="muted">정답 확인은 선생님이 열어주면 볼 수 있습니다.</p>`}<div><h3>피드백</h3><div class="feedback-list">${feedbackItems.length ? feedbackItems.map((item) => `<div class="feedback-item"><strong>${escapeHtml(item.fromStudentName)}</strong>: ${escapeHtml(item.message)}</div>`).join("") : `<p class="muted">아직 피드백이 없습니다.</p>`}</div>${state.profile && !adminMode ? `<form data-feedback-form="${submission.id}" class="stack"><textarea name="message" required placeholder="친구에게 도움이 되는 피드백을 적어주세요."></textarea><button type="submit">피드백 등록</button></form>` : ""}</div></article>`;
}
function renderAnswerSummary(submission, element) { return `<div class="table-wrap"><table><tbody><tr><th>출제 원소</th><td>${element ? `${element.name} (${element.symbol})` : submission.elementNumber}</td></tr><tr><th>학생 입력</th><td>${Object.entries(submission.studentAnswers || {}).map(([key, value]) => `${FIELD_LABELS[key]}: ${escapeHtml(value)}`).join("<br>")}</td></tr></tbody></table></div>`; }
function renderCorrectAnswer(element) { return `<div class="stack"><h3>정답 원자 모형</h3>${renderAtomSvg(element)}<div class="table-wrap"><table><tbody><tr><th>원소 번호</th><td>${element.atomicNumber}</td></tr><tr><th>이름(기호)</th><td>${element.name} (${element.symbol})</td></tr><tr><th>양성자 수</th><td>${element.protons}</td></tr><tr><th>중성자 수</th><td>${element.neutrons}</td></tr><tr><th>전자 수</th><td>${element.electrons}</td></tr></tbody></table></div></div>`; }

async function handleFeedbackSubmit(event) {
  event.preventDefault();
  const message = clean(new FormData(event.currentTarget).get("message"));
  if (!message) return;
  event.submitter.disabled = true;
  try { await saveFeedback({ submissionId: event.currentTarget.dataset.feedbackForm, fromGradeName: state.profile.gradeName, fromClassName: state.profile.className, fromTeamName: state.profile.teamName, fromStudentNumber: state.profile.studentNumber, fromStudentName: state.profile.studentName, message }); showMessage("피드백을 등록했습니다."); await renderResults("all"); }
  catch (error) { showMessage(`피드백 저장 실패: ${error.message}`, true); }
  finally { event.submitter.disabled = false; }
}

function renderSearch() {
  if (!state.settings.elementSearchEnabled) return showMessage("원소 검색은 선생님이 열어주면 사용할 수 있습니다.", true);
  views.search.innerHTML = `<section class="panel stack"><div><h2>원소 검색</h2><p class="muted">1번부터 20번까지 원소 번호, 이름, 기호로 검색할 수 있습니다.</p></div><label>검색어 <input id="elementSearchInput" placeholder="예: 산소, O, 8" /></label><div id="searchResults" class="result-grid"></div><div class="actions"><button id="backToStartButton" class="secondary-button" type="button">돌아가기</button></div></section>`;
  const input = views.search.querySelector("#elementSearchInput"); input.addEventListener("input", () => renderSearchResults(input.value));
  views.search.querySelector("#backToStartButton").addEventListener("click", () => state.profile ? renderResults("team") : renderStart());
  renderSearchResults(""); showView("search");
}
function renderSearchResults(keyword) { const normalized = clean(keyword).toLowerCase(); const results = getSearchPool().filter((element) => !normalized || String(element.atomicNumber).includes(normalized) || element.name.toLowerCase().includes(normalized) || element.symbol.toLowerCase().includes(normalized)); views.search.querySelector("#searchResults").innerHTML = results.map((element) => `<article class="card stack">${renderCorrectAnswer(element)}</article>`).join(""); }

function renderAdminLogin() { views.admin.innerHTML = `<section class="panel stack"><h2>관리자 접속</h2><form id="adminLoginForm" class="stack"><label>비밀번호 <input name="password" type="password" required /></label><div class="actions"><button type="submit">접속</button><button id="cancelAdminButton" class="secondary-button" type="button">취소</button></div></form></section>`; views.admin.querySelector("#adminLoginForm").addEventListener("submit", handleAdminLogin); views.admin.querySelector("#cancelAdminButton").addEventListener("click", renderStart); showView("admin"); }
async function handleAdminLogin(event) { event.preventDefault(); if (new FormData(event.currentTarget).get("password") !== ADMIN_PASSWORD) return showMessage("관리자 비밀번호가 맞지 않습니다.", true); unlockAdmin(); await renderAdminDashboard(); }
async function renderAdminDashboard() {
  if (!isAdminUnlocked()) return;
  scheduleAdminLogout();
  await refreshSettings(); await refreshClassData();
  views.admin.innerHTML = `<section class="panel stack"><div><h2>관리자 화면</h2><p class="muted">정답 확인과 원소 검색을 수업 단계에 맞게 열고 닫을 수 있습니다.</p></div><div class="grid"><label class="switch-row">정답 확인 허용 <input id="answerToggle" type="checkbox" ${state.settings.answerRevealEnabled ? "checked" : ""} /></label><label class="switch-row">원소 검색 허용 <input id="searchToggle" type="checkbox" ${state.settings.elementSearchEnabled ? "checked" : ""} /></label></div><div class="form-grid"><label>학년/반/조/학생 검색 <input id="adminFilter" placeholder="예: 1학년, 1반, 3조, 홍길동" /></label></div><div id="adminSubmissionList" class="result-grid"></div></section>`;
  views.admin.querySelector("#answerToggle").addEventListener("change", handleSettingChange);
  views.admin.querySelector("#searchToggle").addEventListener("change", handleSettingChange);
  views.admin.querySelector("#adminFilter").addEventListener("input", renderAdminSubmissionList);
  renderAdminSubmissionList(); showView("admin");
}
async function handleSettingChange() { const nextSettings = { answerRevealEnabled: views.admin.querySelector("#answerToggle").checked, elementSearchEnabled: views.admin.querySelector("#searchToggle").checked }; try { await saveSettings(nextSettings); state.settings = nextSettings; scheduleAdminLogout(); showMessage("관리자 설정을 저장했습니다."); } catch (error) { showMessage(`설정 저장 실패: ${error.message}`, true); } }
function renderAdminSubmissionList() { const keyword = clean(views.admin.querySelector("#adminFilter")?.value).toLowerCase(); const submissions = state.submissions.filter((item) => !keyword || `${item.gradeName || ""} ${item.className} ${item.teamName} ${item.studentNumber} ${item.studentName}`.toLowerCase().includes(keyword)); views.admin.querySelector("#adminSubmissionList").innerHTML = submissions.length ? submissions.map((item) => renderSubmissionCard(item, true)).join("") : `<p class="muted">조건에 맞는 제출물이 없습니다.</p>`; }
