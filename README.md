# 🚀 miri.dev MCP (Model Context Protocol) Tool

[![npm version](https://badge.fury.io/js/miridev-mcp.svg)](https://badge.fury.io/js/miridev-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AI와 자연어로 소통하여 miri.dev에 웹사이트를 배포할 수 있는 MCP(Model Context Protocol) 도구입니다.

## ✨ 주요 기능

- 🚀 **자연어 배포**: "내 홈페이지를 miri.dev에 배포해줘" 같은 명령으로 배포
- 🔐 **간편한 인증**: 이메일/비밀번호로 로그인 (CLI 및 MCP 지원)
- 📊 **상태 모니터링**: 배포 상태 및 사이트 목록 확인
- 🤖 **AI 친화적**: Claude Desktop, ChatGPT 등과 연동
- 🛠️ **CLI 도구**: 터미널에서 직접 배포 및 관리 가능
- ✅ **안정성 개선**: 로그인 에러 수정, 테스트 환경 개선

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