const { MiriDevDeployTool } = require('../src/tools/deploy.js');
const fs = require('fs-extra');
const path = require('path');

const deployTool = new MiriDevDeployTool();

// fetch 모킹
jest.mock('node-fetch');

describe('Deploy Tool Tests', () => {
  beforeEach(() => {
    if (global.fetch && typeof global.fetch.mockClear === 'function') {
      global.fetch.mockClear();
    }
  });

  describe('기본 기능', () => {
    test('존재하지 않는 디렉토리 배포 실패', async () => {
      const result = await deployTool.deploy('/non-existent-directory');

      expect(result.success).toBe(false);
      expect(result.error).toContain('디렉토리를 찾을 수 없습니다');
    });

    test('index.html이 없는 디렉토리 배포 실패', async () => {
      // 임시 디렉토리 생성 (index.html 없음)
      const tempDir = path.join(global.testConfig.tempDir, 'no-index');
      await fs.ensureDir(tempDir);

      const result = await deployTool.deploy(tempDir);

      expect(result.success).toBe(false);
      expect(result.error).toContain('index.html 파일이 필요합니다');
    });
  });
});
