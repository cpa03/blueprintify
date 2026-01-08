/**
 * Security Plugin for OpenCode
 *
 * Prevents accidental exposure of sensitive data through agent actions.
 */

export default {
  name: "security-guard",
  version: "1.0.0",

  hooks: {
    /**
     * Intercept before file read operations
     */
    "tool.read.before": async (context) => {
      const { path } = context.args;

      // Block reading sensitive files
      const blockedPatterns = [
        /\.env$/,
        /\.env\..+$/,
        /\.pem$/,
        /\.key$/,
        /secrets?\.(json|ya?ml|toml)$/i,
        /credentials?\.(json|ya?ml)$/i,
        /auth\.json$/,
        /\.npmrc$/,
        /\.netrc$/,
      ];

      for (const pattern of blockedPatterns) {
        if (pattern.test(path)) {
          throw new Error(
            `[SecurityGuard] Access denied: Reading "${path}" is blocked for security reasons.`
          );
        }
      }

      return context;
    },

    /**
     * Intercept before bash commands
     */
    "tool.bash.before": async (context) => {
      const { command } = context.args;

      // Block commands that might expose secrets
      const blockedCommands = [
        /cat\s+.*\.env/i,
        /echo\s+\$[A-Z_]*KEY/i,
        /echo\s+\$[A-Z_]*SECRET/i,
        /echo\s+\$[A-Z_]*TOKEN/i,
        /echo\s+\$[A-Z_]*PASSWORD/i,
        /printenv/i,
        /env\s*$/,
        /set\s*$/,
      ];

      for (const pattern of blockedCommands) {
        if (pattern.test(command)) {
          throw new Error(
            `[SecurityGuard] Command blocked: "${command}" may expose sensitive data.`
          );
        }
      }

      return context;
    },

    /**
     * Sanitize output before displaying
     */
    "output.before": async (context) => {
      const { content } = context;

      // Patterns that look like secrets
      const secretPatterns = [
        // API Keys (generic patterns)
        /['"]?[a-z_]*api[_-]?key['"]?\s*[:=]\s*['"]?[a-zA-Z0-9_-]{20,}['"]?/gi,
        // AWS Keys
        /AKIA[0-9A-Z]{16}/g,
        // Private Keys
        /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/g,
        // JWT Tokens
        /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
        // Generic secrets
        /['"]?[a-z_]*secret['"]?\s*[:=]\s*['"]?[a-zA-Z0-9_-]{20,}['"]?/gi,
      ];

      let sanitized = content;
      for (const pattern of secretPatterns) {
        sanitized = sanitized.replace(pattern, "[REDACTED]");
      }

      return { ...context, content: sanitized };
    },
  },
};
