import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import inquirer from 'inquirer';
import chalk from 'chalk';

class MiriDevAuthTool {
  constructor () {
    this.configDir = path.join(os.homedir(), '.miridev');
    this.authFile = path.join(this.configDir, 'auth.json');

    // 개발용 하드코딩된 계정 정보
    this.validAccounts = {
      'hongbuzz@gmail.com': {
        password: '123',
        id: 'user-hongbuzz-001',
        plan: 'basic',
        name: 'Hong Buzz'
      },
      'test@miri.dev': {
        password: '123',
        id: 'user-test-001',
        plan: 'basic',
        name: 'Test User'
      },
      'admin@miri.dev': {
        password: 'admin123',
        id: 'user-admin-001',
        plan: 'premium',
        name: 'Admin User'
      }
    };
  }

  /**
   * 로그인 상태 확인 (간단)
   */
  async checkAuthStatus () {
    try {
      const authData = await this.loadAuth();
      if (!authData) return false;

      // 토큰 만료 확인
      if (new Date() > new Date(authData.expiresAt)) {
        await this.logout();
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 상세 인증 상태 확인
   */
  async getDetailedStatus () {
    try {
      const authData = await this.loadAuth();

      if (!authData) {
        return {
          isAuthenticated: false,
          details: '로그인이 필요합니다.'
        };
      }

      const now = new Date();
      const expiresAt = new Date(authData.expiresAt);

      if (now > expiresAt) {
        await this.logout();
        return {
          isAuthenticated: false,
          details: '토큰이 만료되었습니다. 다시 로그인해주세요.'
        };
      }

      const remainingDays = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));

      return {
        isAuthenticated: true,
        details: `사용자: ${authData.name} (${authData.email})\n플랜: ${authData.plan}\n만료일: ${expiresAt.toLocaleDateString()} (${remainingDays}일 남음)`
      };
    } catch (error) {
      return {
        isAuthenticated: false,
        details: `인증 상태 확인 중 오류: ${error.message}`
      };
    }
  }

  /**
   * 로그인
   */
  async login (force = false) {
    try {
      // 이미 로그인된 상태인지 확인
      if (!force && await this.checkAuthStatus()) {
        const currentUser = await this.loadAuth();
        return {
          success: true,
          message: `이미 ${currentUser.name}(${currentUser.email})로 로그인되어 있습니다.`
        };
      }

      console.error(chalk.blue('🔐 miri.dev 로그인'));
      console.error(chalk.gray('개발용 계정:'));
      console.error(chalk.gray('- hongbuzz@gmail.com / 123'));
      console.error(chalk.gray('- test@miri.dev / 123'));
      console.error(chalk.gray('- admin@miri.dev / admin123'));
      console.error('');

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'email',
          message: '이메일:',
          validate: (input) => {
            if (!input) return '이메일을 입력해주세요.';
            if (!input.includes('@')) return '올바른 이메일 형식이 아닙니다.';
            return true;
          }
        },
        {
          type: 'password',
          name: 'password',
          message: '비밀번호:',
          validate: (input) => {
            if (!input) return '비밀번호를 입력해주세요.';
            return true;
          }
        }
      ]);

      // 계정 검증
      const account = this.validAccounts[answers.email.toLowerCase()];
      if (!account || account.password !== answers.password) {
        return {
          success: false,
          error: '이메일 또는 비밀번호가 올바르지 않습니다.'
        };
      }

      // 사용자 정보 생성
      const user = {
        email: answers.email.toLowerCase(),
        id: account.id,
        plan: account.plan,
        name: account.name,
        loginAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일
        token: this.generateToken()
      };

      // 인증 정보 저장
      await this.saveAuth(user);

      return {
        success: true,
        message: `${user.name}(${user.email})로 성공적으로 로그인되었습니다.\n플랜: ${user.plan}\n토큰 만료일: ${new Date(user.expiresAt).toLocaleDateString()}`
      };
    } catch (error) {
      return {
        success: false,
        error: `로그인 중 오류가 발생했습니다: ${error.message}`
      };
    }
  }

  /**
   * 로그아웃
   */
  async logout () {
    try {
      if (await fs.pathExists(this.authFile)) {
        await fs.remove(this.authFile);
      }
      return {
        success: true,
        message: '로그아웃되었습니다.'
      };
    } catch (error) {
      return {
        success: false,
        error: `로그아웃 중 오류가 발생했습니다: ${error.message}`
      };
    }
  }

  /**
   * 현재 사용자 정보 가져오기
   */
  async getCurrentUser () {
    try {
      const authData = await this.loadAuth();
      if (!authData) return null;

      // 토큰 만료 확인
      if (new Date() > new Date(authData.expiresAt)) {
        await this.logout();
        return null;
      }

      return authData;
    } catch (error) {
      return null;
    }
  }

  /**
   * 인증 토큰 가져오기
   */
  async getAuthToken () {
    try {
      const authData = await this.loadAuth();
      if (!authData) return null;

      // 토큰 만료 확인
      if (new Date() > new Date(authData.expiresAt)) {
        await this.logout();
        return null;
      }

      return authData.token;
    } catch (error) {
      return null;
    }
  }

  /**
   * 인증 정보 저장
   */
  async saveAuth (authData) {
    await fs.ensureDir(this.configDir);
    await fs.writeJson(this.authFile, authData, { spaces: 2 });
  }

  /**
   * 인증 정보 읽기
   */
  async loadAuth () {
    try {
      if (!(await fs.pathExists(this.authFile))) {
        return null;
      }

      const content = await fs.readFile(this.authFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  /**
   * 토큰 생성
   */
  generateToken () {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * 인증 필요 시 자동 로그인 시도
   */
  async ensureAuthenticated () {
    if (await this.checkAuthStatus()) {
      return { success: true };
    }

    console.error(chalk.yellow('🔐 인증이 필요합니다. 로그인을 진행합니다...'));
    return await this.login();
  }
}

export { MiriDevAuthTool };
