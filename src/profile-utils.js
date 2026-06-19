function digits(value){
  return String(value??"").match(/\d+/)?.[0]||"";
}

function extractPositiveInteger(value,label){
  const text=digits(value);
  const number=text?Number(text):0;
  if(!Number.isSafeInteger(number)||number<1)throw new Error(`${label}을(를) 확인해 주세요.`);
  return number;
}

function normalizeDisplayField(value,suffix,{min=1,max=Number.MAX_SAFE_INTEGER}={}){
  const original=String(value??"").trim();
  const text=digits(original);
  if(!text)return original;
  const number=Number(text);
  if(!Number.isSafeInteger(number)||number<min||number>max)return original;
  return `${number}${suffix}`;
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

export function normalizeLegacyProfileForDisplay(profile={}){
  return {
    gradeName:normalizeDisplayField(profile.gradeName,"학년",{max:3}),
    className:normalizeDisplayField(profile.className,"반"),
    teamName:normalizeDisplayField(profile.teamName,"조"),
    studentNumber:normalizeDisplayField(profile.studentNumber,"번"),
    studentName:String(profile.studentName??"").trim()
  };
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
