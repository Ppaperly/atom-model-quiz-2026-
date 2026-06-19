# Legacy Admin Display Normalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Firestore의 기존 문서를 수정하지 않고 관리자 화면에서 기존 학년·반·조·번호 값을 표준 형식으로 표시하고 필터링·정렬한다.

**Architecture:** `profile-utils.js`에 기존 데이터용 안전한 표시 정규화 함수를 추가한다. `admin-view-model.js`의 그룹 생성 시점에 세션과 제출물의 표시 필드만 정규화하므로 이후 카드, 필터, 검색, 조별 배치, 번호순 배치는 별도 변경 없이 표준값을 사용한다.

**Tech Stack:** 브라우저 ES 모듈, Node.js 내장 테스트 러너, 기존 Firebase/Firestore 읽기 흐름

---

## File Structure

- Modify `src/profile-utils.js`: 기존 값에 숫자가 있으면 표준화하고 없으면 원문을 유지하는 표시 함수 추가.
- Modify `src/admin-view-model.js`: 관리자 참여 기록 생성 시 표시용 프로필 정규화 적용.
- Modify `tests/profile-utils.test.js`: 기존 데이터 표시 변환과 원문 유지 테스트.
- Modify `tests/admin-view-model.test.js`: 그룹·필터·조별 배치·번호순 정렬 회귀 테스트.

### Task 1: 기존 데이터 표시 정규화 함수

**Files:**
- Modify: `tests/profile-utils.test.js`
- Modify: `src/profile-utils.js`

- [ ] **Step 1: 실패하는 표시 정규화 테스트 작성**

```js
import {normalizeLegacyProfileForDisplay} from "../src/profile-utils.js";

test("normalizes legacy profile fields for administrator display",()=>{
  assert.deepEqual(normalizeLegacyProfileForDisplay({
    gradeName:" 01 학녀 ",
    className:" 003 바 ",
    teamName:" 02 조오 ",
    studentNumber:" 004 ",
    studentName:" 홍길동 "
  }),{
    gradeName:"1학년",
    className:"3반",
    teamName:"2조",
    studentNumber:"4번",
    studentName:"홍길동"
  });
});

test("keeps unrecognized legacy fields instead of rejecting the record",()=>{
  assert.deepEqual(normalizeLegacyProfileForDisplay({
    gradeName:"고학년",
    className:"무지개반",
    teamName:"파랑조",
    studentNumber:"미정",
    studentName:" 김철수 "
  }),{
    gradeName:"고학년",
    className:"무지개반",
    teamName:"파랑조",
    studentNumber:"미정",
    studentName:"김철수"
  });
});
```

- [ ] **Step 2: 테스트가 함수 부재로 실패하는지 확인**

Run: `node --test tests/profile-utils.test.js`

Expected: FAIL because `normalizeLegacyProfileForDisplay` is not exported.

- [ ] **Step 3: 최소 구현 작성**

```js
function normalizeDisplayField(value,suffix,{min=1,max=Number.MAX_SAFE_INTEGER}={}){
  const original=String(value??"").trim();
  const text=digits(original);
  if(!text)return original;
  const number=Number(text);
  if(!Number.isSafeInteger(number)||number<min||number>max)return original;
  return `${number}${suffix}`;
}

export function normalizeLegacyProfileForDisplay(profile={}){
  return {
    gradeName:normalizeDisplayField(profile.gradeName,"학년",{max:3}),
    className:normalizeDisplayField(profile.className,"반"),
    teamName:normalizeDisplayField(profile.teamName,"조"),
    studentNumber:normalizeDisplayField(profile.studentNumber,"번"),
    studentName:String(profile.studentName??"").trim()
  };
}
```

- [ ] **Step 4: 프로필 유틸 테스트 통과 확인**

Run: `node --test tests/profile-utils.test.js`

Expected: all profile utility tests pass.

- [ ] **Step 5: GitHub 커밋**

Commit message: `feat: 기존 학생 정보 관리자 표시 정규화`

### Task 2: 관리자 참여 기록에 표시 정규화 적용

**Files:**
- Modify: `tests/admin-view-model.test.js`
- Modify: `src/admin-view-model.js`

- [ ] **Step 1: 실패하는 그룹 생성 테스트 작성**

