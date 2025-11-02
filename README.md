# QR Maker

QR 코드 생성 및 관리 웹 애플리케이션

## 프로젝트 개요

QR Maker는 URL을 입력하여 즉시 QR 코드를 생성하고, 색상과 로고 커스터마이징을 통해 브랜드 정체성을 반영한 QR 코드를 만들 수 있는 웹 서비스입니다.

## 기술 스택

- **Frontend**: React 19, TypeScript, Vite
- **UI**: ShadCN UI, Tailwind CSS, Radix UI
- **Backend**: Supabase (인증, 데이터베이스, 스토리지)
- **라우팅**: React Router v7
- **패키지 매니저**: pnpm

## 개발 환경 설정

### 사전 요구사항

- Node.js (최신 LTS 버전)
- pnpm
- Supabase 계정

### 설치 및 실행

1. 의존성 설치
```bash
pnpm install
```

2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Supabase 대시보드에서 프로젝트 설정 > API 메뉴에서 URL과 anon key를 확인할 수 있습니다.

3. Supabase 프로젝트 설정

- Authentication > Providers에서 Email 활성화
- Authentication > URL Configuration에서 Site URL과 Redirect URLs 설정
  - Site URL: `http://localhost:5173` (개발 환경)
  - Redirect URLs: `http://localhost:5173/verify-email`

4. 개발 서버 실행
```bash
pnpm dev
```

## 프로젝트 구조

```
src/
├── components/
│   ├── ui/              # ShadCN UI 컴포넌트
│   ├── Auth/            # 인증 관련 컴포넌트
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── PublicRoute.tsx
│   └── Layout/          # 레이아웃 컴포넌트
│       ├── Header.tsx
│       └── Layout.tsx
├── contexts/
│   └── AuthContext.tsx  # 인증 상태 관리
├── pages/
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── MyPage.tsx
│   └── VerifyEmail.tsx
├── lib/
│   └── supabase.ts      # Supabase 클라이언트
└── types/
    ├── user.ts
    └── database.ts
```

## 주요 기능

### 구현 완료 (Epic 3)

- ✅ 이메일/비밀번호 기반 회원가입 및 로그인
- ✅ 이메일 인증 플로우
- ✅ 인증 상태 관리 (Context API)
- ✅ 보호된 라우트 (ProtectedRoute)
- ✅ 마이페이지 기본 구조

### 예정 기능

- QR 코드 생성 및 다운로드 (Epic 1)
- 색상 및 로고 커스터마이징 (Epic 2)
- QR 코드 히스토리 저장 및 관리 (Epic 4)

## 문서

- [PRD](./docs/prd/qr-maker-prd.md)
- [Tech Spec](./docs/tech-spec/qr-maker-tech-spec.md)

---

## 기존 Vite 템플릿 정보

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
