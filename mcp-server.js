#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// MCP Config laden
const configPath = path.join(__dirname, '.windsurf', 'mcp-config.json');
const config = require(configPath);

// Supabase Server Konfiguration
const supabaseConfig = config.mcpServers.supabase;

// Environment Variables setzen
process.env.SUPABASE_CLIENT_ID = supabaseConfig.env.SUPABASE_CLIENT_ID;
process.env.SUPABASE_CLIENT_SECRET = supabaseConfig.env.SUPABASE_CLIENT_SECRET;

// MCP Server starten mit vollem npm Pfad
const mcpServer = spawn('cmd', ['/c', 'npx', '-y', 'mcp-remote', 'https://mcp.supabase.com/mcp?project_ref=ekbpexbhuochrplzorce'], {
  stdio: 'inherit',
  cwd: __dirname,
  shell: true
});

mcpServer.on('error', (error) => {
  console.error('Failed to start MCP server:', error);
});

mcpServer.on('close', (code) => {
  console.log(`MCP server exited with code ${code}`);
});
