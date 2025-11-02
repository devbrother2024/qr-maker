# QR Maker - Technical Specification

## Source Tree Structure

```
qr-maker/
├── src/
│   ├── components/
│   │   ├── ui/                          # ShadCN UI 컴포넌트
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── label.tsx
│   │   │   ├── toast.tsx
│   │   │   └── toaster.tsx
│   │   ├── QRGenerator/
│   │   │   ├── QRGenerator.tsx
│   │   │   ├── URLInput.tsx
│   │   │   ├── QRPreview.tsx
│   │   │   └── DownloadButton.tsx
│   │   ├── Customization/
│   │   │   ├── CustomizationPanel.tsx
│   │   │   ├── ColorPicker.tsx
│   │   │   └── LogoUploader.tsx
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── EmailVerification.tsx
│   │   ├── History/
│   │   │   ├── QRHistory.tsx
│   │   │   ├── QRHistoryItem.tsx
│   │   │   └── QRHistoryActions.tsx
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       └── Layout.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── MyPage.tsx
│   │   └── VerifyEmail.tsx
│   ├── hooks/
│   │   ├── useQRGenerator.ts
│   │   ├── useAuth.ts
│   │   ├── useQRHistory.ts
│   │   └── useDebounce.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── qr-generator.ts
│   │   ├── image-processor.ts
│   │   └── utils.ts                     # ShadCN util (cn 함수)
│   ├── types/
│   │   ├── qr.ts
│   │   └── user.ts
│   ├── styles/
│   │   └── global.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── public/
│   └── favicon.ico
├── supabase/
│   ├── migrations/
│   │   ├── 001_create_users_table.sql
│   │   └── 002_create_qr_history_table.sql
│   └── seed.sql
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── components.json                      # ShadCN 설정 파일
└── README.md
```

---

## Technical Approach

### 아키텍처 개요

QR Maker는 **Jamstack 아키텍처**를 채택하여 정적 프론트엔드와 서버리스 백엔드를 분리한다. React로 구축된 SPA(Single Page Application)를 Netlify에 배포하고, Supabase를 BaaS(Backend as a Service)로 활용하여 인증, 데이터베이스, 스토리지를 처리한다.

### 핵심 설계 결정

**1. 클라이언트 사이드 QR 생성**

- QR 코드 생성은 브라우저에서 JavaScript 라이브러리(`qrcode`)를 사용하여 처리
- 서버 부하를 줄이고 즉각적인 응답 제공
- 생성된 QR 코드는 Base64 또는 Blob 형태로 다운로드

**2. Supabase 인증 시스템**

- Supabase의 내장 인증(Auth) 기능 활용
- 이메일/비밀번호 인증 및 이메일 확인 자동 처리
- Row Level Security(RLS)로 사용자별 데이터 격리

**3. ShadCN UI 기반 컴포넌트 설계**

- ShadCN UI로 일관되고 접근성 높은 UI 컴포넌트 구성
- Radix UI 기반의 검증된 컴포넌트 활용
- Tailwind CSS를 활용한 유틸리티 우선 스타일링
- Mobile-first 반응형 디자인

**4. 최소한의 상태 관리**

- React Context API로 전역 인증 상태 관리
- 각 기능별 커스텀 훅으로 로컬 상태 관리
- 복잡한 상태 관리 라이브러리(Redux 등) 불필요

### 데이터 흐름

1. **비회원 QR 생성**: 사용자 입력 → 클라이언트 QR 생성 → 즉시 다운로드
2. **회원 QR 저장**: 사용자 입력 → 클라이언트 QR 생성 → Supabase Storage 업로드 → DB에 메타데이터 저장
3. **히스토리 조회**: Supabase DB 쿼리 → 사용자별 필터링(RLS) → Storage에서 이미지 로드 → 클라이언트 렌더링

---

## Implementation Stack

### Frontend

