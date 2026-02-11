# Development Guide

This guide covers development workflows, CI/CD, and containerization for the Kerberos Slack Bot.

## Development Environment

### Option 1: Dev Container (Recommended)

The project includes a complete dev container configuration for VS Code.

**Features**:
- Pre-configured Node.js 18 environment
- Automatic dependency installation
- VS Code extensions for JavaScript development
- Port forwarding for local testing
- Consistent environment across team members

**Setup**:
1. Install Docker Desktop
2. Install VS Code with Dev Containers extension
3. Open project in VS Code
4. Click "Reopen in Container" when prompted
5. Wait for container to build (first time only)

**Inside the container**:
```bash
# Dependencies are already installed
npm start  # Start the bot
npm test   # Run tests
```

### Option 2: Local Development

**Requirements**:
- Node.js 18.x or 20.x
- npm 8.x or higher

**Setup**:
```bash
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Test with different Node versions (using nvm)
nvm use 18
npm test
nvm use 20
npm test
```

### Test Coverage

Current tests cover:
- Command parsing logic
- Profile data formatting
- API URL construction
- Session store operations

### Writing Tests

Add new tests to `test.js`:

```javascript
function testNewFeature() {
  console.log('Testing new feature...');
  
  // Your test logic here
  assert(condition, 'Error message');
  
  console.log('✅ New feature test passed');
}

// Add to runTests function
function runTests() {
  // ... existing tests
  testNewFeature();
}
```

## CI/CD Workflows

### Continuous Integration (ci.yml)

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs**:

1. **Build and Test** (Matrix strategy)
   - Runs on Node.js 18.x and 20.x
   - Installs dependencies with `npm ci`
   - Runs test suite
   - Validates syntax

2. **Code Quality**
   - Checks code syntax
   - Validates all JavaScript files

**Configuration**:
```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]
```

### Docker Build (docker.yml)

**Triggers**:
- Push to `main` branch
- Version tags (v*)
- Pull requests to `main` branch

**Features**:
- Multi-platform builds (optional)
- Layer caching for faster builds
- Metadata extraction for tags
- Build validation (no push on PR)

**Docker Image Tags**:
- `main` - Latest from main branch
- `v1.0.0` - Semantic version tags
- `sha-abc123` - Commit SHA tags

## Docker Development

### Using Docker Compose

**Development workflow**:
```bash
# Start in development mode
docker-compose up

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Restart after changes
docker-compose restart

# Stop and remove containers
docker-compose down

# Rebuild after dependency changes
docker-compose up --build
```

### Using Dockerfile

**Build**:
```bash
docker build -t kerberos-slack-bot:dev .
```

**Run**:
```bash
docker run -it --rm \
  --env-file .env \
  -p 3000:3000 \
  --name slack-bot-dev \
  kerberos-slack-bot:dev
```

**Debug**:
```bash
# Run with shell access
docker run -it --rm \
  --env-file .env \
  --entrypoint sh \
  kerberos-slack-bot:dev

# Check logs
docker logs slack-bot-dev

# Inspect container
docker inspect slack-bot-dev
```

### Multi-stage Build

The Dockerfile uses multi-stage builds for optimization:

1. **Builder stage**: Installs dependencies
2. **Production stage**: Copies only necessary files
3. **Security**: Runs as non-root user
4. **Health checks**: Built-in health monitoring

## Project Structure

```
.
├── .devcontainer/
│   └── devcontainer.json      # Dev container configuration
├── .github/
│   └── workflows/
│       ├── ci.yml             # CI workflow
│       └── docker.yml         # Docker build workflow
├── index.js                   # Main application
├── test.js                    # Test suite
├── package.json               # Dependencies and scripts
├── Dockerfile                 # Production Docker image
├── docker-compose.yml         # Docker Compose configuration
├── .dockerignore              # Docker build exclusions
├── .env.example               # Environment template
└── .gitignore                 # Git exclusions
```

## Scripts

Available npm scripts:

```json
{
  "start": "node index.js",      // Start the bot
  "dev": "nodemon index.js",     // Start with auto-reload
  "test": "node test.js"         // Run tests
}
```

## Environment Variables

Required variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `SLACK_BOT_TOKEN` | Bot User OAuth Token | `xoxb-...` |
| `SLACK_SIGNING_SECRET` | Signing secret | `abc123...` |
| `SLACK_APP_TOKEN` | App-Level Token | `xapp-...` |
| `KERBEROS_API_URL` | Kerberos API base URL | `https://api.cloud.kerberos.io` |
| `PORT` | Server port (optional) | `3000` |

## Debugging

### Local Debugging

1. Add breakpoints in VS Code
2. Use "Run and Debug" panel
3. Or add debug configuration to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Bot",
  "program": "${workspaceFolder}/index.js",
  "envFile": "${workspaceFolder}/.env"
}
```

### Docker Debugging

```bash
# Check container status
docker ps

# View logs
docker logs -f kerberos-slack-bot

# Execute commands in running container
docker exec -it kerberos-slack-bot sh

# Check environment variables
docker exec kerberos-slack-bot env
```

## Best Practices

### Code Quality

- Run tests before committing
- Use meaningful commit messages
- Keep functions small and focused
- Add comments for complex logic

### Security

- Never commit `.env` file
- Rotate tokens regularly
- Use environment-specific secrets
- Follow principle of least privilege

### Performance

- Use `npm ci` in CI/CD (faster than `npm install`)
- Leverage Docker layer caching
- Monitor memory usage in production
- Implement proper error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests (`npm test`)
5. Submit a pull request

Pull requests trigger:
- CI workflow (tests on multiple Node versions)
- Docker build validation
- Automated code checks

## Troubleshooting

### Dev Container Issues

**Problem**: Container fails to build
- Solution: Delete `.devcontainer` cache and rebuild
- Command: Docker → Dev Containers → Rebuild Container

**Problem**: Extensions not loading
- Solution: Check `.devcontainer/devcontainer.json` extensions list
- Reinstall extensions manually if needed

### CI/CD Issues

**Problem**: Tests fail in CI but pass locally
- Check Node version differences
- Review CI logs for specific errors
- Ensure all dependencies are in `package.json`

**Problem**: Docker build fails
- Check Dockerfile syntax
- Verify all files exist (check `.dockerignore`)
- Review build logs in GitHub Actions

### Docker Issues

**Problem**: Container starts but bot doesn't work
- Check environment variables: `docker exec <container> env`
- View logs: `docker logs <container>`
- Verify `.env` file is properly formatted

**Problem**: Port already in use
- Change port in `.env` and `docker-compose.yml`
- Or stop conflicting service: `lsof -ti:3000 | xargs kill`

## Additional Resources

- [Slack Bolt Documentation](https://slack.dev/bolt-js)
- [Docker Documentation](https://docs.docker.com)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [VS Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
- [Kerberos.io API Documentation](https://doc.kerberos.io)
