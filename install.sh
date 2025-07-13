#!/bin/bash

echo "🚀 miri.dev MCP Server 설치 중..."

# 현재 디렉토리 확인
MCP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "📂 MCP 디렉토리: $MCP_DIR"

# Node.js 버전 확인
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되어 있지 않습니다."
    echo "   https://nodejs.org에서 Node.js를 설치한 후 다시 시도해주세요."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
echo "✅ Node.js 버전: v$NODE_VERSION"

# npm 설치
echo "📦 의존성 패키지 설치 중..."
cd "$MCP_DIR"
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install 실패"
    exit 1
fi

echo "✅ 패키지 설치 완료"

# 실행 권한 부여
chmod +x "$MCP_DIR/src/index.js"

# Claude Desktop 설정 파일 경로 확인
CONFIG_DIR=""
CONFIG_FILE=""

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    CONFIG_DIR="$HOME/Library/Application Support/Claude"
    CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows
    CONFIG_DIR="$APPDATA/Claude"
    CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"
else
    # Linux
    CONFIG_DIR="$HOME/.config/claude"
    CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"
fi

echo ""
echo "🔧 Claude Desktop 설정 안내"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "다음 설정을 Claude Desktop 설정 파일에 추가해주세요:"
echo ""
echo "📁 설정 파일 경로: $CONFIG_FILE"
echo ""
echo "📄 추가할 내용:"
echo ""
cat << EOF
{
  "mcpServers": {
    "miridev": {
      "command": "node",
      "args": ["$MCP_DIR/src/index.js"],
      "env": {
        "MIRI_API_URL": "https://www.miri.dev/api"
      }
    }
  }
}
EOF

echo ""

# 설정 파일 자동 생성 제안
echo "📝 설정 파일을 자동으로 생성하시겠습니까? (y/N)"
read -r SETUP_CONFIG

if [[ $SETUP_CONFIG =~ ^[Yy]$ ]]; then
    # 디렉토리 생성
    mkdir -p "$CONFIG_DIR"
    
    # 기존 설정 파일 확인
    if [ -f "$CONFIG_FILE" ]; then
        echo "⚠️  기존 설정 파일이 존재합니다. 백업을 만듭니다..."
        cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
        echo "✅ 백업 완료: $CONFIG_FILE.backup.*"
    fi
    
    # 새 설정 파일 생성
    cat > "$CONFIG_FILE" << EOF
{
  "mcpServers": {
    "miridev": {
      "command": "node",
      "args": ["$MCP_DIR/src/index.js"],
      "env": {
        "MIRI_API_URL": "https://www.miri.dev/api"
      }
    }
  }
}
EOF
    
    echo "✅ Claude Desktop 설정 파일이 생성되었습니다!"
    echo "📍 위치: $CONFIG_FILE"
else
    echo "⏭️  수동 설정을 선택하셨습니다."
fi

# 테스트 파일 생성
echo ""
echo "📋 테스트 파일 생성 중..."
mkdir -p "$MCP_DIR/test-site"

cat > "$MCP_DIR/test-site/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>miri.dev MCP 테스트 사이트</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.6;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
        }
        .success {
            background: rgba(76, 175, 80, 0.2);
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin: 20px 0;
            border: 1px solid rgba(76, 175, 80, 0.3);
        }
        .info {
            background: rgba(33, 150, 243, 0.2);
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            border: 1px solid rgba(33, 150, 243, 0.3);
        }
        .timestamp {
            text-align: center;
            margin-top: 30px;
            opacity: 0.8;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 miri.dev MCP Server</h1>
        
        <div class="success">
            <h2>✅ 배포 성공!</h2>
            <p>MCP 서버를 통한 자동 배포가 성공적으로 완료되었습니다.</p>
        </div>
        
        <div class="info">
            <h3>🤖 자연어 배포 테스트</h3>
            <p>이 사이트는 "홈페이지를 miri.dev에 배포하라" 명령으로 배포되었습니다.</p>
        </div>
        
        <div class="info">
            <h3>🛠 주요 기능</h3>
            <ul>
                <li>자연어 명령을 통한 배포</li>
                <li>자동 인증 처리</li>
                <li>한글 파일명 자동 변환</li>
                <li>실시간 상태 확인</li>
            </ul>
        </div>
        
        <div class="timestamp">
            배포 시간: <span id="deployTime"></span>
        </div>
    </div>
    
    <script>
        document.getElementById('deployTime').textContent = new Date().toLocaleString();
    </script>
</body>
</html>
EOF

echo "✅ 테스트 사이트 생성 완료: $MCP_DIR/test-site/"

# 최종 안내
echo ""
echo "🎉 miri.dev MCP Server 설치 완료!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔄 다음 단계:"
echo "1. Claude Desktop을 재시작하세요"
echo "2. Claude에서 다음과 같이 말해보세요:"
echo "   \"홈페이지를 miri.dev에 배포하라\""
echo ""
echo "🧪 테스트 배포:"
echo "   cd $MCP_DIR/test-site && Claude에서 배포 명령 실행"
echo ""
echo "📚 문서: $MCP_DIR/README.md"
echo ""
echo "✨ 즐거운 배포 되세요!" 