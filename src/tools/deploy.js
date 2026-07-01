import fs from 'fs-extra';
import path from 'path';
import { promisify } from 'util';
import glob from 'glob';
import chalk from 'chalk';
import FormData from 'form-data';
import fetch from 'node-fetch';
import mimeTypes from 'mime-types';
import { MiriDevAuthTool } from './auth.js';

// glob을 promisify해서 사용
const globAsync = promisify(glob);

class MiriDevDeployTool {
  constructor () {
    this.apiBaseUrl = 'https://www.miri.dev/api';
    this.authTool = new MiriDevAuthTool();
  }

  /**
   * 배포 실행
   */
  async deploy (projectPath = '.', siteName = null, projectName = null) {
    try {
      console.error(chalk.blue('🚀 배포를 시작합니다...'));

      const deployDir = path.resolve(projectPath);
      console.error(chalk.gray(`📂 배포 디렉토리: ${deployDir}`));

      // 1. 디렉토리 검증
      if (!(await fs.pathExists(deployDir))) {
        return {
          success: false,
          error: `디렉토리를 찾을 수 없습니다: ${deployDir}`
        };
      }

      // 2. index.html 파일 확인
      const indexPath = path.join(deployDir, 'index.html');
      if (!(await fs.pathExists(indexPath))) {
        return {
          success: false,
          error: 'index.html 파일이 필요합니다. 프로젝트 루트에 index.html을 만들어주세요.'
        };
      }

      // 3. 파일 스캔
      console.error(chalk.gray('📋 파일을 스캔중입니다...'));
      const files = await this.scanFiles(deployDir);

      if (files.length === 0) {
        return {
          success: false,
          error: '배포할 파일을 찾을 수 없습니다.'
        };
      }

      console.error(chalk.cyan(`📁 발견된 파일: ${files.length}개`));

      // 4. 파일명 안전성 검사
      const unsafeFiles = await this.checkUnsafeFiles(files);
      if (unsafeFiles.length > 0) {
        console.error(chalk.yellow('⚠️  안전하지 않은 파일명이 발견되었습니다:'));
        for (const file of unsafeFiles) {
          console.error(`  ❌ ${file.original} → ✅ ${file.safe}`);
        }

        // 자동으로 파일명 변경
        await this.sanitizeFileNames(deployDir, unsafeFiles);
        console.error(chalk.green('✅ 파일명이 안전하게 변경되었습니다.'));

        // 파일 목록 다시 스캔
        console.error(chalk.gray('📋 파일을 다시 스캔중입니다...'));
        const newFiles = await this.scanFiles(deployDir);
        return await this.deployFiles(newFiles, siteName, { projectPath: deployDir, projectName });
      }

      // 5. 실제 배포
      return await this.deployFiles(files, siteName, { projectPath: deployDir, projectName });
    } catch (error) {
      console.error(chalk.red('배포 중 오류:', error.message));
      return {
        success: false,
        error: `배포 중 오류가 발생했습니다: ${error.message}`
      };
    }
  }

  /**
   * 파일 스캔
   */
  async scanFiles (deployDir) {
    const files = [];
    const patterns = [
      '**/*.html',
      '**/*.css',
      '**/*.js',
      '**/*.json',
      '**/*.txt',
      '**/*.md',
      '**/*.png',
      '**/*.jpg',
      '**/*.jpeg',
      '**/*.gif',
      '**/*.svg',
      '**/*.ico',
      '**/*.woff',
      '**/*.woff2',
      '**/*.ttf',
      '**/*.eot'
    ];

    for (const pattern of patterns) {
      const matches = await globAsync(pattern, {
        cwd: deployDir,
        absolute: false,
        dot: false,
        ignore: [
          'node_modules/**',
          '.git/**',
          '.*',
          '**/.DS_Store',
          '**/Thumbs.db'
        ]
      });

      for (const match of matches) {
        const fullPath = path.join(deployDir, match);
        const stats = await fs.stat(fullPath);

        if (stats.isFile() && stats.size <= 25 * 1024 * 1024) { // 25MB 제한
          files.push({
            path: match,
            fullPath,
            size: stats.size,
            mimeType: mimeTypes.lookup(match) || 'application/octet-stream'
          });
        }
      }
    }

    return files.sort((a, b) => a.path.localeCompare(b.path));
  }

