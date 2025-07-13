const { MiriDevAuthTool } = require('../src/tools/auth.js');
const fs = require('fs-extra');
const path = require('path');

const authTool = new MiriDevAuthTool();

// fetch 모킹
jest.mock('node-fetch');

describe('Auth Tool Tests', () => {
  beforeEach(() => {
    // 각 테스트 전에 fetch mock 초기화
    if (global.fetch && typeof global.fetch.mockClear === 'function') {
      global.fetch.mockClear();
    }
  });

  describe('기본 기능', () => {
    test('인증되지 않은 상태에서 false를 반환해야 함', async () => {
      const result = await authTool.checkAuthStatus();
      expect(result).toBe(false);
    });

    test('getCurrentUser - 인증되지 않은 상태에서 null 반환', async () => {
      const user = await authTool.getCurrentUser();
      expect(user).toBeNull();
    });

    test('getAuthToken - 인증되지 않은 상태에서 null 반환', async () => {
      const token = await authTool.getAuthToken();
      expect(token).toBeNull();
    });

    test('로그아웃 성공', async () => {
      const result = await authTool.logout();
      expect(result.success).toBe(true);
      expect(result.message).toContain('로그아웃');
    });
  });

  describe('상세 상태 확인', () => {
    test('인증되지 않은 상태에서 상세 정보 반환', async () => {
      const result = await authTool.getDetailedStatus();
      
      expect(result.isAuthenticated).toBe(false);
      expect(result.details).toContain('로그인이 필요');
    });
  });
}); 