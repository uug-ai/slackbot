# Kerberos.io Hub Slack Bot

A Slack bot that integrates with the Kerberos.io Hub API, allowing users to interact with their Kerberos.io account directly from Slack using slash commands.

## Features

- 🔐 **Authentication**: Login to your Kerberos.io account via `/hub login`
- 📊 **Profile Management**: View your profile information with `/hub profile`
- 🚪 **Session Management**: Logout securely with `/hub logout`
- ❓ **Help**: Get command information with `/hub help`

## Prerequisites

- Node.js 14.x or higher
- A Slack workspace with admin access
- A Kerberos.io account (https://kerberos.io)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/uug-ai/slackbot.git
cd slackbot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Slack App

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name your app (e.g., "Kerberos Hub Bot") and select your workspace
4. Navigate to "OAuth & Permissions":
   - Add the following Bot Token Scopes:
     - `commands` - For slash commands
     - `chat:write` - To send messages
   - Install the app to your workspace
   - Copy the "Bot User OAuth Token" (starts with `xoxb-`)
5. Navigate to "Slash Commands":
   - Create a new command `/hub`
   - Request URL: Will be provided by Socket Mode (can be a placeholder)
   - Short Description: "Interact with Kerberos.io Hub"
   - Usage Hint: `[login|profile|logout|help]`
6. Navigate to "Socket Mode":
   - Enable Socket Mode
   - Give your token a name and generate
   - Copy the "App-Level Token" (starts with `xapp-`)
7. Navigate to "Basic Information":
   - Copy the "Signing Secret"

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_APP_TOKEN=xapp-your-app-token
KERBEROS_API_URL=https://api.cloud.kerberos.io
PORT=3000
```

### 5. Run the Bot

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

You should see:
```
⚡️ Kerberos.io Slack bot is running on port 3000!
```

## Usage

### Available Commands

#### Login
```
/hub login <username> <password>
```
Authenticate with your Kerberos.io credentials.

**Example:**
```
/hub login user@example.com mypassword
```

#### View Profile
```
/hub profile
```
Display your Kerberos.io profile information including subscription details, cameras, and permissions.

#### Logout
```
/hub logout
```
End your current session with the bot.

#### Help
```
/hub help
```
Display available commands and usage information.

## Architecture

### Components

- **Slack Bolt Framework**: Handles Slack events and commands
- **Socket Mode**: Enables real-time communication without exposing a public endpoint
- **Axios**: Makes HTTP requests to the Kerberos.io API
- **Session Store**: In-memory storage for user authentication tokens (consider Redis for production)

### API Integration

The bot integrates with the Kerberos.io Hub API at `https://api.cloud.kerberos.io`:

- **POST /auth/login**: Authenticates users and returns access tokens
- **GET /profile**: Retrieves user profile information

*Note: The actual API endpoints may vary. Refer to the official Kerberos.io API documentation at https://api.cloud.kerberos.io/swagger/index.html*

## Security Considerations

⚠️ **Important**: This implementation is for demonstration purposes. For production use:

1. **Never pass passwords in plaintext via Slack commands**
   - Implement OAuth 2.0 flow
   - Use Slack's OAuth provider
   - Generate and use API tokens

2. **Use a persistent session store**
   - Replace in-memory Map with Redis or a database
   - Implement token refresh logic
   - Set appropriate token expiration

3. **Secure token storage**
   - Encrypt tokens at rest
   - Use environment-specific secrets management (AWS Secrets Manager, HashiCorp Vault, etc.)

4. **Add rate limiting and input validation**
   - Prevent abuse of the bot
   - Sanitize user inputs

## Deployment

### Heroku

```bash
heroku create your-kerberos-bot
heroku config:set SLACK_BOT_TOKEN=xoxb-...
heroku config:set SLACK_SIGNING_SECRET=...
heroku config:set SLACK_APP_TOKEN=xapp-...
heroku config:set KERBEROS_API_URL=https://api.cloud.kerberos.io
git push heroku main
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t kerberos-slack-bot .
docker run -d --env-file .env -p 3000:3000 kerberos-slack-bot
```

### AWS, GCP, or Azure

Deploy as a containerized application or serverless function following platform-specific guides.

## Troubleshooting

### Bot doesn't respond
- Verify Socket Mode is enabled in Slack app settings
- Check that all tokens in `.env` are correct
- Ensure the bot is running (`npm start`)
- Check console logs for errors

### API calls fail
- Verify `KERBEROS_API_URL` is correct
- Check if the API endpoints match your Kerberos.io version
- Ensure credentials are valid
- Review API logs if available

### Session expires
- Sessions are stored in memory and cleared on bot restart
- Implement persistent storage for production use

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues and questions:
- Open an issue on GitHub
- Check Kerberos.io documentation: https://doc.kerberos.io
- Visit Kerberos.io community forums

## Acknowledgments

- Built with [Slack Bolt for JavaScript](https://slack.dev/bolt-js)
- Integrates with [Kerberos.io Hub API](https://kerberos.io)
