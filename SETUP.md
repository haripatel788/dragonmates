# Dragonmates - Developer Setup

## 1. Install Doppler CLI

```bash
# macOS
brew install dopplerhq/cli/doppler

# Windows (via scoop)
scoop bucket add doppler https://github.com/DopplerHQ/scoop-doppler.git
scoop install doppler

# Linux
curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | sudo gpg --dearmor -o /usr/share/keyrings/doppler-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/doppler-archive-keyring.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main" | sudo tee /etc/apt/sources.list.d/doppler-cli.list
sudo apt update && sudo apt install doppler
```

## 2. Login to Doppler

```bash
doppler login
```

This opens a browser. Ask Patrick to invite you to the workspace first.

## 3. Connect to the Project

```bash
cd dragonmates
doppler setup
```

Select:

- Project: `dragonmates`
- Config: `dev`

## 4. Run the App

```bash
# Install dependencies
npm install

# Run database migrations (first time only)
npm run migrate

# Start the server
npm start
```

## That's it!

Doppler automatically injects the secrets (DATABASE_URL, JWT_SECRET, etc.) when you run `npm start`.

No .env file needed. No copying keys around.
