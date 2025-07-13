#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');

// 버전 정보
const packageInfo = require('../package.json');

const program = new Command();

// ES Module 도구들을 동적으로 import하는 함수
async function importTools() {
  const [authModule, deployModule, statusModule] = await Promise.all([
    import('../src/tools/auth.js'),
    import('../src/tools/deploy.js'),
    import('../src/tools/status.js')
  ]);
  
  return {
    authTool: new authModule.MiriDevAuthTool(),
    deployTool: new deployModule.MiriDevDeployTool(),
    statusTool: new statusModule.MiriDevStatusTool()
  };
}

// CLI 헤더 출력
function showHeader () {
  console.log(chalk.blue(`
  ███╗   ███╗██╗██████╗ ██╗██████╗ ███████╗██╗   ██╗    ███╗   ███╗ ██████╗██████╗ 
  ████╗ ████║██║██╔══██╗██║██╔══██╗██╔════╝██║   ██║    ████╗ ████║██╔════╝██╔══██╗
  ██╔████╔██║██║██████╔╝██║██║  ██║█████╗  ██║   ██║    ██╔████╔██║██║     ██████╔╝
  ██║╚██╔╝██║██║██╔══██╗██║██║  ██║██╔══╝  ╚██╗ ██╔╝    ██║╚██╔╝██║██║     ██╔═══╝ 
  ██║ ╚═╝ ██║██║██║  ██║██║██████╔╝███████╗ ╚████╔╝     ██║ ╚═╝ ██║╚██████╗██║     
  ╚═╝     ╚═╝╚═╝╚═╝  ╚═╝╚═╝╚═════╝ ╚══════╝  ╚═══╝      ╚═╝     ╚═╝ ╚═════╝╚═╝     
  `));
  console.log(chalk.blue('  🤖 Model Context Protocol & CLI for miri.dev'));
  console.log(chalk.gray('  자연어로 웹사이트를 배포하세요\n'));
}

// 프로그램 설정
program
  .name('miri-mcp')
  .description('Model Context Protocol server and CLI for deploying websites to miri.dev')
  .version(packageInfo.version)
  .option('-v, --verbose', 'verbose output')
  .option('--no-header', 'disable header output');

// 배포 명령어
program
  .command('deploy')
  .alias('d')
  .description('Deploy website to miri.dev')
  .option('-p, --path <path>', 'Project path to deploy', process.cwd())
  .option('-n, --name <name>', 'Site name')
  .option('--message <message>', 'Deployment message', 'Deploy website via CLI')
  .action(async (options) => {
    if (!program.opts().noHeader) showHeader();

    try {
      console.log(chalk.green('🚀 Starting deployment...'));

      const { deployTool } = await importTools();
      const result = await deployTool.deploy(options.path, options.name);

      if (result.success) {
        console.log(chalk.green('✅ Deployment successful!'));
        console.log(chalk.blue(`🌐 Site URL: ${result.url}`));
        if (result.siteId) {
          console.log(chalk.gray(`🆔 Site ID: ${result.siteId}`));
        }
      } else {
        console.log(chalk.red('❌ Deployment failed:'), result.error);
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('❌ Deployment error:'), error.message);
      process.exit(1);
    }
  });

// 로그인 명령어
program
  .command('login')
  .alias('l')
  .description('Login to miri.dev')
  .option('-f, --force', 'Force re-login')
  .action(async (options) => {
    if (!program.opts().noHeader) showHeader();

    try {
      console.log(chalk.green('🔐 Starting login process...'));

      const { authTool } = await importTools();
      const result = await authTool.login(options.force);

      if (result.success) {
        console.log(chalk.green('✅ Login successful!'));
        console.log(chalk.blue(`👤 Logged in as: ${result.message}`));
      } else {
        console.log(chalk.red('❌ Login failed:'), result.error || result.message);
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('❌ Login error:'), error.message);
      process.exit(1);
    }
  });

// 상태 확인 명령어
program
  .command('status')
  .alias('st')
  .description('Check authentication and deployment status')
  .action(async () => {
    if (!program.opts().noHeader) showHeader();

    try {
      console.log(chalk.green('📊 Checking status...'));

      const { authTool, statusTool } = await importTools();

      // 인증 상태 확인
      const authStatus = await authTool.checkAuthStatus();
      console.log(chalk.blue('\n🔐 Authentication Status:'));
      if (authStatus.success && authStatus.isAuthenticated) {
        console.log(chalk.green(`✅ ${authStatus.message}`));
      } else {
        console.log(chalk.yellow('⚠️  Not logged in'));
      }

      // 배포 상태 확인
      const deployStatus = await statusTool.getStatus();
      console.log(chalk.blue('\n📦 Deployment Status:'));
      if (deployStatus.success) {
        console.log(chalk.green(`📊 ${deployStatus.message}`));
      } else {
        console.log(chalk.yellow('📭 No deployment status available'));
      }
    } catch (error) {
      console.error(chalk.red('❌ Status check error:'), error.message);
      process.exit(1);
    }
  });

