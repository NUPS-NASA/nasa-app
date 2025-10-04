# NASA App Monorepo

## 소개
- `nasa-app`은 pnpm 워크스페이스 기반 모노레포로, React 클라이언트와 Express 기반 API 서버를 함께 관리합니다.
- 현재는 NASA 관련 기능을 확장하기 위한 스켈레톤 단계이며, Tauri 등 데스크톱 번들을 고려해 해시 기반 라우팅(react-router-dom `HashRouter`)을 사용합니다.

## 주요 특징
- React 19 + Vite 7 + Tailwind CSS 4 조합으로 빠른 프론트엔드 개발 환경 제공.
- ESM 기반 Express 5 서버에 CORS, JSON 파싱, 환경 변수 로딩이 기본 탑재됩니다.
- `packages/` 디렉터리의 hooks, stores, types, ui, utils 패키지로 공용 로직을 모듈화할 수 있습니다.
- Docker Compose를 이용해 서버·클라이언트를 동시에 개발 모드로 띄우는 구성이 준비되어 있습니다.
- Prisma + SQLite 기반의 가벼운 데이터 계층이 포함되어 있으며, 기본 DB 파일은 `apps/server/prisma/dev.db`로 생성됩니다.

## 기술 스택
- Node.js 20.x (Docker 베이스 이미지: `node:20.19.4-slim`)
- pnpm 10.18.0 (corepack)
- React 19, React Router 7, Vite 7, Tailwind CSS 4
- Express 5, cors, dotenv
- Docker & Docker Compose (선택 사용)

## 디렉터리 구조
```
.
├─ apps/
│  ├─ client/      # Vite + React 프론트엔드 앱
│  └─ server/      # Express API 서버
├─ packages/       # 재사용 가능한 모듈 (hooks, stores, types, ui, utils)
├─ docker/         # 개발용 엔트리포인트 스크립트
├─ docker-compose.yml
├─ pnpm-workspace.yaml
└─ package.json
```

## 사전 준비물
- Node.js 20.x (LTS) 이상 권장
- corepack 활성화 후 pnpm 10.18.0 사용
- Docker 개발 환경을 사용할 경우 Docker Engine 24+ 및 docker compose 플러그인

```bash
corepack enable
corepack prepare pnpm@10.18.0 --activate
```

## 설치
```bash
pnpm install
```

## 로컬 개발 실행
- 전체 개발 서버 실행: `pnpm dev` (클라이언트와 서버를 동시에 실행)
- 개별 실행
  - API 서버: `pnpm dev:server` → 기본 포트 `4000`
  - 프론트엔드: `pnpm dev:client` → 기본 포트 `5173`
- 프론트엔드 개발 서버는 `/api` 경로를 `http://localhost:4000` 혹은 `BACKEND_URL` 환경 변수로 지정한 주소로 프록싱합니다.

## 환경 변수
- API 서버 (`apps/server/.env`)
  - `PORT`: 서버 포트 (기본값 4000)
  - `DATABASE_URL`: Prisma가 참조할 SQLite 파일 경로 (기본값 `file:./dev.db`)
- 프론트엔드 (`apps/client` 루트에 `.env` 생성 가능)
  - `BACKEND_URL`: 개발 서버에서 `/api` 프록시가 향할 API 주소. 지정하지 않으면 `http://localhost:4000` 사용
  - Docker 개발 환경에서는 `VITE_API_BASE_URL`을 이용해 API 엔드포인트를 주입합니다.

## Docker 개발 환경
```bash
docker compose up --build
```
- 서버·클라이언트 컨테이너가 각각 `apps/server/Dockerfile`, `apps/client/Dockerfile`을 기준으로 빌드됩니다.
- 볼륨 마운트로 로컬 소스 코드를 공유하고 `docker/dev-entrypoint.sh`가 의존성 설치와 권한 설정을 처리합니다.
- HMR 안정화를 위해 `CHOKIDAR_USEPOLLING`이 활성화되어 있습니다.

## 빌드 및 배포
- 프론트엔드 번들: `pnpm --filter @nups-nasa/client build` → 결과물은 `apps/client/dist`
- API 서버 빌드: `pnpm --filter @nups-nasa/server build`
  - 현재 스크립트는 `prisma generate`를 먼저 실행하도록 되어 있으므로 Prisma 스키마와 의존성이 준비되어 있어야 합니다.
- 프로덕션 실행 예시: `pnpm --filter @nups-nasa/server start`

## 공용 패키지
- `packages/hooks`: React 커스텀 훅 모음 (향후 구현 예정)
- `packages/stores`: 전역 상태 관리 로직 배치 용도
- `packages/types`: 프로젝트 전반에서 공유할 TypeScript 타입 정의
- `packages/ui`: 재사용 가능한 UI 컴포넌트
- `packages/utils`: 범용 유틸리티 함수 모음

## 품질 관리
- 프론트엔드 린트: `pnpm --filter @nups-nasa/client lint`
- 프로젝트 전반의 Prettier 설정은 `.prettierrc.json`에 정의되어 있습니다.

## 트러블슈팅
- pnpm 설치 중 특정 플랫폼 전용 롤업 바이너리(`@rollup/rollup-linux-arm64-gnu`) 설치 실패 메시지가 보일 수 있으나, 필수가 아니므로 무시해도 됩니다.
- Docker 환경에서 파일 권한 문제가 발생한다면 `docker/dev-entrypoint.sh`의 chown 로직이 올바르게 실행되었는지 확인하세요.

## 라이선스
- 루트 `package.json`에 명시된 대로 ISC 라이선스를 따릅니다.

## 향후 로드맵 아이디어
- Prisma 스키마 및 데이터 계층 추가
- NASA Open API 연동을 위한 서비스/훅 구현
- 공용 패키지에 실제 UI 컴포넌트와 타입 정의 채워 넣기
