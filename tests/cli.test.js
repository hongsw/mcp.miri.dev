const { spawn } = require('child_process');
const path = require('path');

describe('CLI Tests', () => {
  const cliPath = path.join(__dirname, '../bin/miri-mcp.js');

  test('CLI 도움말 출력', (done) => {
    const child = spawn('node', [cliPath, '--help'], { 
      stdio: 'pipe',
      env: { ...process.env, NO_HEADER: 'true' }
    });

    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      expect(output).toContain('Usage:');
      expect(output).toContain('deploy');
      expect(output).toContain('login');
      expect(output).toContain('status');
      done();
    });
  });

  test('CLI 버전 출력', (done) => {
    const child = spawn('node', [cliPath, '--version'], { 
      stdio: 'pipe',
      env: { ...process.env, NO_HEADER: 'true' }
    });

    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      expect(output).toMatch(/\d+\.\d+\.\d+/);
      done();
    });
  });
});
