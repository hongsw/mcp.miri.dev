#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js'

// 도구들 import
import { MiriDevAuthTool } from './tools/auth.js'
import { MiriDevDeployTool } from './tools/deploy.js'
import { MiriDevStatusTool } from './tools/status.js'

class MiriDevMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'miridev-mcp',
        version: '1.0.22',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    )

    // 도구 인스턴스 생성
    this.authTool = new MiriDevAuthTool()
    this.deployTool = new MiriDevDeployTool()
    this.statusTool = new MiriDevStatusTool()

    this.setupHandlers()
  }

  setupHandlers() {
    // 도구 목록 제공
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'deploy_website',
            description: '웹사이트를 miri.dev에 배포합니다. 프로젝트 폴더 경로를 지정하세요.',
            inputSchema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: '배포 요청 메시지 (자연어 가능)',
                },
                projectPath: {
                  type: 'string',
                  description: '배포할 프로젝트 폴더의 경로',
                  default: '.',
                },
                siteName: {
                  type: 'string',
                  description: '사이트 이름 (선택사항)',
                },
              },
              required: ['message'],
            },
          },
          {
            name: 'check_auth_status',
            description: 'miri.dev 로그인 상태를 확인합니다.',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'login_miridev',
            description: 'miri.dev에 로그인합니다.',
            inputSchema: {
              type: 'object',
              properties: {
                force: {
                  type: 'boolean',
                  description: '강제로 다시 로그인할지 여부',
                  default: false,
                },
              },
            },
          },
          {
            name: 'get_deployment_status',
            description: '최근 배포 상태와 통계를 확인합니다.',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      }
    })

    // 도구 실행 처리
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      try {
        switch (name) {
          case 'deploy_website': {
            const result = await this.deployTool.deploy(
              args.projectPath || '.',
              args.siteName
            )

            if (result.success) {
              // 배포 성공 시 상태 저장
              if (result.siteId && result.url) {
                await this.statusTool.saveDeploymentStatus({
                  url: result.url,
                  siteId: result.siteId,
                  fileCount: result.fileCount,
                })
              }

              // 사이트 타이틀 결정 (API에서 제공하지 않으면 기본값 사용)
              const siteTitle = result.title || 'Untitled Site'

              return {
                content: [
                  {
                    type: 'text',
                    text: `배포되었습니다.\n사이트 타이틀 : "${siteTitle}"\n${result.url}`,
                  },
                ],
              }
            } else {
              return {
                content: [
                  {
                    type: 'text',
                    text: `❌ 실제 배포 실패: ${result.error}\n\n요청: ${args.message}\n프로젝트 경로: ${args.projectPath}`,
                  },
                ],
              }
            }
          }

          case 'check_auth_status': {
            const result = await this.authTool.checkAuthStatus()
            return {
              content: [
                {
                  type: 'text',
                  text: result.success
                    ? `✅ ${result.message}`
                    : `❌ ${result.message}`,
                },
              ],
            }
          }

          case 'login_miridev': {
            const result = await this.authTool.login(args.force || false)
            return {
              content: [
                {
                  type: 'text',
                  text: result.success
                    ? `✅ ${result.message}`
                    : `❌ ${result.error || result.message}`,
                },
              ],
            }
          }

          case 'get_deployment_status': {
            const result = await this.statusTool.getStatus()
            return {
              content: [
                {
                  type: 'text',
                  text: result.success
                    ? `📊 ${result.message}`
                    : `❌ ${result.error || result.message}`,
                },
              ],
            }
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            )
        }
      } catch (error) {
        console.error(`[MCP Server] 도구 실행 오류 (${name}):`, error.message)
        throw new McpError(
          ErrorCode.InternalError,
          `도구 실행 중 오류가 발생했습니다: ${error.message}`
        )
      }
    })

    // 에러 핸들링
    this.server.onerror = (error) => {
      console.error('[MCP Server] 서버 오류:', error)
    }
  }

  async start() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('[MCP Server] miridev-mcp v1.0.22 서버가 시작되었습니다.')
    console.error('[MCP Server] Claude Desktop과 연결 대기 중...')
  }
}

// 서버 시작
const server = new MiriDevMCPServer()
server.start().catch((error) => {
  console.error('[MCP Server] 서버 시작 실패:', error)
  process.exit(1)
})

// 프로세스 종료 시 정리
process.on('SIGINT', () => {
  console.error('[MCP Server] 서버를 종료합니다...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.error('[MCP Server] 서버를 종료합니다...')
  process.exit(0)
}) 