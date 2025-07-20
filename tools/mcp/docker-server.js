#!/usr/bin/env node

/**
 * MCP Server para Gerenciamento Docker - Mestres do Café Enterprise
 * Fornece ferramentas para inspecionar, gerenciar e diagnosticar containers Docker
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class DockerMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'mestres-cafe-docker-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'docker_ps',
            description: 'List all Docker containers with their status',
            inputSchema: {
              type: 'object',
              properties: {
                all: {
                  type: 'boolean',
                  description: 'Show all containers (default: false, only running)',
                  default: false,
                },
                format: {
                  type: 'string',
                  description: 'Output format (table, json)',
                  default: 'table',
                },
              },
            },
          },
          {
            name: 'docker_logs',
            description: 'Get logs from a Docker container',
            inputSchema: {
              type: 'object',
              properties: {
                container: {
                  type: 'string',
                  description: 'Container name or ID',
                },
                tail: {
                  type: 'number',
                  description: 'Number of lines to show from the end of logs',
                  default: 50,
                },
                follow: {
                  type: 'boolean',
                  description: 'Follow log output',
                  default: false,
                },
                since: {
                  type: 'string',
                  description: 'Show logs since timestamp (e.g., 2013-01-02T13:23:37) or relative (e.g., 42m for 42 minutes)',
                },
              },
              required: ['container'],
            },
          },
          {
            name: 'docker_inspect',
            description: 'Get detailed information about a Docker container',
            inputSchema: {
              type: 'object',
              properties: {
                container: {
                  type: 'string',
                  description: 'Container name or ID',
                },
                format: {
                  type: 'string',
                  description: 'Output format (json, summary)',
                  default: 'summary',
                },
              },
              required: ['container'],
            },
          },
          {
            name: 'docker_stats',
            description: 'Get resource usage statistics for containers',
            inputSchema: {
              type: 'object',
              properties: {
                container: {
                  type: 'string',
                  description: 'Specific container name or ID (optional)',
                },
                no_stream: {
                  type: 'boolean',
                  description: 'Disable streaming stats and only pull the first result',
                  default: true,
                },
              },
            },
          },
          {
            name: 'docker_exec',
            description: 'Execute a command inside a running container',
            inputSchema: {
              type: 'object',
              properties: {
                container: {
                  type: 'string',
                  description: 'Container name or ID',
                },
                command: {
                  type: 'string',
                  description: 'Command to execute',
                },
                interactive: {
                  type: 'boolean',
                  description: 'Keep STDIN open',
                  default: false,
                },
                tty: {
                  type: 'boolean',
                  description: 'Allocate a pseudo-TTY',
                  default: false,
                },
              },
              required: ['container', 'command'],
            },
          },
          {
            name: 'docker_compose_ps',
            description: 'List services in docker-compose stack',
            inputSchema: {
              type: 'object',
              properties: {
                project_dir: {
                  type: 'string',
                  description: 'Path to docker-compose project directory',
                  default: '.',
                },
                services: {
                  type: 'boolean',
                  description: 'Display services',
                  default: true,
                },
              },
            },
          },
          {
            name: 'docker_compose_logs',
            description: 'Get logs from docker-compose services',
            inputSchema: {
              type: 'object',
              properties: {
                service: {
                  type: 'string',
                  description: 'Service name (optional, if not provided shows all services)',
                },
                project_dir: {
                  type: 'string',
                  description: 'Path to docker-compose project directory',
                  default: '.',
                },
                tail: {
                  type: 'number',
                  description: 'Number of lines to show from the end of logs',
                  default: 50,
                },
                follow: {
                  type: 'boolean',
                  description: 'Follow log output',
                  default: false,
                },
              },
            },
          },
          {
            name: 'docker_health_check',
            description: 'Check health status of all containers',
            inputSchema: {
              type: 'object',
              properties: {
                project_dir: {
                  type: 'string',
                  description: 'Path to docker-compose project directory',
                  default: '.',
                },
                detailed: {
                  type: 'boolean',
                  description: 'Show detailed health information',
                  default: false,
                },
              },
            },
          },
          {
            name: 'docker_troubleshoot',
            description: 'Run comprehensive troubleshooting checks on Docker environment',
            inputSchema: {
              type: 'object',
              properties: {
                container: {
                  type: 'string',
                  description: 'Specific container to troubleshoot (optional)',
                },
                include_logs: {
                  type: 'boolean',
                  description: 'Include recent logs in troubleshooting output',
                  default: true,
                },
              },
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'docker_ps':
            return await this.dockerPs(args);
          case 'docker_logs':
            return await this.dockerLogs(args);
          case 'docker_inspect':
            return await this.dockerInspect(args);
          case 'docker_stats':
            return await this.dockerStats(args);
          case 'docker_exec':
            return await this.dockerExec(args);
          case 'docker_compose_ps':
            return await this.dockerComposePs(args);
          case 'docker_compose_logs':
            return await this.dockerComposeLogs(args);
          case 'docker_health_check':
            return await this.dockerHealthCheck(args);
          case 'docker_troubleshoot':
            return await this.dockerTroubleshoot(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async dockerPs(args) {
    const allFlag = args.all ? '-a' : '';
    const cmd = args.format === 'json' 
      ? `docker ps ${allFlag} --format "{{json .}}"` 
      : `docker ps ${allFlag}`;

    const { stdout, stderr } = await execAsync(cmd);
    
    if (stderr) {
      throw new Error(stderr);
    }

    return {
      content: [
        {
          type: 'text',
          text: stdout,
        },
      ],
    };
  }

  async dockerLogs(args) {
    let cmd = `docker logs`;
    
    if (args.tail) cmd += ` --tail ${args.tail}`;
    if (args.since) cmd += ` --since "${args.since}"`;
    if (args.follow) cmd += ` -f`;
    
    cmd += ` ${args.container}`;

    const { stdout, stderr } = await execAsync(cmd);
    
    return {
      content: [
        {
          type: 'text',
          text: stdout || stderr,
        },
      ],
    };
  }

  async dockerInspect(args) {
    const cmd = `docker inspect ${args.container}`;
    const { stdout, stderr } = await execAsync(cmd);
    
    if (stderr) {
      throw new Error(stderr);
    }

    if (args.format === 'summary') {
      const data = JSON.parse(stdout)[0];
      const summary = {
        Name: data.Name,
        State: data.State.Status,
        Health: data.State.Health?.Status || 'N/A',
        Image: data.Config.Image,
        Created: data.Created,
        Ports: data.NetworkSettings.Ports,
        Mounts: data.Mounts?.map(m => `${m.Source}:${m.Destination}`) || [],
        Environment: data.Config.Env.filter(env => !env.includes('PASSWORD')),
      };
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(summary, null, 2),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: stdout,
        },
      ],
    };
  }

  async dockerStats(args) {
    let cmd = 'docker stats';
    
    if (args.no_stream) cmd += ' --no-stream';
    if (args.container) cmd += ` ${args.container}`;

    const { stdout, stderr } = await execAsync(cmd);
    
    return {
      content: [
        {
          type: 'text',
          text: stdout || stderr,
        },
      ],
    };
  }

  async dockerExec(args) {
    let cmd = 'docker exec';
    
    if (args.interactive) cmd += ' -i';
    if (args.tty) cmd += ' -t';
    
    cmd += ` ${args.container} ${args.command}`;

    const { stdout, stderr } = await execAsync(cmd);
    
    return {
      content: [
        {
          type: 'text',
          text: stdout || stderr,
        },
      ],
    };
  }

  async dockerComposePs(args) {
    const cmd = `docker-compose -f ${args.project_dir}/docker-compose.yml ps`;
    const { stdout, stderr } = await execAsync(cmd);
    
    return {
      content: [
        {
          type: 'text',
          text: stdout || stderr,
        },
      ],
    };
  }

  async dockerComposeLogs(args) {
    let cmd = `docker-compose -f ${args.project_dir}/docker-compose.yml logs`;
    
    if (args.tail) cmd += ` --tail=${args.tail}`;
    if (args.follow) cmd += ` -f`;
    if (args.service) cmd += ` ${args.service}`;

    const { stdout, stderr } = await execAsync(cmd);
    
    return {
      content: [
        {
          type: 'text',
          text: stdout || stderr,
        },
      ],
    };
  }

  async dockerHealthCheck(args) {
    const psCmd = `docker-compose -f ${args.project_dir}/docker-compose.yml ps`;
    const { stdout: psOutput } = await execAsync(psCmd);
    
    let result = `=== Docker Compose Services Health Status ===\n${psOutput}\n\n`;
    
    if (args.detailed) {
      // Get detailed health for each container
      const containerListCmd = `docker ps --format "{{.Names}}"`;
      const { stdout: containers } = await execAsync(containerListCmd);
      
      for (const container of containers.split('\n').filter(Boolean)) {
        try {
          const inspectCmd = `docker inspect ${container} --format="{{.State.Health.Status}}"`;
          const { stdout: health } = await execAsync(inspectCmd);
          result += `${container}: ${health.trim() || 'No health check defined'}\n`;
        } catch (error) {
          result += `${container}: Error checking health - ${error.message}\n`;
        }
      }
    }
    
    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  }

  async dockerTroubleshoot(args) {
    let result = '=== Docker Environment Troubleshooting ===\n\n';
    
    try {
      // Docker version and info
      const { stdout: version } = await execAsync('docker --version');
      const { stdout: composeVersion } = await execAsync('docker-compose --version');
      result += `Docker Version: ${version}`;
      result += `Docker Compose Version: ${composeVersion}\n`;
      
      // System resources
      const { stdout: df } = await execAsync('docker system df');
      result += `=== Docker Disk Usage ===\n${df}\n`;
      
      // Running containers
      const { stdout: ps } = await execAsync('docker ps -a');
      result += `=== All Containers ===\n${ps}\n`;
      
      // Network info
      const { stdout: networks } = await execAsync('docker network ls');
      result += `=== Docker Networks ===\n${networks}\n`;
      
      // Volume info
      const { stdout: volumes } = await execAsync('docker volume ls');
      result += `=== Docker Volumes ===\n${volumes}\n`;
      
      if (args.container) {
        // Specific container troubleshooting
        result += `\n=== Troubleshooting Container: ${args.container} ===\n`;
        
        try {
          const { stdout: inspect } = await execAsync(`docker inspect ${args.container}`);
          const data = JSON.parse(inspect)[0];
          
          result += `Status: ${data.State.Status}\n`;
          result += `Health: ${data.State.Health?.Status || 'N/A'}\n`;
          result += `Exit Code: ${data.State.ExitCode}\n`;
          result += `Started At: ${data.State.StartedAt}\n`;
          result += `Finished At: ${data.State.FinishedAt}\n`;
          
          if (args.include_logs) {
            const { stdout: logs } = await execAsync(`docker logs --tail 20 ${args.container}`);
            result += `\n=== Recent Logs ===\n${logs}\n`;
          }
        } catch (error) {
          result += `Error inspecting container: ${error.message}\n`;
        }
      }
      
    } catch (error) {
      result += `Error during troubleshooting: ${error.message}\n`;
    }
    
    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Mestres do Café Docker MCP Server running on stdio');
  }
}

const server = new DockerMCPServer();
server.run().catch(console.error);