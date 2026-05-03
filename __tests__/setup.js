/**
 * Test setup file
 * Loads environment variables from .env if it exists
 */

const fs = require('fs');
const path = require('path');

// Try to load .env file if it exists (for local testing)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  console.log('Loading environment variables from .env file...');
  const envContent = fs.readFileSync(envPath, 'utf-8');

  envContent.split('\n').forEach(line => {
    line = line.trim();

    // Skip empty lines and comments
    if (!line || line.startsWith('#')) {
      return;
    }

    // Parse KEY=VALUE
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();

      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Only set if not already set (don't override existing env vars)
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });

  console.log('✅ Environment variables loaded from .env');
} else {
  console.log('ℹ️  No .env file found, using existing environment variables');
}
