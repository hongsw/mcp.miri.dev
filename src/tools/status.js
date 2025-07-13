import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import fetch from 'node-fetch';
import chalk from 'chalk';

class MiriDevStatusTool {
  constructor () {
    this.apiBaseUrl = 'https://www.miri.dev/api';
    this.configDir = path.join(os.homedir(), '.miridev');
    this.statusFile = path.join(this.configDir, 'last-deployment.json');
  }

  /**
   * 전체 상태 확인
   */
  async getStatus () {
    try {
      const authStatus = await this.getAuthStatus();
      const deploymentStatus = await this.getLastDeploymentStatus();
      const systemStatus = await this.getSystemStatus();

      let message = '🔍 miri.dev 상태 현황\n\n';

      // 인증 상태
      message += `🔐 인증 상태: ${authStatus.isAuthenticated ? '✅ 로그인됨' : '❌ 로그인 필요'}\n`;
      if (authStatus.user) {
        message += `👤 사용자: ${authStatus.user.name} (${authStatus.user.email})\n`;
        message += `📋 플랜: ${authStatus.user.plan}\n`;
      }
      message += '\n';

      // 최근 배포 상태
      if (deploymentStatus.hasDeployment) {
        message += '📊 최근 배포 정보\n';
        message += `🌐 URL: ${deploymentStatus.url}\n`;
        message += `🆔 사이트 ID: ${deploymentStatus.siteId}\n`;
        message += `⏰ 배포 시간: ${deploymentStatus.deployedAt}\n`;
        message += `📁 파일 수: ${deploymentStatus.fileCount}개\n`;
      } else {
        message += '📊 최근 배포: 없음\n';
      }
      message += '\n';

      // 시스템 상태
      message += `🏥 miri.dev 서비스 상태: ${systemStatus.status}\n`;
      if (systemStatus.version) {
        message += `🔧 서비스 버전: ${systemStatus.version}\n`;
      }

      return {
        success: true,
        message
      };
    } catch (error) {
      return {
        success: false,
        message: `상태 확인 중 오류가 발생했습니다: ${error.message}`
      };
    }
  }

  /**
   * 인증 상태 확인
   */
  async getAuthStatus () {
    try {
      const authFile = path.join(this.configDir, 'auth.json');

      if (!(await fs.pathExists(authFile))) {
        return { isAuthenticated: false };
      }

      const authData = await fs.readJson(authFile);

      // 토큰 만료 확인
      if (new Date() > new Date(authData.expiresAt)) {
        return { isAuthenticated: false };
      }

      return {
        isAuthenticated: true,
        user: authData
      };
    } catch (error) {
      return { isAuthenticated: false };
    }
  }

  /**
   * 마지막 배포 상태 확인
   */
  async getLastDeploymentStatus () {
    try {
      if (!(await fs.pathExists(this.statusFile))) {
        return { hasDeployment: false };
      }

      const statusData = await fs.readJson(this.statusFile);

      return {
        hasDeployment: true,
        url: statusData.url,
        siteId: statusData.siteId,
        deployedAt: new Date(statusData.deployedAt).toLocaleString(),
        fileCount: statusData.fileCount || 0
      };
    } catch (error) {
      return { hasDeployment: false };
    }
  }

  /**
   * 시스템 상태 확인
   */
  async getSystemStatus () {
    try {
      const response = await fetch('https://www.miri.dev', {
        method: 'HEAD',
        headers: {
          'User-Agent': 'miri-dev-mcp-client/1.0.0',
        },
        timeout: 5000
      });

      if (response.ok) {
        return {
          status: '🟢 정상',
          version: 'unknown'
        };
      } else {
        return {
          status: '🟡 불안정',
          version: null
        };
      }
    } catch (error) {
      return {
        status: '🔴 접속 불가',
        version: null
      };
    }
  }

  /**
   * 배포 상태 저장
   */
  async saveDeploymentStatus (deploymentInfo) {
    try {
      await fs.ensureDir(this.configDir);

      const statusData = {
        url: deploymentInfo.url,
        siteId: deploymentInfo.siteId,
        deployedAt: new Date().toISOString(),
        fileCount: deploymentInfo.fileCount
      };

      await fs.writeJson(this.statusFile, statusData, { spaces: 2 });
    } catch (error) {
      console.error(chalk.yellow('⚠️  배포 상태 저장 실패:', error.message));
    }
  }

  /**
   * 사이트 목록 가져오기
   */
  async getSitesList () {
    try {
      const authStatus = await this.getAuthStatus();

      if (!authStatus.isAuthenticated) {
        return {
          success: false,
          message: '사이트 목록을 보려면 로그인이 필요합니다.'
        };
      }

      // TODO: API를 통한 사이트 목록 조회 구현
      // 현재는 로컬 저장된 정보만 반환
      const deploymentStatus = await this.getLastDeploymentStatus();

      if (deploymentStatus.hasDeployment) {
        return {
          success: true,
          message: `📋 내 사이트 목록\n\n🌐 ${deploymentStatus.url}\n🆔 ${deploymentStatus.siteId}\n⏰ ${deploymentStatus.deployedAt}`
        };
      } else {
        return {
          success: true,
          message: '배포된 사이트가 없습니다.'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `사이트 목록 조회 중 오류: ${error.message}`
      };
    }
  }

  /**
   * 배포 기록 정리
   */
  async clearDeploymentHistory () {
    try {
      if (await fs.pathExists(this.statusFile)) {
        await fs.remove(this.statusFile);
      }

      return {
        success: true,
        message: '배포 기록이 정리되었습니다.'
      };
    } catch (error) {
      return {
        success: false,
        message: `배포 기록 정리 중 오류: ${error.message}`
      };
    }
  }
}

export { MiriDevStatusTool };
