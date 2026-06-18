# Student Profile Normalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 학년·반·조·번호 입력을 표준 단위 문자열로 저장하고 관리자 카드에 `1101홍길동` 형식의 식별자를 표시한다.

**Architecture:** `src/profile-utils.js`에 숫자 추출, 항목별 검증, 프로필 정규화, 관리자 카드 식별자 생성을 순수 함수로 구현한다. `src/app.js`는 세션 생성 전에 이 함수를 호출하고 기존·신규 데이터 표시 시 번호 단위를 중복하지 않도록 한다. `src/admin-card-list.js`는 동일한 식별자 함수를 재사용한다.

**Tech Stack:** 브라우저 ES 모듈, Node.js 내장 테스트 러너(`node --test`), Firebase/Firestore 기존 연동

---

## File Structure

- Create `src/profile-utils.js`: 학생 입력 정규화와 관리자 카드 식별자 생성 전담.
- Create `tests/profile-utils.test.js`: 정규화, 검증, 선행 0, 카드 식별자 회귀 테스트.
- Modify `src/app.js`: 시작 입력 정규화 적용 및 번호 표시 단위 중복 제거.
- Modify `src/admin-card-list.js`: 카드 주 표시를 식별 코드와 이름으로 변경.
- Modify `tests/admin-view-model.test.js`: 표준화된 `N번` 값에서도 번호순 배치가 유지되는지 검증.

### Task 1: 입력 정규화 순수 함수

**Files:**
- Create: `tests/profile-utils.test.js`
- Create: `src/profile-utils.js`

- [ ] **Step 1: 실패하는 정규화 테스트 작성**

```js
import test from "node:test";
import assert from "node:assert/strict";
import {normalizeStudentProfile} from "../src/profile-utils.js";

test("normalizes spacing, unit typos, and leading zeroes",()=>{
  assert.deepEqual(normalizeStudentProfile({
    gradeName:" 01 학녀 ",
    className:" 003 바 ",
    teamName:" 02 조오 ",
    studentNumber:" 004 번 ",
    studentName:" 홍길동 "
  }),{
    gradeName:"1학년",
    className:"3반",
    teamName:"2조",
    studentNumber:"4번",
    studentName:"홍길동"
  });
});
```

- [ ] **Step 2: 테스트가 기능 부재로 실패하는지 확인**

Run: `node --test tests/profile-utils.test.js`

Expected: FAIL because `../src/profile-utils.js` does not exist.

- [ ] **Step 3: 최소 정규화 구현 작성**

```js
function extractPositiveInteger(value,label){
  const match=String(value??"").match(/\d+/);
  const number=match?Number(match[0]):0;
  if(!Number.isSafeInteger(number)||number<1)throw new Error(`${label}을(를) 확인해 주세요.`);
  return number;
}

export function normalizeStudentProfile(profile){
  const grade=extractPositiveInteger(profile.gradeName,"학년");
  if(grade<1||grade>3)throw new Error("학년은 1학년, 2학년, 3학년만 입력할 수 있습니다.");
  const classNumber=extractPositiveInteger(profile.className,"반");
  const team=extractPositiveInteger(profile.teamName,"조");
  const studentNumber=extractPositiveInteger(profile.studentNumber,"번호");
  const studentName=String(profile.studentName??"").trim();
  if(!studentName)throw new Error("이름을 입력해 주세요.");
  return {gradeName:`${grade}학년`,className:`${classNumber}반`,teamName:`${team}조`,studentNumber:`${studentNumber}번`,studentName};
}
```

- [ ] **Step 4: 정규화 테스트 통과 확인**

Run: `node --test tests/profile-utils.test.js`

Expected: PASS 1 test.

- [ ] **Step 5: 유효성 검사 실패 테스트 추가**

```js
test("rejects missing numbers and grades outside one through three",()=>{
  const valid={gradeName:"1",className:"1",teamName:"1",studentNumber:"1",studentName:"홍길동"};
  assert.throws(()=>normalizeStudentProfile({...valid,gradeName:"4학년"}),/1학년, 2학년, 3학년/);
  assert.throws(()=>normalizeStudentProfile({...valid,className:"일반"}),/반/);
  assert.throws(()=>normalizeStudentProfile({...valid,teamName:"0조"}),/조/);
  assert.throws(()=>normalizeStudentProfile({...valid,studentNumber:"번호 없음"}),/번호/);
});
```

