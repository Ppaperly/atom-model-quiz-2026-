export const ADMIN_UID = "E2aywHHeSvbpcVW81AxcYIrubvE2";
export function normalizeGmailAddress(value){const text=String(value??"").trim().toLowerCase();if(!text)throw new Error("관리자 아이디를 입력해 주세요.");const local=text.split("@")[0].replace(/[^a-z0-9._+-]/g,"");if(!local)throw new Error("관리자 아이디를 확인해 주세요.");return `${local}@gmail.com`;}
export function isAdminUid(uid){return uid===ADMIN_UID;}
export function makeDownloadFilename(submission){const number=value=>String(value??"").replace(/\D/g,"");const name=String(submission.studentName??"").replace(/[\\/:*?"<>|]/g,"").trim();return `${number(submission.gradeName)}${number(submission.className)}${number(submission.studentNumber)}${name}(${number(submission.questionIndex)}).jpg`;}
