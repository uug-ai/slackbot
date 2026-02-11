# Quick Start Guide

This guide will help you get the Kerberos.io Slack Bot up and running quickly.

## Prerequisites

- Node.js 14+ installed
- Admin access to a Slack workspace
- Kerberos.io account

## Step-by-Step Setup

### 1. Install Node.js Dependencies

```bash
npm install
```

### 2. Create Your Slack App

1. Visit https://api.slack.com/apps
2. Click **"Create New App"** → **"From scratch"**
3. Enter app name: **"Kerberos Hub Bot"**
4. Select your workspace
5. Click **"Create App"**

### 3. Configure Slack App Permissions

#### OAuth & Permissions
1. Navigate to **"OAuth & Permissions"** in the left sidebar
2. Scroll to **"Scopes"** → **"Bot Token Scopes"**
3. Add these scopes:
   - `commands` - Required for slash commands
   - `chat:write` - Required to send messages
4. Scroll up and click **"Install to Workspace"**
5. Click **"Allow"**
6. Copy the **"Bot User OAuth Token"** (starts with `xoxb-`)

#### Socket Mode
1. Navigate to **"Socket Mode"** in the left sidebar
2. Click **"Enable Socket Mode"**
3. Enter token name: **"Bot Token"**
4. Click **"Generate"**
5. Copy the **"App-Level Token"** (starts with `xapp-`)

#### Slash Commands
1. Navigate to **"Slash Commands"** in the left sidebar
2. Click **"Create New Command"**
3. Fill in:
   - **Command**: `/hub`
   - **Request URL**: `http://localhost:3000` (placeholder - not used in Socket Mode)
   - **Short Description**: `Interact with Kerberos.io Hub`
   - **Usage Hint**: `[login|profile|logout|help]`
4. Click **"Save"**

#### Basic Information
1. Navigate to **"Basic Information"** in the left sidebar
2. Scroll to **"App Credentials"**
3. Copy the **"Signing Secret"**

### 4. Set Up Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your tokens:

```env
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
SLACK_APP_TOKEN=xapp-your-app-token-here
KERBEROS_API_URL=https://api.cloud.kerberos.io
PORT=3000
```

### 5. Start the Bot

```bash
npm start
```

You should see:
```
⚡️ Kerberos.io Slack bot is running on port 3000!
Available commands:
  /hub login <username> <password>
  /hub profile
  /hub logout
  /hub help
```

### 6. Test in Slack

1. Open your Slack workspace
2. Type `/hub help` in any channel
3. You should see the bot respond with available commands

## Using the Bot

### Login to Kerberos.io
```
/hub login your-email@example.com your-password
```

### View Your Profile
```
/hub profile
```

### Logout
```
/hub logout
```

### Get Help
```
/hub help
```

## Troubleshooting

### Bot Doesn't Respond
- Make sure the bot is running (`npm start`)
- Check Socket Mode is enabled
- Verify all tokens are correct in `.env`
- Check console for error messages

### "Not Logged In" Message
- You need to login first with `/hub login`
- Your session might have expired (restart required)
- Check that the Kerberos API URL is correct

### API Errors
- Verify your Kerberos.io credentials are correct
- Check that `KERBEROS_API_URL` in `.env` is correct
- The API endpoints might be different - check https://api.cloud.kerberos.io/swagger/index.html

## Next Steps

- Read the full [README.md](README.md) for deployment options
- Consider implementing OAuth instead of password authentication
- Set up persistent session storage (Redis/database)
- Add more commands for camera management, recordings, etc.

## Security Note

⚠️ **Important**: Passing passwords via Slack commands is not secure for production use. This is a demonstration implementation. For production:

- Implement OAuth 2.0
- Use Kerberos.io API tokens
- Never log or store passwords
- Use encrypted session storage

## Support

For issues or questions:
- Open an issue on GitHub
- Check Kerberos.io documentation: https://doc.kerberos.io
