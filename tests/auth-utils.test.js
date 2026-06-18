import test from "node:test";import assert from "node:assert/strict";import {ADMIN_UID,isAdminUid,makeDownloadFilename,normalizeGmailAddress} from "../src/auth-utils.js";
test("normalizes Gmail and validates administrator",()=>{assert.equal(normalizeGmailAddress(" Teacher "),"teacher@gmail.com");assert.equal(isAdminUid(ADMIN_UID),true);assert.equal(isAdminUid("other"),false);});
test("creates classroom download filename",()=>{assert.equal(makeDownloadFilename({gradeName:"2학년",className:"1반",studentNumber:"10번",studentName:"홍길동",questionIndex:1}),"2110홍길동(1).jpg");});