  /**
   * 안전하지 않은 파일명 검사
   */
  async checkUnsafeFiles (files) {
    const unsafeFiles = [];

    for (const file of files) {
      const fileName = path.basename(file.path);
      if (this.isFileNameUnsafe(fileName)) {
        const safeName = this.sanitizeFileName(fileName);
        const safePath = path.join(path.dirname(file.path), safeName);

        unsafeFiles.push({
          original: file.path,
          safe: safePath,
          originalName: fileName,
          safeName
        });
      }
    }

    return unsafeFiles;
  }

  /**
   * 파일명이 안전하지 않은지 확인
   */
  isFileNameUnsafe (fileName) {
    // 한글, 특수문자, 공백 등 확인
    const unsafePattern = /[가-힣ㄱ-ㅎㅏ-ㅣ\s[\](){}!@#$%^&*+=|\\:;"'<>,?~`]/;
    return unsafePattern.test(fileName);
  }

  /**
   * 안전한 파일명으로 변환
   */
  sanitizeFileName (fileName) {
    const ext = path.extname(fileName);
    // 타임스탬프 기반 파일명 생성
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);

    return `${timestamp}${randomSuffix}${ext}`;
  }

  /**
   * 파일명 일괄 변경
   */
  async sanitizeFileNames (deployDir, unsafeFiles) {
    for (const file of unsafeFiles) {
      const oldPath = path.join(deployDir, file.original);
      const newPath = path.join(deployDir, file.safe);

      // 디렉토리 생성
      await fs.ensureDir(path.dirname(newPath));

      // 파일 이동
      await fs.move(oldPath, newPath);

      console.error(chalk.gray(`  📝 ${file.original} → ${file.safe}`));
    }
  }

