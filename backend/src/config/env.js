import 'dotenv/config';

const rawEndpoint = (process.env.FOUNDRY_PROJECT_ENDPOINT || '').trim();
const endpointMatch = rawEndpoint.match(/^(https:\/\/[^\/]+\/api\/projects\/[^\/]+)/i);
const sanitizedEndpoint = endpointMatch ? endpointMatch[1] : rawEndpoint.replace(/\/+$/, '');

export const env = {
  port: Number.parseInt(process.env.PORT || '5000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  foundryProjectEndpoint: sanitizedEndpoint,
  foundryAgentName: (process.env.FOUNDRY_AGENT_NAME || 'AI-MealPlanner').trim(),
  foundryAgentVersion: (process.env.FOUNDRY_AGENT_VERSION || '1').trim(),
  foundryRequestTimeoutMs: Number.parseInt(process.env.FOUNDRY_REQUEST_TIMEOUT_MS || '60000', 10),
  firebaseProjectId: (process.env.FIREBASE_PROJECT_ID || '').trim(),
  firebaseClientEmail: (process.env.FIREBASE_CLIENT_EMAIL || '').trim(),
  firebasePrivateKey: (process.env.FIREBASE_PRIVATE_KEY || '').trim(),
};

export function assertFoundryConfiguration() {
  const missing = [
    ['FOUNDRY_PROJECT_ENDPOINT', env.foundryProjectEndpoint],
    ['FOUNDRY_AGENT_NAME', env.foundryAgentName],
    ['FOUNDRY_AGENT_VERSION', env.foundryAgentVersion],
  ].filter(([, value]) => !value || value.startsWith('your_')).map(([name]) => name);
  if (missing.length) throw new Error(`Missing Foundry configuration: ${missing.join(', ')}`);
}
