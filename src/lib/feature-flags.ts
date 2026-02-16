export const featureFlags = {
  agentsSurfacesEnabled: false,
  aiToolsEnabled: true,
} as const;

export const isAgentsSurfacesEnabled = () => featureFlags.agentsSurfacesEnabled;
export const isAiToolsEnabled = () => featureFlags.aiToolsEnabled;