| 기술                         | 용도          | 선택 이유                                       |
| ---------------------------- | ------------- | ----------------------------------------------- |
| **React**                    | UI 라이브러리 | 널리 사용되며 커뮤니티 지원이 풍부함            |
| **TypeScript**               | 타입 시스템   | 타입 안정성 및 개발 생산성 향상                 |
| **Vite**                     | 빌드 도구     | 빠른 개발 서버 및 번들링                        |
| **React Router**             | 라우팅        | 표준 React 라우팅 솔루션                        |
| **ShadCN UI**                | UI 컴포넌트   | Radix UI 기반, 접근성 우수, 커스터마이징 용이   |
| **Tailwind CSS**             | 스타일링      | 유틸리티 우선 CSS, ShadCN과 완벽 통합           |
| **Radix UI**                 | Headless UI   | ShadCN의 기반, 접근성 및 키보드 네비게이션 지원 |
| **qrcode**                   | QR 생성       | 가볍고 검증된 QR 생성 라이브러리                |
| **react-colorful**           | 컬러 피커     | 경량 컬러 선택 컴포넌트                         |
| **class-variance-authority** | CSS 유틸      | ShadCN 스타일 variant 관리                      |
| **clsx**                     | 클래스 유틸   | 조건부 클래스명 결합                            |
| **tailwind-merge**           | Tailwind 유틸 | Tailwind 클래스 충돌 해결                       |

### Backend & Database

| 기술                   | 용도          | 선택 이유                                 |
| ---------------------- | ------------- | ----------------------------------------- |
| **Supabase**           | BaaS          | 인증, DB, 스토리지를 통합 제공, 빠른 개발 |
| **PostgreSQL**         | 데이터베이스  | Supabase 기본 DB, 관계형 데이터 처리      |
| **Supabase Auth**      | 인증 시스템   | 이메일 인증 자동 처리                     |
| **Supabase Storage**   | 파일 스토리지 | QR 이미지 및 로고 파일 저장, RLS 지원     |
| **Row Level Security** | 데이터 보안   | 사용자별 데이터 자동 격리                 |

### Development & Tools

| 도구         | 용도          | 선택 이유                    |
| ------------ | ------------- | ---------------------------- |
| **pnpm**     | 패키지 매니저 | 빠르고 효율적인 의존성 관리  |
| **ESLint**   | 린팅          | 코드 품질 유지               |
| **Prettier** | 포매팅        | 일관된 코드 스타일           |
| **Vitest**   | 테스팅        | Vite 네이티브 테스트 도구    |
| **Netlify**  | 호스팅        | 간단한 배포, 자동 HTTPS, CDN |

---

## Technical Details

### 데이터베이스 스키마

#### users 테이블

Supabase Auth가 자동으로 관리하는 `auth.users` 테이블 사용.

#### qr_history 테이블

```sql
CREATE TABLE qr_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  foreground_color VARCHAR(7) NOT NULL DEFAULT '#000000',
  background_color VARCHAR(7) NOT NULL DEFAULT '#FFFFFF',
  logo_storage_path TEXT,           -- Supabase Storage 로고 파일 경로
  qr_image_storage_path TEXT NOT NULL,  -- Supabase Storage QR 이미지 파일 경로
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT qr_history_user_limit CHECK (
    (SELECT COUNT(*) FROM qr_history WHERE user_id = qr_history.user_id) <= 100
  )
);

CREATE INDEX idx_qr_history_user_id ON qr_history(user_id);
CREATE INDEX idx_qr_history_created_at ON qr_history(created_at DESC);
```

#### Row Level Security 정책

```sql
-- 사용자는 자신의 QR만 조회 가능
CREATE POLICY "Users can view own QR history"
  ON qr_history FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 QR만 생성 가능
CREATE POLICY "Users can insert own QR history"
  ON qr_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 QR만 삭제 가능
CREATE POLICY "Users can delete own QR history"
  ON qr_history FOR DELETE
  USING (auth.uid() = user_id);
```

#### Storage Buckets 및 정책

