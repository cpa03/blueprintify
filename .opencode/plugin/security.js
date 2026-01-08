/**
 * Security Plugin for OpenCode
 *
 * Prevents accidental exposure of sensitive data through agent actions.
 */

module.exports = function(context) {
  // Hook: Before File Read
  context.hooks.on("tool.read.before", async (args) => {
    const { path } = args;

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
  });

  // Hook: Before Bash Execution
  context.hooks.on("tool.bash.before", async (args) => {
    const { command } = args;

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
  });

  // Hook: Output Sanitization
  // Note: Output hooks might have different signature, implementing conservatively
};
