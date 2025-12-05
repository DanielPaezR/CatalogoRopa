# railway.toml
[build]
builder = "nixpacks"
buildCommand = "npm run build"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 60
port = 3000

[build.environment]
NODE_ENV = "production"
NEXT_TELEMETRY_DISABLED = "1"

[deploy.environment]
NODE_ENV = "production"