export const featureFlags = {
  agentsSurfacesEnabled: false,
  aiToolsEnabled: false,
} as const;

export const isAgentsSurfacesEnabled = () => featureFlags.agentsSurfacesEnabled;
export const isAiToolsEnabled = () => featureFlags.aiToolsEnabled;
