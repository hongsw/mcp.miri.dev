# miri.dev MCP Server 사용법

## 🚀 빠른 시작

### 1단계: 설치

```bash
cd mcp
./install.sh
```

### 2단계: Claude Desktop 재시작

설치 후 Claude Desktop을 완전히 종료하고 다시 시작하세요.

### 3단계: 테스트

Claude에서 다음과 같이 말해보세요:

```
홈페이지를 miri.dev에 배포하라
```

## 🎯 사용 예시

### 기본 배포

**간단한 명령:**
```
현재 폴더를 miri.dev에 배포해줘
```

**결과:**
- 현재 디렉토리의 모든 웹 파일을 스캔
- 자동으로 로그인 처리 (필요한 경우)
- 파일 업로드 및 배포 URL 제공

### 특정 폴더 배포

**명령:**
```
./my-website 폴더를 miri.dev에 올려줘
```

**결과:**
- `./my-website` 폴더 내용을 배포
- 상대 경로와 절대 경로 모두 지원

### 사이트 이름 지정

**명령:**
```
포트폴리오를 배포하고 사이트명은 portfolio로 해줘
```

**결과:**
- 사이트 이름이 "portfolio"로 설정됨
- URL에 사이트명이 반영될 수 있음

## 🎯 Current Artifact 직접 연결 (토큰 소비 없음)

### 1. 현재 Artifact 등록
```javascript
// Claude Desktop에서 artifact 생성 후 등록
register_current_artifact({
  artifactId: "artifact_1234567890",
  projectName: "Interactive Todo App",
  description: "React로 만든 할일 관리 앱"
})
```

### 2. 등록된 Artifact 직접 배포
```javascript
// HTML 내용을 직접 전달해서 토큰 소비 없이 배포
deploy_current_artifact({
  artifactId: "artifact_1234567890"
})
```

### 3. MCP Resource로 접근
```javascript
// 등록된 artifact들이 자동으로 Resource로 노출됨
// URI: artifact://artifact_1234567890
// 다른 도구에서 토큰 소비 없이 참조 가능
```

## 🔄 워크플로우 예시

### A. 실시간 개발 & 배포
```javascript
// 1. Claude에서 웹앱 artifact 생성
// 2. artifact ID 확인 (예: artifact_1234567890)

// 3. MCP에 등록
register_current_artifact({
  artifactId: "artifact_1234567890", 
  projectName: "My Web App"
})

// 4. 즉시 배포 (토큰 소비 없음)
deploy_current_artifact({
  artifactId: "artifact_1234567890"})
```

### B. Resource 기반 참조
```javascript
// 1. Resource 목록 확인
// → artifact://artifact_1234567890 발견

// 2. 메타데이터 읽기 (토큰 소비 없음)
// → 프로젝트명, 설명, 등록시간 등 확인

// 3. 다른 도구에서 참조
// → URI로 직접 연결 가능
```

## 🎉 핵심 장점

- **토큰 완전 절약**: Resource 등록/읽기는 토큰 소비 없음
- **실시간 동기화**: 현재 세션 artifact와 직접 연결
- **자동 감지**: artifact 생성 시 즉시 등록 가능
- **투명한 접근**: 일반 MCP Resource로 활용 가능

## 🔧 지원하는 명령어

### 배포 관련

| 자연어 명령 | 기능 |
|------------|------|
| "홈페이지를 miri.dev에 배포하라" | 기본 배포 |
| "현재 폴더를 배포해줘" | 현재 디렉토리 배포 |
| "./docs 폴더를 올려줘" | 특정 폴더 배포 |
| "사이트명은 blog로 해서 배포해줘" | 이름 지정 배포 |
| **"이 홈페이지를 배포해줘"** 🎨 | **Artifact 직접 배포** |
| **"위의 코드를 miri.dev에 올려줘"** 🚀 | **HTML 즉시 배포** |

### 상태 확인

| 자연어 명령 | 기능 |
|------------|------|
| "miri.dev 상태를 확인해줘" | 전체 상태 확인 |
| "로그인 상태 알려줘" | 인증 상태만 확인 |
| "배포 기록을 보여줘" | 최근 배포 정보 |

### 인증 관리

| 자연어 명령 | 기능 |
|------------|------|
| "miri.dev에 로그인해줘" | 로그인 |
| "다시 로그인 해줘" | 강제 재로그인 |

## 📋 배포 과정 상세

### 🎨 Artifact 직접 배포 (NEW!)

Claude가 만든 코드를 즉시 배포하는 새로운 방식:

```
🚀 Artifact "my-website"를 직접 배포중입니다...
✅ CSS 내용을 HTML에 임베드했습니다
✅ JavaScript 내용을 HTML에 임베드했습니다
📦 압축된 데이터 준비: 원본 15284B -> 압축 2847B (81.4% 절약)

🎉 Artifact 배포 성공!

📍 사이트 URL: https://a1b2c3d4.miri.dev
📁 프로젝트명: my-website
🆔 사이트 ID: a1b2c3d4
⏰ 배포 시간: 2024년 12월 24일 오후 11:30:00
📊 파일 수: 1개
⏳ 만료일: 2024년 12월 27일 오후 11:30:00

✨ Claude Artifact가 성공적으로 miri.dev에 배포되었습니다!

🎯 바로 접속해서 확인해보세요: https://a1b2c3d4.miri.dev
```

#### 🗜️ 고급 압축 기능

- **gzip 압축**: 대용량 HTML/CSS/JS도 3초 내 배포
- **자동 최적화**: 평균 80% 이상 데이터 절약
- **FormData 한계 해결**: 복잡한 Artifact도 문제없이 처리
- **Base64 인코딩**: 안전한 바이너리 데이터 전송