// 로그아웃 명령어
program
  .command('logout')
  .description('Logout from miri.dev')
  .action(async () => {
    if (!program.opts().noHeader) showHeader();

    try {
      console.log(chalk.green('🚪 Logging out...'));

      const { authTool } = await importTools();
      const result = await authTool.logout();

      if (result.success) {
        console.log(chalk.green('✅ Successfully logged out'));
      } else {
        console.log(chalk.red('❌ Logout failed:'), result.error || result.message);
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('❌ Logout error:'), error.message);
      process.exit(1);
    }
  });

// 서버 모드 명령어
program
  .command('server')
  .alias('srv')
  .description('Start MCP server mode')
  .action(async () => {
    // MCP 서버 모드에서는 STDIN/STDOUT이 JSON-RPC 통신 전용이므로
    // 어떤 콘솔 출력도 하면 안 됩니다

    // MCP 서버 시작 (조용히, ES Module 동적 import 사용)
    try {
      await import('../src/index.js');
    } catch (error) {
      console.error('MCP server start error:', error.message);
      process.exit(1);
    }
  });

// 설정 명령어
program
  .command('config')
  .description('Manage configuration')
  .option('--show', 'Show current configuration')
  .option('--claude', 'Install Claude Desktop configuration')
  .action(async (options) => {
    if (!program.opts().noHeader) showHeader();

    if (options.show) {
      console.log(chalk.blue('📋 Current Configuration:'));
      console.log(chalk.gray(`🏠 Home: ${require('os').homedir()}`));
      console.log(chalk.gray(`📁 Config dir: ${path.join(require('os').homedir(), '.miridev')}`));
      console.log(chalk.gray(`🔧 MCP server: ${path.join(__dirname, '../src/index.js')}`));
    }

    if (options.claude) {
      console.log(chalk.green('🔧 Installing Claude Desktop configuration...'));

      const configPath = process.platform === 'darwin'
        ? path.join(require('os').homedir(), 'Library/Application Support/Claude/claude_desktop_config.json')
        : path.join(require('os').userInfo().homedir, 'AppData/Roaming/Claude/claude_desktop_config.json');

      const mcpConfig = {
        mcpServers: {
          miridev: {
            command: 'node',
            args: [path.join(__dirname, '../src/index.js')],
            env: {
              MIRI_API_URL: 'https://www.miri.dev/api'
            }
          }
        }
      };

      try {
        await fs.ensureDir(path.dirname(configPath));
        let existingConfig = {};
        if (await fs.pathExists(configPath)) {
          existingConfig = await fs.readJson(configPath);
        }

        const updatedConfig = {
          ...existingConfig,
          mcpServers: {
            ...existingConfig.mcpServers,
            ...mcpConfig.mcpServers
          }
        };

        await fs.writeJson(configPath, updatedConfig, { spaces: 2 });

        console.log(chalk.green('✅ Claude Desktop configuration installed!'));
        console.log(chalk.blue(`📁 Config file: ${configPath}`));
        console.log(chalk.yellow('🔄 Please restart Claude Desktop to apply changes'));
      } catch (error) {
        console.error(chalk.red('❌ Configuration error:'), error.message);
        process.exit(1);
      }
    }
  });

// 자연어 처리 명령어
program
  .command('ask <message>')
  .description('Process natural language deployment request')
  .option('-p, --path <path>', 'Project path', process.cwd())
  .action(async (message, options) => {
    if (!program.opts().noHeader) showHeader();

    try {
      console.log(chalk.green('🤖 Processing natural language request...'));
      console.log(chalk.blue(`💬 Message: "${message}"`));

      const { deployTool } = await importTools();
      const result = await deployTool.deploy(options.path);

      if (result.success) {
        console.log(chalk.green('✅ Request processed successfully!'));
        console.log(chalk.blue(`🌐 Site URL: ${result.url}`));
      } else {
        console.log(chalk.red('❌ Request failed:'), result.error);
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('❌ Processing error:'), error.message);
      process.exit(1);
    }
  });

// 도움말 개선
program.on('--help', () => {
  console.log(chalk.blue('\n💡 Examples:'));
  console.log('  $ miri-mcp deploy --name my-portfolio');
  console.log('  $ miri-mcp ask "홈페이지를 miri.dev에 배포하라"');
  console.log('  $ miri-mcp login');
  console.log('  $ miri-mcp status');
  console.log('  $ miri-mcp server');
  console.log('  $ miri-mcp config --claude');
  console.log(chalk.blue('\n📚 Documentation: https://www.miri.dev/docs/mcp'));
});

// 에러 핸들링
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('❌ Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ Uncaught Exception:'), error);
  process.exit(1);
});

// 프로그램 실행
program.parse();

// 인수가 없으면 도움말 표시
if (!process.argv.slice(2).length) {
  showHeader();
  program.outputHelp();
}
