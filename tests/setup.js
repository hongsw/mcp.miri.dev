// Jest 테스트 설정
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

// 테스트용 환경 변수 설정
process.env.NODE_ENV = 'test';
process.env.MIRI_API_URL = 'https://www.miri.dev/api';

// 테스트용 임시 디렉토리
const testTempDir = path.join(os.tmpdir(), 'miridev-mcp-test', Date.now().toString());

// 전역 테스트 설정
global.testConfig = {
  tempDir: testTempDir,
  mockAuthFile: path.join(testTempDir, '.miridev', 'auth.json'),
  testProject: path.join(testTempDir, 'test-project'),
  testEmail: 'test@miri.dev',
  testPassword: '123',
  timeout: 30000
};

// 테스트 시작 전 설정
beforeAll(async () => {
  // 임시 디렉토리 생성
  await fs.ensureDir(global.testConfig.tempDir);
  await fs.ensureDir(path.dirname(global.testConfig.mockAuthFile));
  await fs.ensureDir(global.testConfig.testProject);
  
  // 테스트용 index.html 생성
  const testHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCP 테스트 사이트</title>
</head>
<body>
    <h1>Hello from MCP Test!</h1>
    <p>이것은 테스트용 웹사이트입니다.</p>
</body>
</html>`;
  
  await fs.writeFile(path.join(global.testConfig.testProject, 'index.html'), testHtml);
});

// 테스트 완료 후 정리
afterAll(async () => {
  // 임시 파일들 정리
  if (await fs.pathExists(global.testConfig.tempDir)) {
    await fs.remove(global.testConfig.tempDir);
  }
});

// 각 테스트 후 정리 
afterEach(async () => {
  // 인증 파일 정리 (각 테스트가 독립적으로 실행되도록)
  if (await fs.pathExists(global.testConfig.mockAuthFile)) {
    await fs.remove(global.testConfig.mockAuthFile);
  }
});

// 네트워크 요청 모킹을 위한 헬퍼
global.mockFetch = (response) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response))
    })
  );
};

// 에러 응답 모킹
global.mockFetchError = (status = 400, message = 'Bad Request') => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: false,
      status,
      json: () => Promise.resolve({ error: message }),
      text: () => Promise.resolve(JSON.stringify(message))
    })
  );
};
