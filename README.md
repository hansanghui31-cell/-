# ☕ 따뜻한 하루 일기 & AI 응원 웹앱

오늘 하루의 감정과 일기를 기록하고, Google Gemini AI 비서의 다정한 위로와 내일을 위한 긍정적인 실천 제안을 선물받는 감성 다이어리 웹앱입니다.

---

## 🚀 1. GitHub 업로드 방법

### Step 1. 터미널에서 Git 초기화 및 커밋
프로젝트 루트 디렉터리에서 아래 명령어를 순서대로 실행합니다:

```bash
# 1. git 초기화 (이미 되어있는 경우 생략 가능)
git init

# 2. 모든 변경사항 스테이징 (.env 파일은 .gitignore에 의해 자동 제외되어 안전합니다)
git add .

# 3. 첫 커밋 생성
git commit -m "feat: 따뜻한 하루 일기 & AI 응원 웹앱 초기 배포"

# 4. 기본 브랜치를 main으로 설정
git branch -M main
```

### Step 2. GitHub 저장소(Repository) 연결 및 푸시
1. [GitHub](https://github.com)에서 **New repository**를 생성합니다 (예: `warm-daily-diary`).
2. 아래 명령어로 GitHub 원격 저장소를 연결하고 푸시합니다:

```bash
# GitHub 저장소 URL을 연결 (본인 계정 및 저장소 이름으로 변경)
git remote add origin https://github.com/본인아이디/저장소이름.git

# 코드 푸시
git push -u origin main
```

---

## ⚡ 2. Vercel 배포 방법

본 프로젝트는 Vercel Serverless Function(`api/encourage.ts`)과 `vercel.json` 설정이 완벽하게 구성되어 있어 클릭 몇 번으로 즉시 배포됩니다.

### Step 1. Vercel에서 프로젝트 가져오기
1. [Vercel](https://vercel.com)에 로그인합니다.
2. **Add New...** > **Project**를 클릭합니다.
3. 방금 GitHub에 푸시한 저장소를 찾아 **Import** 버튼을 누릅니다.

### Step 2. 환경 변수 (Environment Variables) 설정
배포 설정 화면의 **Environment Variables** 섹션에 아래 키를 추가합니다:

| Key | Value | 필수 여부 | 설명 |
|---|---|---|---|
| `GEMINI_API_KEY` | 본인의 Gemini API 키 | **필수** | Vercel 서버리스 함수에서 안전하게 호출 |
| `VITE_GEMINI_API_KEY` | 본인의 Gemini API 키 | 선택 (폴백용) | 클라이언트 직접 호출용 |

> 💡 **Firebase 설정**: Firebase 설정값은 미입력 시 기본 제공된 `visit-208b9` 프로젝트가 기본 적용되므로 별도로 입력하지 않으셔도 바로 동작합니다. (변경을 원하실 경우 `VITE_FIREBASE_PROJECT_ID` 등을 추가하시면 됩니다.)

### Step 3. 배포(Deploy) 클릭
**Deploy** 버튼을 누르면 약 1분 내외로 빌드가 완료되고 배포 URL이 생성됩니다!

---

## 🛡️ 3. Firebase Firestore 보안 규칙 설정 안내

Firebase 콘솔([console.firebase.google.com](https://console.firebase.google.com)) > **visit-208b9** 프로젝트 > **Firestore Database** > **규칙(Rules)** 탭에서 일기 저장을 허용하도록 설정되어 있는지 확인해주세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /diaries/{document=**} {
      allow read, write: if true;
    }
  }
}
```
*(네트워크 지연이나 규칙 제한 시에도 웹앱의 로컬스토리지 자동 캐시 시스템이 작동하여 일기가 유실되지 않습니다.)*

---

## 💻 4. 로컬 개발 환경 실행

```bash
# 패키지 설치
npm install

# .env 파일 생성 (.env.example 참고)
cp .env.example .env
# .env 파일 내 GEMINI_API_KEY 입력

# 개발 서버 실행 (포트 3000)
npm run dev
```

---

## 📦 기술 스택
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **AI Integration**: Google Gemini API (`@google/genai`, 모델: `gemini-3.8-flash` & `gemini-3.1-flash-lite`)
- **Serverless**: Vercel Serverless Functions (`/api/encourage`, `/api/health`) & Express (로컬 개발용)
- **Database**: Firebase Cloud Firestore (`visit-208b9`) + LocalStorage Fallback
- **Animations & Effects**: Canvas Confetti, Lucide Icons, Web Speech API (TTS)
