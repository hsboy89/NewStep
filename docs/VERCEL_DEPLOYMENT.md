# Vercel 배포 가이드

## 카카오 번역 API 설정 (Vercel Serverless Functions)

이 프로젝트는 Vercel Serverless Functions를 사용하여 카카오 번역 API를 안전하게 호출합니다.

## 아키텍처

```
사용자 클릭 → React 컴포넌트 → /api/translate (Vercel Function) → 카카오 API → 결과 반환
```

### 장점
- ✅ CORS 문제 해결
- ✅ API 키가 브라우저에 노출되지 않음
- ✅ 서버리스이므로 별도 서버 관리 불필요

## 배포 전 체크리스트

### 1. Vercel 환경 변수 설정

1. Vercel 프로젝트 대시보드 접속
2. **Settings** > **Environment Variables** 메뉴
3. 다음 변수 추가:
   - **Name**: `KAKAO_API_KEY`
   - **Value**: `91459bc4524ae72bfc1a37a8941244cc`
   - **Environment**: Production, Preview, Development 모두 선택
4. **Save** 클릭

### 2. 파일 구조 확인

다음 파일이 존재하는지 확인:
```
api/
  └── translate.js  (Vercel Serverless Function)
```

### 3. 배포

```bash
# Git에 커밋 및 푸시
git add .
git commit -m "Add Vercel Serverless Function for Kakao API"
git push origin master
```

Vercel이 자동으로 배포를 시작합니다.

## 로컬 개발 환경 설정

로컬에서 개발할 때는 Vercel CLI를 사용하여 Serverless Function을 테스트할 수 있습니다:

```bash
# Vercel CLI 설치
npm i -g vercel

# 로컬에서 Vercel 환경 실행
vercel dev
```

또는 Vite 개발 서버를 사용할 수도 있습니다 (프록시 없이도 작동):

```bash
npm run dev
```

## 문제 해결

### "API key is not configured" 오류

- Vercel 대시보드에서 `KAKAO_API_KEY` 환경 변수가 설정되었는지 확인
- 환경 변수 이름이 정확한지 확인 (`KAKAO_API_KEY` 또는 `VITE_KAKAO_REST_API_KEY`)
- 재배포 후에도 오류가 발생하면 Vercel 대시보드에서 환경 변수를 다시 확인

### CORS 오류

- Vercel Serverless Function을 사용하면 CORS 문제가 해결됩니다
- `api/translate.js`에 CORS 헤더가 설정되어 있습니다

### 로컬에서 API 호출 실패

- 로컬 개발 시에는 Vite 개발 서버가 `/api/translate`를 Vercel Function으로 프록시하지 않습니다
- Vercel CLI (`vercel dev`)를 사용하거나, 로컬에서도 Vercel Function을 실행해야 합니다

## API 사용량 모니터링

카카오 개발자 센터에서 API 사용량을 확인할 수 있습니다:
- [카카오 개발자 센터](https://developers.kakao.com) > 내 애플리케이션 > 통계
- 무료 플랜: 일일 50,000자까지 무료

## 보안 주의사항

- ✅ API 키는 Vercel 환경 변수에만 저장
- ✅ `.env` 파일은 Git에 커밋하지 않음 (`.gitignore`에 포함)
- ✅ 클라이언트 코드에서 API 키를 직접 사용하지 않음
- ✅ 모든 API 호출은 Serverless Function을 통해 처리

