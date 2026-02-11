require('dotenv').config();
const { App } = require('@slack/bolt');
const axios = require('axios');

// Initialize Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000
});

// Kerberos API base URL
const KERBEROS_API_URL = process.env.KERBEROS_API_URL || 'https://api.cloud.kerberos.io';

// Store user sessions (in production, use a proper database)
const userSessions = new Map();

/**
 * Helper function to make authenticated API calls to Kerberos.io
 */
async function kerberosApiCall(endpoint, method = 'GET', data = null, token = null) {
  try {
    const config = {
      method,
      url: `${KERBEROS_API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

/**
 * Command: /hub login
 * Authenticate user with Kerberos.io API
 */
app.command('/hub', async ({ command, ack, say, respond }) => {
  await ack();

  const args = command.text.trim().split(/\s+/);
  const subcommand = args[0]?.toLowerCase();

  if (!subcommand) {
    await respond({
      text: 'Please specify a command. Available commands:\n• `/hub login <username> <password>` - Login to Kerberos.io\n• `/hub profile` - View your profile\n• `/hub logout` - Logout from Kerberos.io\n• `/hub help` - Show this help message',
      response_type: 'ephemeral'
    });
    return;
  }

  switch (subcommand) {
    case 'login':
      await handleLogin(command, args, respond);
      break;
    case 'profile':
      await handleProfile(command, respond);
      break;
    case 'logout':
      await handleLogout(command, respond);
      break;
    case 'help':
      await handleHelp(respond);
      break;
    default:
      await respond({
        text: `Unknown command: \`${subcommand}\`. Use \`/hub help\` to see available commands.`,
        response_type: 'ephemeral'
      });
  }
});

/**
 * Handle login command
 */
async function handleLogin(command, args, respond) {
  if (args.length < 3) {
    await respond({
      text: 'Usage: `/hub login <username> <password>`\n\n⚠️ *Note:* This is for demonstration. In production, use OAuth or secure token-based authentication.',
      response_type: 'ephemeral'
    });
    return;
  }

  const username = args[1];
  const password = args[2];

  await respond({
    text: '🔐 Authenticating with Kerberos.io...',
    response_type: 'ephemeral'
  });

  // Attempt login via Kerberos API
  const result = await kerberosApiCall('/auth/login', 'POST', {
    username,
    password
  });

  if (result.success) {
    // Store session token
    const token = result.data.token || result.data.access_token;
    userSessions.set(command.user_id, {
      token,
      username,
      loginTime: new Date()
    });

    await respond({
      text: `✅ Successfully logged in as *${username}*!\n\nYou can now use:\n• \`/hub profile\` to view your profile\n• \`/hub logout\` to logout`,
      response_type: 'ephemeral'
    });
  } else {
    await respond({
      text: `❌ Login failed: ${result.error}\n\n_Note: Make sure the API endpoint is correct and your credentials are valid._`,
      response_type: 'ephemeral'
    });
  }
}

/**
 * Handle profile command
 */
async function handleProfile(command, respond) {
  const session = userSessions.get(command.user_id);

  if (!session) {
    await respond({
      text: '❌ You are not logged in. Please use `/hub login <username> <password>` first.',
      response_type: 'ephemeral'
    });
    return;
  }

  await respond({
    text: '📊 Fetching your profile...',
    response_type: 'ephemeral'
  });

  // Fetch profile from Kerberos API
  const result = await kerberosApiCall('/profile', 'GET', null, session.token);

  if (result.success) {
    const profile = result.data;
    const profileText = formatProfile(profile);

    await respond({
      text: profileText,
      response_type: 'ephemeral'
    });
  } else {
    await respond({
      text: `❌ Failed to fetch profile: ${result.error}\n\n_Your session may have expired. Try logging in again with \`/hub login\`._`,
      response_type: 'ephemeral'
    });

    // Clear expired session
    userSessions.delete(command.user_id);
  }
}

/**
 * Handle logout command
 */
async function handleLogout(command, respond) {
  const session = userSessions.get(command.user_id);

  if (!session) {
    await respond({
      text: '❌ You are not logged in.',
      response_type: 'ephemeral'
    });
    return;
  }

  userSessions.delete(command.user_id);

  await respond({
    text: `✅ Successfully logged out from *${session.username}*.`,
    response_type: 'ephemeral'
  });
}

/**
 * Handle help command
 */
async function handleHelp(respond) {
  await respond({
    text: `*Kerberos.io Hub Bot - Available Commands*

🔐 *Authentication*
• \`/hub login <username> <password>\` - Login to Kerberos.io
• \`/hub logout\` - Logout from current session

📊 *Information*
• \`/hub profile\` - View your profile information

❓ *Help*
• \`/hub help\` - Show this help message

⚠️ *Security Note:* Passing passwords in Slack commands is for demonstration purposes. In production, use OAuth or secure authentication methods.`,
    response_type: 'ephemeral'
  });
}

/**
 * Format profile data for display
 */
function formatProfile(profile) {
  let text = '*📊 Your Kerberos.io Profile*\n\n';

  if (profile.username || profile.email) {
    text += `*User:* ${profile.username || profile.email}\n`;
  }

  if (profile.name) {
    text += `*Name:* ${profile.name}\n`;
  }

  if (profile.subscription) {
    text += `*Subscription:* ${profile.subscription}\n`;
  }

  if (profile.cameras) {
    text += `*Cameras:* ${Array.isArray(profile.cameras) ? profile.cameras.length : profile.cameras}\n`;
  }

  if (profile.permissions) {
    text += `*Permissions:* ${Array.isArray(profile.permissions) ? profile.permissions.join(', ') : profile.permissions}\n`;
  }

  // Add any additional fields dynamically
  const knownFields = ['username', 'email', 'name', 'subscription', 'cameras', 'permissions'];
  Object.keys(profile).forEach(key => {
    if (!knownFields.includes(key) && profile[key] !== null && profile[key] !== undefined) {
      text += `*${key.charAt(0).toUpperCase() + key.slice(1)}:* ${JSON.stringify(profile[key])}\n`;
    }
  });

  return text;
}

/**
 * Error handler
 */
app.error(async (error) => {
  console.error('Slack bot error:', error);
});

/**
 * Start the bot
 */
(async () => {
  const port = process.env.PORT || 3000;
  await app.start();
  console.log(`⚡️ Kerberos.io Slack bot is running on port ${port}!`);
  console.log('Available commands:');
  console.log('  /hub login <username> <password>');
  console.log('  /hub profile');
  console.log('  /hub logout');
  console.log('  /hub help');
})();
