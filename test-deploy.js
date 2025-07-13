#!/usr/bin/env node

import { MiriDevDeployTool } from './src/tools/deploy.js';
import path from 'path';

async function testDeploy() {
  console.log('🧪 MCP 배포 도구 테스트 시작');
  
  const deployTool = new MiriDevDeployTool();
  const projectPath = '/Users/martin/Claude/www.miri.dev/my_first_vibe_coding_with_miridev';
  
  console.log(`📂 테스트 폴더: ${projectPath}`);
  
  try {
    const result = await deployTool.deploy(projectPath);
    
    console.log('\n📊 테스트 결과:');
    console.log('=================');
    console.log('성공:', result.success);
    
    if (result.success) {
      console.log('URL:', result.url);
      console.log('사이트 ID:', result.siteId);
      console.log('타이틀:', result.title);
      console.log('파일 수:', result.fileCount);
      console.log('메시지:', result.message);
    } else {
      console.log('오류:', result.error);
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
    console.error('스택:', error.stack);
  }
}

testDeploy(); 