```sql
-- QR 이미지 저장용 버킷
INSERT INTO storage.buckets (id, name, public)
VALUES ('qr-images', 'qr-images', false);

-- 로고 이미지 저장용 버킷
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', false);

-- QR 이미지 Storage RLS 정책
CREATE POLICY "Users can upload own QR images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'qr-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own QR images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'qr-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own QR images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'qr-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 로고 이미지 Storage RLS 정책
CREATE POLICY "Users can upload own logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own logos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 핵심 기술 구현 포인트

#### QR 생성

- `qrcode` 라이브러리로 클라이언트 사이드 QR 생성
- PNG/SVG 포맷 지원
- Canvas API를 사용하여 로고 삽입
- 로고 크기는 QR 코드의 20% 이하로 제한 (스캔 가능성 유지)
- 로고 배경에 원형 배경 추가 (가독성 향상)

#### 인증 시스템

- Supabase Auth의 `signUp`, `signInWithPassword`, `signOut` 메서드 활용
- `onAuthStateChange` 리스너로 실시간 인증 상태 관리
- 이메일 인증 리디렉션 URL 설정 필요
- React Context API로 전역 인증 상태 관리

#### 데이터 관리

- Supabase Client로 CRUD 작업
- RLS 정책으로 자동 사용자 필터링
- QR 이미지와 로고는 Supabase Storage에 업로드
- DB에는 Storage 경로만 저장 (메타데이터)
- Storage 파일 경로 형식: `{user_id}/{qr_id}.png` 또는 `{user_id}/{logo_id}.png`
- 실시간 상태 업데이트를 위한 React 상태 관리

#### 파일 처리

- 로고 업로드: File API 사용 → Supabase Storage 업로드
- 이미지 유효성 검증 (포맷, 크기)
- QR 저장: Canvas에서 Blob 생성 → Supabase Storage 업로드
- QR 다운로드: Storage에서 파일 로드 또는 직접 Blob 다운로드
- 파일 삭제: DB 레코드 삭제 시 Storage 파일도 함께 삭제

---

## Development Setup

### 사전 요구사항

- Node.js (최신 LTS 버전)
- pnpm
- Supabase 계정
- Netlify 계정

### 1. 프로젝트 초기화

```bash
# Vite + React + TypeScript 프로젝트 생성
pnpm create vite qr-maker --template react-ts
cd qr-maker

# 의존성 설치
pnpm install

# 추가 패키지 설치
pnpm add @supabase/supabase-js react-router-dom qrcode react-colorful
pnpm add -D @types/qrcode eslint prettier eslint-config-prettier
```

### 2. ShadCN UI 설정

```bash
# Tailwind CSS 설치
pnpm add -D tailwindcss postcss autoprefixer
pnpm dlx tailwindcss init -p

# ShadCN UI 의존성 설치
pnpm add class-variance-authority clsx tailwind-merge
pnpm add @radix-ui/react-slot lucide-react

# ShadCN UI 초기화
pnpm dlx shadcn-ui@latest init
```

**초기화 옵션**:

- TypeScript: yes
- Style: Default
- Base color: Slate
- Global CSS: src/styles/global.css
- CSS variables: yes
- Import alias (components): @/components
- Import alias (utils): @/lib/utils

### 3. 필요한 ShadCN 컴포넌트 추가

```bash
pnpm dlx shadcn-ui@latest add button input card dialog dropdown-menu label toast
```

### 4. TypeScript 경로 별칭 설정

`tsconfig.json`과 `vite.config.ts`에서 `@` 별칭 설정 추가.

### 5. Supabase 프로젝트 설정

```bash
# Supabase CLI 설치
pnpm add -D supabase

