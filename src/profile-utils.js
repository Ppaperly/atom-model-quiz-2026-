function digits(value){
  return String(value??"").match(/\d+/)?.[0]||"";
}

function extractPositiveInteger(value,label){
  const text=digits(value);
  const number=text?Number(text):0;
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

export function formatStudentNumber(value){
  const number=digits(value);
  return number?`${Number(number)}번`:"";
}

export function formatStudentCardLabel(profile){
  const grade=digits(profile.gradeName);
  const classNumber=digits(profile.className);
  const studentNumber=digits(profile.studentNumber);
  const name=String(profile.studentName??"").trim();
  if(!grade||!classNumber||!studentNumber)return name;
  return `${Number(grade)}${Number(classNumber)}${String(Number(studentNumber)).padStart(2,"0")}${name}`;
}
