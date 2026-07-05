# 🚀 miri.dev MCP (Model Context Protocol) Tool

[![npm version](https://badge.fury.io/js/miridev-mcp.svg)](https://badge.fury.io/js/miridev-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AI와 자연어로 소통하여 miri.dev에 웹사이트를 배포할 수 있는 MCP(Model Context Protocol) 도구입니다.

## ✨ 주요 기능

- 🚀 **자연어 배포**: "내 홈페이지를 miri.dev에 배포해줘" 같은 명령으로 배포
- 🔐 **로그인 = 영구 배포**: 로그인 시 배포가 만료되지 않고 유지됩니다 (게스트는 임시)
- 📌 **프로젝트 고정 URL**: `projectName` 지정 시 `name-shortid.miri.dev` 고정 주소 — 다시 배포해도 같은 URL로 최신본 서빙 (`.miri-project.json` 자동 재사용)
- 🌐 **내 도메인 연결**: 커스텀 도메인은 **웹(my-page) 또는 CLI**로 신청 (유료 플랜 + 문자인증) → 인증서 자동발급 → DNS 한 줄로 자동 HTTPS
- 📊 **상태 모니터링**: 배포 상태 및 사이트 목록 확인
- 🤖 **AI 친화적**: Claude Desktop, Cursor 등 MCP 호스트와 연동
- 🛠️ **CLI 도구**: 터미널에서 직접 배포 및 관리 (`miridev deploy` / `miridev domains`)

> 폴더에 `index.html`을 두면 됩니다(HTML 파일이 1개면 자동으로 index 인식). `assets/`, `img/` 같은 **하위 폴더도 그대로 서빙**되니 평탄화할 필요가 없습니다.

## 🔧 MCP 도구

| 도구 | 설명 |
| --- | --- |
| `deploy_website(projectPath, siteName?, projectName?)` | 폴더 배포. `projectName` 지정 시 고정 URL |
| `login_miridev` | 로그인 (영구 배포) |
| `check_auth_status` | 로그인 상태 확인 |
| `get_deployment_status` | 최근 배포 상태 |

커스텀 도메인은 MCP 도구가 아니라 웹/CLI로 신청합니다: [miridev-cli](https://www.npmjs.com/package/miridev-cli) `miridev domains add`, 또는 https://www.miri.dev/my-page

## 🔧 Claude Desktop 설정

### 1. 설정 파일 위치

```bash
# macOS
~/Library/Application Support/Claude/claude_desktop_config.json

# Windows  
%APPDATA%/Claude/claude_desktop_config.json
```

### 2. MCP 서버 설정 추가

**권장 방법 (NPX):**
```json
{
  "mcpServers": {
    "miridev": {
      "command": "npx",
      "args": ["miridev-mcp", "server"]
    }
  }
}
```

**로컬 설치 방법:**
```json
{
  "mcpServers": {
    "miridev": {
      "command": "node",
      "args": ["/절대경로/miridev-mcp/src/index.js"]
    }
  }
}
```



## 🎯 MCP 도구

Claude Desktop에서 사용할 수 있는 도구들:

- `deploy_website`: 웹사이트 배포
- `check_auth_status`: 인증 상태 확인  
- `login_miridev`: 로그인 관리
- `get_deployment_status`: 배포 상태 확인
- `deployment-guide`: 프로젝트별 배포 가이드

## 🖥️ CLI 사용법

### 설치
```bash
npm install -g miridev-mcp
```

### 기본 명령어
```bash
# 로그인
miri-mcp login
miri-mcp login --email your@email.com --password yourpassword

# 배포
miri-mcp deploy
miri-mcp deploy --path ./my-project --name my-site

# 상태 확인
miri-mcp status

# 로그아웃
miri-mcp logout

# MCP 서버 모드 (Claude Desktop용)
miri-mcp server

# Claude Desktop 설정 자동 추가
miri-mcp config --claude
```

## 💬 AI 사용 예시

Claude Desktop에서 이렇게 요청하세요:

```
"내 포트폴리오 웹사이트를 miri.dev에 배포해줘"
"./my-project 폴더를 'my-portfolio'라는 이름으로 배포하라"
"React 프로젝트 배포 가이드를 만들어줘"
"배포 상태 확인해줘"
```

## 🔧 문제 해결

### 로그인 에러 발생 시
- **증상**: readline ERR_USE_AFTER_CLOSE 에러
- **해결**: CLI 플래그 사용 `miri-mcp login --email your@email.com --password password`

### Claude Desktop 연동 안 될 때
1. Claude Desktop 재시작
2. 설정 파일 경로 확인
3. `miri-mcp config --claude` 명령으로 자동 설정

### 테스트 실행 시 ES Module 에러
- Jest + Babel 설정이 자동으로 ES Module을 처리합니다
- `npm test` 실행 전 의존성 설치: `npm install`

## 📞 지원

- 🌐 [miri.dev](https://www.miri.dev)
- 📖 [docs.miri.dev](https://docs.miri.dev)
- 🐛 [GitHub Issues](https://github.com/hongsw/www.miri.dev/issues)

---

**즐거운 배포 되세요! 🚀✨** 