- [ ] **Step 6: 전체 프로필 유틸 테스트 통과 확인**

Run: `node --test tests/profile-utils.test.js`

Expected: PASS 2 tests.

- [ ] **Step 7: GitHub에 테스트와 구현을 커밋**

Commit message: `feat: 학생 정보 입력값 표준화`

### Task 2: 관리자 카드 식별자 생성

**Files:**
- Modify: `tests/profile-utils.test.js`
- Modify: `src/profile-utils.js`

- [ ] **Step 1: 실패하는 카드 식별자 테스트 작성**

```js
import {formatStudentCardLabel,normalizeStudentProfile} from "../src/profile-utils.js";

test("creates the administrator card identifier",()=>{
  assert.equal(formatStudentCardLabel({gradeName:"1학년",className:"1반",studentNumber:"1번",studentName:"홍길동"}),"1101홍길동");
  assert.equal(formatStudentCardLabel({gradeName:"2학년",className:"3반",studentNumber:"12번",studentName:"김철수"}),"2312김철수");
  assert.equal(formatStudentCardLabel({gradeName:"1",className:"10",studentNumber:"3",studentName:"이영희"}),"11003이영희");
});
```

- [ ] **Step 2: 함수 부재로 실패하는지 확인**

Run: `node --test tests/profile-utils.test.js`

Expected: FAIL because `formatStudentCardLabel` is not exported.

- [ ] **Step 3: 최소 식별자 구현 작성**

```js
function digits(value){
  return String(value??"").match(/\d+/)?.[0]||"";
}

export function formatStudentCardLabel(profile){
  const grade=digits(profile.gradeName);
  const classNumber=digits(profile.className);
  const studentNumber=digits(profile.studentNumber).padStart(2,"0");
  return `${grade}${classNumber}${studentNumber}${String(profile.studentName??"").trim()}`;
}
```

- [ ] **Step 4: 카드 식별자 테스트 통과 확인**

Run: `node --test tests/profile-utils.test.js`

Expected: PASS 3 tests.

- [ ] **Step 5: GitHub에 식별자 구현을 커밋**

Commit message: `feat: 관리자 카드 학생 식별자 생성`

### Task 3: 학생 시작 흐름에 표준화 적용

**Files:**
- Modify: `src/app.js`

- [ ] **Step 1: 정규화 함수를 앱에 연결**

`src/app.js` 상단에 다음 import를 추가한다.

```js
import { normalizeStudentProfile } from "./profile-utils.js";
```

`handleStart`에서 FormData로 만든 원시 입력을 `normalizeStudentProfile`에 전달하고 정규화 성공 후에만 버튼 비활성화와 `createSession`을 실행한다.

```js
async function handleStart(event){
  event.preventDefault();
  const data=new FormData(event.currentTarget);
  let profile;
  try{
    profile=normalizeStudentProfile(Object.fromEntries(["gradeName","className","teamName","studentNumber","studentName"].map(key=>[key,data.get(key)])));
  }catch(error){
    return showMessage(error.message,true);
  }
  event.submitter.disabled=true;
  try{
    state.profile=profile;
    state.sessionId=await createSession(profile);
    state.questions=pickQuizElements(3).map(createQuestion);
    state.currentIndex=0;
    history.pushState({quiz:true},"");
    state.quizHistoryActive=true;
    renderQuiz();
  }catch(error){
    showMessage(`시작 실패: ${error.message}`,true);
  }finally{
    event.submitter.disabled=false;
  }
}
```

- [ ] **Step 2: 번호 단위 중복 제거**

`src/app.js`에서 표준화된 `studentNumber` 뒤에 별도 `번`을 붙이는 세 위치를 변경한다.

```js
<span class="pill">${escapeHtml(submission.studentNumber)}</span>
```

```js
<strong>${escapeHtml(record.gradeName)} ${escapeHtml(record.className)} ${escapeHtml(record.teamName)} ${escapeHtml(record.studentNumber)} ${escapeHtml(record.studentName)}</strong>
```

```js
const label=`${record.gradeName} ${record.className} ${record.studentNumber} ${record.studentName}`;
```

기존 숫자만 저장된 데이터도 자연스럽게 보이도록 관리자 행을 만들 때는 숫자 추출 후 `번`을 붙이는 표시 함수를 `profile-utils.js`에 추가해 사용하는 방식을 우선한다.

