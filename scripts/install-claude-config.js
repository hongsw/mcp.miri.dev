#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const os = require('os');

async function installClaudeConfig() {
  console.log(chalk.blue('🔧 Installing Claude Desktop MCP configuration...\n'));
  
  // 플랫폼별 설정 파일 경로
  const configPath = process.platform === 'darwin' 
    ? path.join(os.homedir(), 'Library/Application Support/Claude/claude_desktop_config.json')
    : path.join(os.homedir(), 'AppData/Roaming/Claude/claude_desktop_config.json');
  
  const mcpServerPath = path.resolve(__dirname, '../src/index.js');
  
  const mcpConfig = {
    mcpServers: {
      miridev: {
        command: 'node',
        args: [mcpServerPath],
        env: {
          MIRI_API_URL: 'https://www.miri.dev/api'
        }
      }
    }
  };
  
  try {
    // 설정 디렉토리 생성
    await fs.ensureDir(path.dirname(configPath));
    
    let existingConfig = {};
    if (await fs.pathExists(configPath)) {
      console.log(chalk.yellow('📁 Existing Claude config found, merging...'));
      existingConfig = await fs.readJson(configPath);
    }
    
    // 기존 설정과 병합
    const updatedConfig = {
      ...existingConfig,
      mcpServers: {
        ...existingConfig.mcpServers,
        ...mcpConfig.mcpServers
      }
    };
    
    // 설정 파일 저장
    await fs.writeJson(configPath, updatedConfig, { spaces: 2 });
    
    console.log(chalk.green('✅ Claude Desktop configuration installed successfully!'));
    console.log(chalk.blue(`📁 Config file: ${configPath}`));
    console.log(chalk.blue(`🔧 MCP server: ${mcpServerPath}`));
    console.log(chalk.yellow('\n🔄 Please restart Claude Desktop to apply changes'));
    console.log(chalk.gray('\n💡 You can now use natural language commands like:'));
    console.log(chalk.gray('   "홈페이지를 miri.dev에 배포하라"'));
    console.log(chalk.gray('   "Deploy my website to miri.dev"'));
    
  } catch (error) {
    console.error(chalk.red('❌ Installation failed:'), error.message);
    process.exit(1);
  }
}

// 직접 실행된 경우
if (require.main === module) {
  installClaudeConfig().catch(console.error);
}

module.exports = { installClaudeConfig }; 