```js
test("normalizes legacy session profile while preserving record links",()=>{
  const records=groupParticipationRecords(
    [{id:"submission-1",sessionId:"session-1",questionIndex:1}],
    [{id:"session-1",gradeName:"01 학녀",className:"02 바",teamName:"03 조오",studentNumber:"004",studentName:" 홍길동 "}]
  );
  assert.deepEqual({
    sessionId:records[0].sessionId,
    gradeName:records[0].gradeName,
    className:records[0].className,
    teamName:records[0].teamName,
    studentNumber:records[0].studentNumber,
    studentName:records[0].studentName,
    submissionId:records[0].submissions[0].id
  },{
    sessionId:"session-1",
    gradeName:"1학년",
    className:"2반",
    teamName:"3조",
    studentNumber:"4번",
    studentName:"홍길동",
    submissionId:"submission-1"
  });
});
```

- [ ] **Step 2: 테스트가 기존 원문 반환으로 실패하는지 확인**

Run: `node --test tests/admin-view-model.test.js`

Expected: FAIL because grouped fields still contain legacy strings.

- [ ] **Step 3: 관리자 뷰 모델에 정규화 연결**

`src/admin-view-model.js` 상단에 import를 추가한다.

```js
import {normalizeLegacyProfileForDisplay} from "./profile-utils.js";
```

세션 그룹 생성 시 표시 프로필을 사용한다.

```js
for(const session of sessions){
  const profile=normalizeLegacyProfileForDisplay(session);
  groups.set(session.id,{sessionId:session.id,...profile,visibleToPeers:session.visibleToPeers!==false,createdAt:session.createdAt,submissions:[]});
}
```

세션이 없는 기존 제출물 그룹 생성에도 같은 방식을 적용한다.

```js
if(!groups.has(sessionId)){
  const profile=normalizeLegacyProfileForDisplay(submission);
  groups.set(sessionId,{sessionId,...profile,visibleToPeers:submission.visibleToPeers!==false,submissions:[]});
}
```

기존 세션에 연결된 제출물은 배열에 원본 그대로 유지한다.

- [ ] **Step 4: 그룹 생성 테스트 통과 확인**

Run: `node --test tests/admin-view-model.test.js`

Expected: all admin view model tests pass.

- [ ] **Step 5: GitHub 커밋**

Commit message: `feat: 관리자 기존 참여 기록 표시값 표준화`

### Task 3: 필터와 배치 회귀 검증

**Files:**
- Modify: `tests/admin-view-model.test.js`

- [ ] **Step 1: 기존 형식이 같은 표준 그룹으로 합쳐지는 테스트 작성**

```js
test("uses normalized legacy values for filters and layouts",()=>{
  const normalized=groupParticipationRecords([], [
    {id:"a",gradeName:"01 학년",className:"01 바",teamName:"02 조",studentNumber:"010",studentName:"가",createdAt:300},
    {id:"b",gradeName:"1학년",className:"1반",teamName:"2조",studentNumber:"2번",studentName:"나",createdAt:200}
  ]);
  assert.deepEqual(getParticipationFilterOptions(normalized),{grades:["1학년"],classes:["1반"]});
  assert.deepEqual(buildParticipationSections(normalized,"team").map(section=>section.title),["1학년 1반 · 2조"]);
  assert.deepEqual(buildParticipationSections(normalized,"number")[0].records.map(record=>record.studentNumber),["2번","10번"]);
});
```

- [ ] **Step 2: 회귀 테스트 실행**

Run: `node --test tests/admin-view-model.test.js`

Expected: PASS.

- [ ] **Step 3: 전체 테스트와 문법 검사 실행**

Run: `node --test tests/*.test.js`

Expected: 0 failures.

Run: `node --check src/profile-utils.js && node --check src/admin-view-model.js && node --check src/admin-card-list.js`

Expected: all commands exit 0.

- [ ] **Step 4: GitHub 최신 파일 재확인**

GitHub `main`에서 `profile-utils.js`, `admin-view-model.js`, 두 테스트 파일을 다시 읽는다.

Expected: 표시 정규화 함수와 관리자 그룹 연결이 최신 blob에 포함되고 Firestore 쓰기 코드는 추가되지 않았다.
