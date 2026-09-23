import 'dotenv/config';

export const env = {
  port: Number.parseInt(process.env.PORT || '5000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  foundryProjectEndpoint: process.env.FOUNDRY_PROJECT_ENDPOINT || '',
  foundryAgentName: process.env.FOUNDRY_AGENT_NAME || '',
  foundryAgentVersion: process.env.FOUNDRY_AGENT_VERSION || '',
  foundryRequestTimeoutMs: Number.parseInt(process.env.FOUNDRY_REQUEST_TIMEOUT_MS || '60000', 10),
};

export function assertFoundryConfiguration() {
  const missing = [
    ['FOUNDRY_PROJECT_ENDPOINT', env.foundryProjectEndpoint],
    ['FOUNDRY_AGENT_NAME', env.foundryAgentName],
    ['FOUNDRY_AGENT_VERSION', env.foundryAgentVersion],
  ].filter(([, value]) => !value || value.startsWith('your_')).map(([name]) => name);
  if (missing.length) throw new Error(`Missing Foundry configuration: ${missing.join(', ')}`);
}