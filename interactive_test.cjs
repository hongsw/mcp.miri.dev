#!/usr/bin/env node

const { spawn } = require('child_process');
const readline = require('readline');

console.log('🎯 MCP 실제 사용 시나리오 테스트\n');
console.log('실제 Claude Desktop에서 artifact를 생성했다고 가정하고 테스트합니다.\n');

// MCP 서버 시작
const mcpServer = spawn('node', ['src/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let requestId = 1;

// 서버 출력 처리
mcpServer.stdout.on('data', (data) => {
  const output = data.toString().trim();
  if (output) {
    try {
      const response = JSON.parse(output);
      if (response.result && response.result.content) {
        console.log('\n📤 MCP 응답:');
        response.result.content.forEach(content => {
          console.log(content.text);
        });
      } else if (response.result && response.result.tools) {
        console.log('\n🛠️  사용 가능한 도구들:');
        response.result.tools.forEach(tool => {
          console.log(`- ${tool.name}: ${tool.description}`);
        });
      } else if (response.result && response.result.resources) {
        console.log('\n📚 사용 가능한 리소스들:');
        response.result.resources.forEach(resource => {
          console.log(`- ${resource.name}: ${resource.description}`);
        });
      }
    } catch (e) {
      console.log('📤 서버 응답:', output);
    }
  }
});

mcpServer.stderr.on('data', (data) => {
  const output = data.toString().trim();
  if (output) {
    console.log('📝 서버 로그:', output);
  }
});

// 대화형 인터페이스
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function sendRequest(method, params = {}) {
  const request = JSON.stringify({
    jsonrpc: "2.0",
    id: requestId++,
    method: method,
    params: params
  }) + '\n';
  
  mcpServer.stdin.write(request);
}

function askQuestion(question, callback) {
  rl.question(question, callback);
}

// 테스트 시나리오 시작
setTimeout(() => {
  console.log('1️⃣ 먼저 사용 가능한 도구들을 확인해보겠습니다...\n');
  sendRequest('tools/list');
  
  setTimeout(() => {
    console.log('\n2️⃣ 배포 가이드 리소스를 확인해보겠습니다...\n');
    sendRequest('resources/list');
    
    setTimeout(() => {
      console.log('\n3️⃣ 이제 실제 artifact 등록을 시뮬레이션해보겠습니다...\n');
      
      askQuestion('🎨 Claude Desktop에서 생성한 artifact ID를 입력하세요 (예: artifact_1234567890): ', (artifactId) => {
        askQuestion('📁 프로젝트 이름을 입력하세요: ', (projectName) => {
          askQuestion('📝 프로젝트 설명을 입력하세요 (선택사항, Enter로 건너뛰기): ', (description) => {
            
            console.log(`\n🔄 Artifact 등록 중: ${artifactId}`);
            sendRequest('tools/call', {
              name: 'register_current_artifact',
              arguments: {
                artifactId: artifactId,
                projectName: projectName,
                description: description || undefined
              }
            });
            
            setTimeout(() => {
              console.log('\n4️⃣ 배포 준비 확인...\n');
              sendRequest('tools/call', {
                name: 'deploy_current_artifact',
                arguments: {
                  artifactId: artifactId
                }
              });
              
              setTimeout(() => {
                askQuestion('\n🚀 실제 HTML 내용을 가지고 있다면 배포를 테스트해보시겠습니까? (y/n): ', (answer) => {
                  if (answer.toLowerCase() === 'y') {
                    console.log('\n💡 실제로는 여기서 Claude Desktop의 artifact HTML 내용을 가져와야 합니다.');
                    console.log('테스트용 간단한 HTML로 배포해보겠습니다...\n');
                    
                    const testHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2563eb; }
        .info { background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>🎉 ${projectName}</h1>
    <div class="info">
        <p><strong>Artifact ID:</strong> ${artifactId}</p>
        <p><strong>설명:</strong> ${description || '설명 없음'}</p>
        <p><strong>배포 시간:</strong> ${new Date().toLocaleString()}</p>
    </div>
    <p>이 페이지는 MCP를 통해 배포된 테스트 페이지입니다!</p>
    <script>
        console.log('MCP 배포 테스트 성공!');
        document.addEventListener('DOMContentLoaded', function() {
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.5s';
            setTimeout(() => { document.body.style.opacity = '1'; }, 100);
        });
    </script>
</body>
</html>`;
                    
                    sendRequest('tools/call', {
                      name: 'deploy_with_html',
                      arguments: {
                        artifactId: artifactId,
                        htmlContent: testHtml
                      }
                    });
                    
                    setTimeout(() => {
                      console.log('\n✅ 테스트 완료!');
                      console.log('\n📋 실제 사용법 요약:');
                      console.log('1. Claude Desktop에서 artifact 생성');
                      console.log('2. register_current_artifact로 등록');
                      console.log('3. deploy_current_artifact로 배포 안내 확인');
                      console.log('4. artifact HTML 내용 복사');
                      console.log('5. deploy_with_html로 실제 배포');
                      
                      rl.close();
                      mcpServer.kill();
                    }, 3000);
                  } else {
                    console.log('\n✅ 테스트 완료!');
                    console.log('실제 배포는 Claude Desktop에서 artifact HTML 내용과 함께 deploy_with_html을 사용하세요.');
                    rl.close();
                    mcpServer.kill();
                  }
                });
              }, 2000);
            }, 2000);
          });
        });
      });
    }, 2000);
  }, 2000);
}, 1000);

mcpServer.on('close', (code) => {
  console.log(`\n🏁 MCP 서버 종료 (코드: ${code})`);
  process.exit(0);
});

mcpServer.on('error', (error) => {
  console.error('❌ MCP 서버 오류:', error);
  rl.close();
  process.exit(1);
}); 