  /**
   * 실제 파일 배포
   */
  async deployFiles (files, siteName, options = {}) {
    try {
      console.error(chalk.blue('📤 파일을 업로드중입니다...'));

      // 1. 로그인 사용자 정보 (로그인 시 실제 계정 → 영구 배포, 게스트는 1시간 임시)
      const user = await this.authTool.getCurrentUser();
      if (user) {
        console.error(chalk.gray(`👤 배포 계정: ${user.email} (plan: ${user.plan || 'basic'})`));
      } else {
        console.error(chalk.yellow('👤 게스트 배포 (1시간 임시). 영구 배포는 login_miridev로 로그인하세요.'));
      }

      // 2. 프로젝트(고정 URL) 바인딩: 프로젝트 폴더의 .miri-project.json 우선, projectName으로 신규 생성
      const projectDir = options.projectPath ? path.resolve(options.projectPath) : process.cwd();
      const projectFile = path.join(projectDir, '.miri-project.json');
      let project = null;
      if (await fs.pathExists(projectFile)) {
        try { project = await fs.readJson(projectFile); } catch (_) { project = null; }
      }
      if ((!project || !project.id) && options.projectName) {
        project = { name: options.projectName };
      }
      if (project && (project.id || project.name)) {
        if (!user) {
          console.error(chalk.yellow('⚠️  프로젝트(고정 URL)는 로그인이 필요합니다. 이번에는 일반 배포로 진행합니다.'));
        } else if (project.id) {
          console.error(chalk.cyan(`📌 프로젝트 재배포: ${project.name || project.id} (고정 URL 유지)`));
        } else {
          console.error(chalk.cyan(`📌 프로젝트 신규 생성: ${project.name} → 고정 URL 확보`));
        }
      }

      // FormData 빌더 (stream은 재사용 불가 → 리다이렉트 재시도 시 buffer 사용)
      const buildForm = async (useBuffers) => {
        const form = new FormData();
        if (siteName) form.append('siteName', siteName);
        for (const file of files) {
          const data = useBuffers
            ? await fs.readFile(file.fullPath)
            : fs.createReadStream(file.fullPath);
          form.append('files', data, { filename: file.path, contentType: file.mimeType });
        }
        // 인증 필드
        if (user) {
          form.append('userEmail', user.email || '');
          form.append('userId', user.id || '');
          form.append('userPlan', user.plan || 'basic');
        } else {
          form.append('userEmail', '');
          form.append('userId', '');
          form.append('userPlan', 'guest');
        }
        form.append('currentSiteCount', '0');
        // 프로젝트(고정 URL) 필드 — 서버는 로그인 사용자에 한해 처리
        if (project?.id) form.append('projectId', project.id);
        else if (project?.name) form.append('projectName', project.name);
        return form;
      };

      const authHeaders = () => (user?.token ? { Authorization: `Bearer ${user.token}` } : {});

      // 3. 최초 요청 (리다이렉트 수동 처리)
      const formData = await buildForm(false);
      const response = await fetch(`${this.apiBaseUrl}/deploy`, {
        method: 'POST',
        body: formData,
        headers: { ...formData.getHeaders(), ...authHeaders() },
        redirect: 'manual',
        follow: 0
      });

      // 4. 리다이렉트 응답 처리 (buffer로 재구성 + Authorization 재첨부)
      let finalResponse = response;
      if (response.status >= 300 && response.status < 400) {
        const redirectUrl = response.headers.get('location');
        if (redirectUrl) {
          const newFormData = await buildForm(true);
          finalResponse = await fetch(redirectUrl, {
            method: 'POST',
            body: newFormData,
            headers: { ...newFormData.getHeaders(), ...authHeaders() }
          });
        }
      }

      if (!finalResponse.ok) {
        const errorText = await finalResponse.text();
        throw new Error(`HTTP ${finalResponse.status}: ${errorText}`);
      }

      const result = await finalResponse.json();
      if (result.error) {
        return { success: false, error: result.error };
      }

      console.error(chalk.green('✅ 업로드 완료!'));

      // 5. 프로젝트(고정 URL) 결과 저장 → 다음 배포부터 같은 URL 재사용
      let fixedUrl = null;
      if (result.project?.id) {
        const fullDomain = result.project.fullDomain
          || (result.project.subdomain ? `${result.project.subdomain}.miri.dev` : null);
        if (fullDomain) fixedUrl = `https://${fullDomain}`;
        try {
          await fs.writeJson(projectFile, {
            id: result.project.id,
            name: result.project.name || project?.name || null,
            subdomain: result.project.subdomain || null,
            fullDomain
          }, { spaces: 2 });
        } catch (_) { /* 저장 실패해도 배포는 성공 */ }
      }

      return {
        success: true,
        url: result.site?.url || result.url,
        fixedUrl,
        project: result.project || null,
        siteId: result.site?.id || result.siteId,
        title: result.site?.title || result.title || 'Untitled Site',
        fileCount: files.length,
        message: '웹사이트가 성공적으로 배포되었습니다! 🎉'
      };
    } catch (error) {
      return {
        success: false,
        error: `업로드 실패: ${error.message}`
      };
    }
  }

  /**
   * 자연어 메시지 분석 및 배포 옵션 추출
   */
  parseDeploymentMessage (message) {
    const options = {
      projectPath: '.',
      siteName: null,
      autoOpen: false
    };

    // 프로젝트 경로 추출
    const pathMatch = message.match(/([./][\w./\-_]+)\s*(?:를|을|에서|의)/);
    if (pathMatch) {
      options.projectPath = pathMatch[1];
    }

    // 사이트 이름 추출
    const nameMatch = message.match(/(?:이름은?|명칭은?|사이트명은?)\s*['"]?(\w+)['"]?/);
    if (nameMatch) {
      options.siteName = nameMatch[1];
    }

    // 브라우저 열기 여부
    if (message.includes('열어') || message.includes('브라우저') || message.includes('확인')) {
      options.autoOpen = true;
    }

    return options;
  }
}

export { MiriDevDeployTool };