```js
export function formatStudentNumber(value){
  const number=digits(value);
  return number?`${Number(number)}번`:"";
}
```

앱의 세 표시 위치에서는 `formatStudentNumber(...)`를 호출한다.

- [ ] **Step 3: 문법 검사 실행**

Run: `node --check src/app.js && node --check src/profile-utils.js`

Expected: both commands exit 0.

- [ ] **Step 4: 전체 테스트 실행**

Run: `node --test tests/*.test.js`

Expected: all tests pass.

- [ ] **Step 5: GitHub에 앱 연결 변경을 커밋**

Commit message: `feat: 학생 시작 시 입력값 정규화 적용`

### Task 4: 관리자 카드 표시 변경

**Files:**
- Modify: `src/admin-card-list.js`
- Modify: `tests/admin-view-model.test.js`

- [ ] **Step 1: 표준 번호 문자열 번호순 회귀 테스트 작성**

`tests/admin-view-model.test.js`의 fixture에서 학생 번호를 `10번`, `2번`, `1번`으로 변경하고 기존 번호순 테스트 기대값을 다음과 같이 변경한다.

```js
test("number layout sorts normalized student numbers numerically",()=>{
  assert.deepEqual(buildParticipationSections(records,"number")[0].records.map(item=>item.studentNumber),["2번","10번"]);
});
```

- [ ] **Step 2: 회귀 테스트 실행**

Run: `node --test tests/admin-view-model.test.js`

Expected: PASS; 기존 `numericValue`가 단위 포함 문자열에서도 숫자를 추출함을 확인한다.

- [ ] **Step 3: 관리자 카드 주 표시 변경**

`src/admin-card-list.js`에 import를 추가한다.

```js
import {formatStudentCardLabel} from "./profile-utils.js";
```

`createCard`의 이름 표시를 식별자로 변경한다.

```js
record.openButton.innerHTML=`<strong class="participant-card-name">${escapeHtml(formatStudentCardLabel(record)||record.studentName||"이름 미입력")}</strong><span>${escapeHtml(record.gradeName)} ${escapeHtml(record.className)}</span><span>${escapeHtml(record.studentNumber)} · ${escapeHtml(record.teamName)}</span><span>${escapeHtml(record.details)}</span>`;
```

`parseRow`은 기존 관리자 행의 `1번` 표기에서 숫자 부분을 추출하므로 신규·기존 데이터 모두 `formatStudentCardLabel`에서 처리한다.

- [ ] **Step 4: 관리자 모듈 문법 및 전체 테스트 검사**

Run: `node --check src/admin-card-list.js && node --test tests/*.test.js`

Expected: syntax check exits 0 and all tests pass.

- [ ] **Step 5: GitHub에 관리자 카드 변경을 커밋**

Commit message: `feat: 관리자 카드에 학생 식별 코드 표시`

### Task 5: 최종 검증

**Files:**
- Verify: `src/profile-utils.js`
- Verify: `src/app.js`
- Verify: `src/admin-card-list.js`
- Verify: `tests/profile-utils.test.js`
- Verify: `tests/admin-view-model.test.js`

- [ ] **Step 1: 전체 자동 테스트 실행**

Run: `node --test tests/*.test.js`

Expected: 0 failures.

- [ ] **Step 2: 변경 JavaScript 문법 검사**

Run: `node --check src/profile-utils.js && node --check src/app.js && node --check src/admin-card-list.js`

Expected: all commands exit 0.

- [ ] **Step 3: 요구사항별 결과 확인**

- `1 학녀`, `01학년`은 `1학년`으로 저장된다.
- `003 바`는 `3반`으로 저장된다.
- `02 조오`는 `2조`로 저장된다.
- `004 번`은 `4번`으로 저장된다.
- 학년 4 또는 숫자 없는 입력은 저장 전에 거부된다.
- 1학년 1반 1번 홍길동 카드가 `1101홍길동`으로 표시된다.
- 조는 카드 보조 정보에 `N조`로 표시된다.
- 번호순 관리자 배치가 숫자 순서를 유지한다.

- [ ] **Step 4: GitHub `main` 최신 파일을 다시 읽어 커밋 반영 확인**

Expected: GitHub에서 변경 파일의 최신 blob SHA와 내용이 새 구현을 포함한다.