### 📁 일반 파일 배포

### 1. 인증 확인
```
🔐 인증 상태를 확인합니다...
✅ 이미 로그인되어 있습니다.
```

### 2. 파일 스캔
```
📋 파일을 스캔중입니다...
📁 발견된 파일: 15개
```

### 3. 안전성 검사
```
⚠️  안전하지 않은 파일명이 발견되었습니다:
  ❌ 한글파일.txt → ✅ 1703123456789abc.txt
✅ 파일명이 안전하게 변경되었습니다.
```

### 4. 업로드
```
📤 파일을 업로드중입니다...
✅ 업로드 완료!
```

### 5. 결과
```
🎉 배포 성공!

📍 사이트 URL: https://a7b8c9d0.miri.dev
⏰ 배포 시간: 2024년 1월 15일 오후 3:30:00
📁 배포된 파일: 15개

웹사이트가 성공적으로 배포되었습니다! 🎉
```

## 🔒 인증 과정

### 자동 로그인

인증이 필요한 경우 자동으로 로그인 프로세스가 시작됩니다:

```
🔐 miri.dev 로그인
개발용 계정:
- hongbuzz@gmail.com / 123
- test@miri.dev / 123
- admin@miri.dev / admin123

? 이메일: hongbuzz@gmail.com
? 비밀번호: [입력]

✅ 로그인 성공!
Hong Buzz(hongbuzz@gmail.com)로 성공적으로 로그인되었습니다.
플랜: basic
토큰 만료일: 2024년 2월 14일
```

### 토큰 관리

- 토큰은 30일간 유효합니다
- 만료된 토큰은 자동으로 감지되어 재로그인을 요청합니다
- 인증 정보는 `~/.miridev/auth.json`에 안전하게 저장됩니다

## 📁 파일 처리

### 지원하는 파일 형식

- **HTML**: `*.html`
- **스타일**: `*.css`
- **스크립트**: `*.js`
- **데이터**: `*.json`, `*.txt`, `*.md`
- **이미지**: `*.png`, `*.jpg`, `*.jpeg`, `*.gif`, `*.svg`, `*.ico`
- **폰트**: `*.woff`, `*.woff2`, `*.ttf`, `*.eot`

### 자동 제외 파일

- `node_modules/` 폴더
- `.git/` 폴더
- 숨김 파일 (`.`으로 시작)
- `.DS_Store`, `Thumbs.db`

### 파일명 안전화

안전하지 않은 파일명은 자동으로 변환됩니다:

| 원본 파일명 | 변환된 파일명 |
|------------|-------------|
| `한글파일.txt` | `1703123456789abc.txt` |
| `file with space.css` | `1703123456790def.css` |
| `특수문자!@#.js` | `1703123456791ghi.js` |

## 🛠 문제 해결

### 일반적인 오류

#### 1. index.html 없음
```
❌ 배포 실패

오류 내용: index.html 파일이 필요합니다. 프로젝트 루트에 index.html을 만들어주세요.
```

**해결책:** 프로젝트 루트에 `index.html` 파일을 생성하세요.

#### 2. 로그인 실패
```
❌ 로그인 실패: 이메일 또는 비밀번호가 올바르지 않습니다.
```

**해결책:** 개발용 계정 정보를 확인하세요:
- hongbuzz@gmail.com / 123
- test@miri.dev / 123
- admin@miri.dev / admin123

#### 3. 파일을 찾을 수 없음
```
❌ 배포 실패

오류 내용: 디렉토리를 찾을 수 없습니다: ./nonexistent
```

**해결책:** 존재하는 디렉토리 경로를 지정하세요.

### 고급 문제 해결

#### 인증 정보 초기화
```bash
rm ~/.miridev/auth.json
```

#### 설정 파일 확인
```bash
# macOS
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Windows
type %APPDATA%\Claude\claude_desktop_config.json
```

#### MCP 서버 직접 테스트
```bash
cd mcp
node src/index.js
```

## 📊 상태 확인 명령

### 전체 상태
```
🔍 miri.dev 상태 현황

🔐 인증 상태: ✅ 로그인됨
👤 사용자: Hong Buzz (hongbuzz@gmail.com)
📋 플랜: basic

📊 최근 배포 정보
🌐 URL: https://a7b8c9d0.miri.dev
🆔 사이트 ID: a7b8c9d0
⏰ 배포 시간: 2024년 1월 15일 오후 3:30:00
📁 파일 수: 15개

🏥 miri.dev 서비스 상태: 🟢 정상
🔧 서비스 버전: 1.0.0
```

## 🎨 고급 사용법

### 프로젝트별 설정

각 프로젝트에 `.miridev.json` 파일을 만들어 설정을 저장할 수 있습니다:

```json
{
  "siteName": "my-awesome-site",
  "ignore": [
    "*.log",
    "temp/*"
  ],
  "build": {
    "command": "npm run build",
    "directory": "dist"
  }
}
```

### 배치 배포

여러 프로젝트를 순차적으로 배포할 수 있습니다:

```
./project1, ./project2, ./project3 폴더들을 모두 miri.dev에 배포해줘
```

## 📚 참고 자료

- [miri.dev CLI 문서](../cli/USAGE.md)
- [Model Context Protocol 공식 문서](https://modelcontextprotocol.io/)
- [Claude Desktop 설정 가이드](https://claude.ai/docs/desktop)

## 🆘 지원

문제가 발생하면:

1. 이 문서의 문제 해결 섹션을 확인하세요
2. [miri.dev](https://www.miri.dev)에서 지원을 요청하세요
3. GitHub Issues에 문제를 보고하세요

---

🎉 즐거운 배포 되세요! 