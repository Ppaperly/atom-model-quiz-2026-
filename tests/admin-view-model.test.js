import test from "node:test";import assert from "node:assert/strict";import {buildParticipationSections,createAdminPopupPage,filterParticipationRecords,getParticipationFilterOptions,groupParticipationRecords} from "../src/admin-view-model.js";
test("keeps repeat participation separate",()=>{const records=groupParticipationRecords([{id:"1",sessionId:"a",questionIndex:1},{id:"2",sessionId:"a",questionIndex:2},{id:"3",sessionId:"b",questionIndex:1}]);assert.equal(records.length,2);});test("popup excludes correct answer",()=>{const page=createAdminPopupPage({id:"1"},[{submissionId:"1"}]);assert.equal(page.feedback.length,1);assert.equal("correctAnswer" in page,false);});
const records=[{sessionId:"a",gradeName:"1학년",className:"1반",teamName:"2조",studentNumber:"10번",createdAt:300},{sessionId:"b",gradeName:"1학년",className:"1반",teamName:"1조",studentNumber:"2번",createdAt:200},{sessionId:"c",gradeName:"2학년",className:"3반",teamName:"1조",studentNumber:"1번",createdAt:100}];
test("empty selections show all",()=>assert.equal(filterParticipationRecords(records,{grades:[],classes:[]}).length,3));test("multiple grade and class selections filter",()=>assert.deepEqual(filterParticipationRecords(records,{grades:["1학년","2학년"],classes:["3반"]}).map(item=>item.sessionId),["c"]));test("options are sorted",()=>assert.deepEqual(getParticipationFilterOptions(records),{grades:["1학년","2학년"],classes:["1반","3반"]}));test("all layout separates classes",()=>assert.deepEqual(buildParticipationSections(records,"all")[0].records.map(item=>item.sessionId),["a","b"]));test("team layout separates teams",()=>assert.deepEqual(buildParticipationSections(records,"team").map(item=>item.title),["1학년 1반 · 1조","1학년 1반 · 2조","2학년 3반 · 1조"]));test("number layout sorts normalized student numbers numerically",()=>assert.deepEqual(buildParticipationSections(records,"number")[0].records.map(item=>item.studentNumber),["2번","10번"]));

test("normalizes legacy session profile while preserving record links",()=>{
  const grouped=groupParticipationRecords(
    [{id:"submission-1",sessionId:"session-1",questionIndex:1}],
    [{id:"session-1",gradeName:"01 학녀",className:"02 바",teamName:"03 조오",studentNumber:"004",studentName:" 홍길동 "}]
  );
  assert.deepEqual({sessionId:grouped[0].sessionId,gradeName:grouped[0].gradeName,className:grouped[0].className,teamName:grouped[0].teamName,studentNumber:grouped[0].studentNumber,studentName:grouped[0].studentName,submissionId:grouped[0].submissions[0].id},{sessionId:"session-1",gradeName:"1학년",className:"2반",teamName:"3조",studentNumber:"4번",studentName:"홍길동",submissionId:"submission-1"});
});

test("uses normalized legacy values for filters and layouts",()=>{
  const normalized=groupParticipationRecords([], [
    {id:"a",gradeName:"01 학년",className:"01 바",teamName:"02 조",studentNumber:"010",studentName:"가",createdAt:300},
    {id:"b",gradeName:"1학년",className:"1반",teamName:"2조",studentNumber:"2번",studentName:"나",createdAt:200}
  ]);
  assert.deepEqual(getParticipationFilterOptions(normalized),{grades:["1학년"],classes:["1반"]});
  assert.deepEqual(buildParticipationSections(normalized,"team").map(section=>section.title),["1학년 1반 · 2조"]);
  assert.deepEqual(buildParticipationSections(normalized,"number")[0].records.map(record=>record.studentNumber),["2번","10번"]);
});
