import test from "node:test";
import assert from "node:assert/strict";
import {formatStudentCardLabel,formatStudentNumber,normalizeStudentProfile} from "../src/profile-utils.js";

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

test("rejects missing numbers and grades outside one through three",()=>{
  const valid={gradeName:"1",className:"1",teamName:"1",studentNumber:"1",studentName:"홍길동"};
  assert.throws(()=>normalizeStudentProfile({...valid,gradeName:"4학년"}),/1학년, 2학년, 3학년/);
  assert.throws(()=>normalizeStudentProfile({...valid,className:"일반"}),/반/);
  assert.throws(()=>normalizeStudentProfile({...valid,teamName:"0조"}),/조/);
  assert.throws(()=>normalizeStudentProfile({...valid,studentNumber:"번호 없음"}),/번호/);
  assert.throws(()=>normalizeStudentProfile({...valid,studentName:"   "}),/이름/);
});

test("creates the administrator card identifier",()=>{
  assert.equal(formatStudentCardLabel({gradeName:"1학년",className:"1반",studentNumber:"1번",studentName:"홍길동"}),"1101홍길동");
  assert.equal(formatStudentCardLabel({gradeName:"2학년",className:"3반",studentNumber:"12번",studentName:"김철수"}),"2312김철수");
  assert.equal(formatStudentCardLabel({gradeName:"1",className:"10",studentNumber:"3",studentName:"이영희"}),"11003이영희");
});

test("formats old and normalized student numbers consistently",()=>{
  assert.equal(formatStudentNumber("1"),"1번");
  assert.equal(formatStudentNumber("01번"),"1번");
  assert.equal(formatStudentNumber(""),"");
});