# Supabase 프로젝트 초기화
npx supabase init
```

Supabase 대시보드에서:

1. 새 프로젝트 생성
2. Settings > API에서 URL과 anon key 복사
3. Authentication > Providers에서 Email 활성화
4. Storage에서 `qr-images`와 `logos` 버킷 생성
5. SQL Editor에서 마이그레이션 실행 (테이블 + Storage RLS 정책)

### 6. 환경 변수 설정

`.env.local` 파일 생성:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 7. 개발 서버 실행

```bash
pnpm dev
```

---

## Implementation Guide

### Phase 1: 기본 QR 생성 (Epic 1)

**목표**: 비회원이 URL을 입력하고 QR 코드를 생성하여 다운로드할 수 있는 기본 기능 구현

**작업 순서**:

1. 프로젝트 구조 및 라우팅 설정
2. QR 생성 컴포넌트 (`URLInput`, `QRPreview`, `useQRGenerator`)
3. 다운로드 기능 (PNG/SVG 선택)

**검증 기준**:

- URL 입력 후 1초 이내 QR 코드 생성
- PNG, SVG 모두 정상 다운로드
- 모바일 환경에서 정상 작동

### Phase 2: 커스터마이징 (Epic 2)

**목표**: 색상 및 로고 커스터마이징 기능 추가

**작업 순서**:

1. 색상 커스터마이징 (`ColorPicker`, 실시간 미리보기)
2. 로고 업로드 (드래그앤드롭, 크기/포맷 검증)
3. Canvas를 이용한 로고 삽입

**검증 기준**:

- 색상 변경 시 즉시 미리보기 반영
- 로고 삽입 후에도 QR 스캔 가능
- 로고 크기 자동 제한 (QR 코드의 20%)

### Phase 3: 사용자 인증 (Epic 3)

**목표**: 이메일 인증 기반 회원가입/로그인 시스템 구현

**작업 순서**:

1. Supabase 인증 설정
2. 인증 UI (`LoginForm`, `SignupForm`, `EmailVerification`)
3. 인증 상태 관리 (`useAuth`, AuthContext)
4. 헤더 UI (로그인/로그아웃 버튼)

**검증 기준**:

- 회원가입 후 이메일 인증 메일 수신
- 이메일 링크 클릭 시 계정 활성화
- 로그인 상태 유지 (새로고침 후에도)

### Phase 4: QR 히스토리 관리 (Epic 4)

**목표**: 로그인 사용자의 QR 코드 저장 및 관리 기능 구현

**작업 순서**:

1. 데이터베이스 마이그레이션 (테이블, RLS, 인덱스)
2. Supabase Storage 버킷 생성 및 RLS 정책 설정
3. QR 저장 기능 (Canvas → Blob → Storage 업로드 → DB 메타데이터 저장)
4. 로고 Storage 업로드 기능
5. 히스토리 UI (`QRHistory`, `QRHistoryItem`)
6. CRUD 기능 (`useQRHistory` - Storage 파일 관리 포함)

**검증 기준**:

- 로그인 사용자만 저장 가능
- 사용자는 자신의 QR만 조회 가능
- Storage에 파일이 정상적으로 업로드됨
- DB에 Storage 경로가 올바르게 저장됨
- 히스토리에서 이미지가 정상적으로 로드됨
- 최대 100개 제한 적용
- 삭제 시 DB와 Storage 파일 모두 삭제됨

### Phase 5: 반응형 디자인 및 최적화

**작업 순서**:

1. Mobile-first 반응형 레이아웃
2. 성능 최적화 (Lazy Loading, Code Splitting, React.memo)
3. UX 개선 (로딩 스피너, 에러 핸들링, 토스트 알림)

---

## Testing Approach

### 단위 테스트

- **도구**: Vitest + React Testing Library
- **대상**: QR 생성 로직, 커스텀 훅, 유틸 함수
- **목표 커버리지**: 유틸 함수 80%, 커스텀 훅 70%, 컴포넌트 60%

### 통합 테스트

- **대상**: QR 생성 플로우, 인증 플로우, 히스토리 관리 플로우
- **방법**: React Testing Library로 사용자 인터랙션 시뮬레이션

### E2E 테스트 (선택사항)

- **도구**: Playwright
- **시나리오**: 비회원 QR 생성, 회원가입/로그인, QR 저장 및 관리

---

## Deployment Strategy

### Netlify 배포

**설정**:

1. GitHub 저장소 연결
2. `netlify.toml` 설정 (빌드 명령, 리디렉션)
3. 환경 변수 등록 (Supabase URL, Key)

**CI/CD**:

- main 브랜치 푸시 시 자동 빌드 및 배포
- PR별 프리뷰 URL 생성
- 이전 버전으로 즉시 롤백 가능

### 도메인 및 HTTPS

- 커스텀 도메인 연결
- Let's Encrypt 자동 SSL 인증서 발급

### 모니터링

- Netlify Analytics: 페이지뷰, 대역폭
- Supabase Dashboard: DB 쿼리 성능, 인증 통계

### 보안

- HTTPS 강제 적용
- 환경 변수 안전 관리
- Supabase RLS 정책 적용
- 파일 업로드 크기 제한 (5MB)
- 이미지 포맷 검증
