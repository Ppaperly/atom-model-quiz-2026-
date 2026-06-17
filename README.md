# 원자 모형 퀴즈

스마트폰으로 참여하는 공개수업용 원자 모형 퀴즈 웹앱입니다.

## 기능

- 1~20번 원소 중 규소를 제외하고 3문항 랜덤 출제
- 원소 번호, 이름, 기호 중 2개 빈칸
- 양성자 수 또는 전자 수 중 1개 빈칸
- 학생 원자 모형 사진 업로드
- Firestore에 압축 이미지와 답안 저장
- 같은 조 결과와 전체 조 결과 확인
- 이름이 보이는 동료 피드백
- 관리자 비밀번호: `hy3932662`
- 관리자 설정으로 정답 확인과 원소 검색 활성화/비활성화

## Firebase

Firebase에서는 Web 앱과 Firestore Database만 사용합니다. Storage, Hosting, Android 앱, iOS 앱은 사용하지 않습니다.

## GitHub Pages 배포

저장소 Settings > Pages에서 `Deploy from a branch`, branch `main`, folder `/root`를 선택하세요.
