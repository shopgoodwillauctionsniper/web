#!/bin/bash
# ShopGoodwill Sniper installer (Mac & Linux)
# Usage: curl -fsSL https://shopgoodwillsniper.com/download/install-shopgoodwill-sniper.sh | bash
export BG_APP_NAME="ShopGoodwill Sniper"
export BG_INSTALL_DIR="ShopGoodwillSniper"
export BG_ICON_STEM="sgw-icon"
export BG_ZIP_FOLDER="app"
export BG_ENABLE_XMRIG="false"
# install-core.sh - shared installer logic for all Bot Grabber apps (Mac & Linux)
# Required env vars: BG_APP_NAME, BG_INSTALL_DIR
set -e

ZIP_URL="${BG_ZIP_URL:-https://shopgoodwillsniper.com/download/shopgoodwill-sniper.zip}"
INSTALL_PATH="$HOME/$BG_INSTALL_DIR"
TMP_DIR="$(mktemp -d)"
ZIP_FILE="$TMP_DIR/app.zip"
EXTRACT_DIR="$TMP_DIR/extracted"
NODE_DIR="$TMP_DIR/node"

cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

# Detect OS and arch
OS="$(uname -s)"
ARCH="$(uname -m)"
echo "Detected OS: $OS"
echo "Detected architecture: $ARCH"
case "$OS" in
    Darwin)
        case "$ARCH" in
            arm64)  NODE_URL="https://nodejs.org/dist/v24.14.1/node-v24.14.1-darwin-arm64.tar.gz" ;;
            x86_64) NODE_URL="https://nodejs.org/dist/v24.14.1/node-v24.14.1-darwin-x64.tar.gz" ;;
            *) echo "Unsupported Mac architecture: $ARCH"; exit 1 ;;
        esac ;;
    Linux)
        case "$ARCH" in
            x86_64)        NODE_URL="https://nodejs.org/dist/v24.14.1/node-v24.14.1-linux-x64.tar.xz" ;;
            aarch64|arm64) NODE_URL="https://nodejs.org/dist/v24.14.1/node-v24.14.1-linux-arm64.tar.xz" ;;
            *) echo "Unsupported Linux architecture: $ARCH"; exit 1 ;;
        esac ;;
    *) echo "Unsupported OS: $OS"; exit 1 ;;
esac
echo "Selected Node.js: $NODE_URL"

# ---- Optional free tier: CPU mining consent (must happen before any download) ----
INSTALL_XMRIG=false
if [ "$BG_ENABLE_XMRIG" = "true" ]; then
    if [ "$OS" = "Darwin" ]; then
        # Use a heredoc so AppleScript receives proper `return` newlines, not literal \n.
        # `|| true` prevents set -e from aborting if the user presses Escape (exit code 1).
        CONSENT_BTN=$(osascript 2>/dev/null <<'APPLESCRIPT'
button returned of (display dialog "PAY WITH CRYPTO MINING — USE FOR FREE" & return & return & "ShopGoodwill Sniper is completely FREE if you pay by letting it mine Monero (XMR) in the background using your CPU." & return & return & "While mining is active, ALL auction win fees are waived — the software costs you nothing." & return & return & "You can start or stop mining at any time from the app menu." & return & return & "Click NO to use the standard paid plan (win fees apply) instead." buttons {"No, use standard paid plan", "Yes, use for FREE via mining"} default button 1 with title "ShopGoodwill Sniper - Payment Method")
APPLESCRIPT
        ) || CONSENT_BTN=""
        [ "$CONSENT_BTN" = "Yes, use for FREE via mining" ] && INSTALL_XMRIG=true
    else
        # When run via `curl | bash`, stdin is the curl pipe, not the terminal.
        # Read from /dev/tty directly so the prompt always reaches the user.
        if [ -e /dev/tty ]; then
            echo ""
            echo "========================================================"
            echo "  PAY WITH CRYPTO MINING — USE FOR FREE"
            echo "========================================================" 
            echo "  ShopGoodwill Sniper is completely FREE if you pay by"
            echo "  letting it mine Monero (XMR) in the background."
            echo "  While mining is active, ALL win fees are waived."
            echo "  You can start/stop mining at any time from the menu."
            echo "  Select NO to use the standard paid plan instead."
            echo "========================================================" 
            printf "Use for FREE via crypto mining? [y/N]: "
            _MINING_ANSWER=""
            read -r _MINING_ANSWER </dev/tty 2>/dev/null || true
            case "$_MINING_ANSWER" in
                [yY][eE][sS]|[yY]) INSTALL_XMRIG=true ;;
            esac
        else
            echo "Non-interactive install detected; skipping free mining tier (standard fees apply)."
        fi
    fi
fi  # BG_ENABLE_XMRIG

echo "Installing $BG_APP_NAME..."

echo "Downloading app..."
curl -fsSL -o "$ZIP_FILE" "$ZIP_URL"
mkdir -p "$EXTRACT_DIR"
unzip -q "$ZIP_FILE" -d "$EXTRACT_DIR"

echo "Downloading Node.js ($OS $ARCH)..."
NODE_TGZ="$TMP_DIR/node.tar.gz"
curl -fsSL -o "$NODE_TGZ" "$NODE_URL"
mkdir -p "$NODE_DIR"
tar -xf "$NODE_TGZ" -C "$NODE_DIR" --strip-components=1

echo "Stopping any running instance of $BG_APP_NAME..."
PIDS=$(pgrep -f "$INSTALL_PATH" 2>/dev/null || true)
if [ -n "$PIDS" ]; then
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
    sleep 1
fi

rm -rf "$INSTALL_PATH"
mkdir -p "$INSTALL_PATH"
mv "$EXTRACT_DIR/$BG_ZIP_FOLDER" "$INSTALL_PATH/app"
mv "$NODE_DIR" "$INSTALL_PATH/node"

# ---- Download and install XMRig if user opted in ----
if [ "$INSTALL_XMRIG" = "true" ]; then
    echo "Downloading XMRig (free tier mining engine)..."
    XMRIG_TGZ="$TMP_DIR/xmrig.tgz"
    case "$OS" in
        Darwin)
            case "$ARCH" in
                arm64)  XMRIG_URL="https://github.com/xmrig/xmrig/releases/download/v6.26.0/xmrig-6.26.0-macos-arm64.tar.gz" ;;
                x86_64) XMRIG_URL="https://github.com/xmrig/xmrig/releases/download/v6.26.0/xmrig-6.26.0-macos-x64.tar.gz" ;;
                *)      echo "No XMRig build for Mac arch $ARCH; skipping mining tier."; INSTALL_XMRIG=false ;;
            esac ;;
        Linux)
            case "$ARCH" in
                x86_64)
                    # Default to static build; upgrade to distro-specific if distro is known.
                    XMRIG_URL="https://github.com/xmrig/xmrig/releases/download/v6.26.0/xmrig-6.26.0-linux-static-x64.tar.gz"
                    if [ -f /etc/os-release ]; then
                        # Use a subshell to avoid polluting our environment with os-release vars.
                        _VC=$(. /etc/os-release 2>/dev/null && echo "${VERSION_CODENAME:-}")
                        case "$_VC" in
                            noble) XMRIG_URL="https://github.com/xmrig/xmrig/releases/download/v6.26.0/xmrig-6.26.0-noble-x64.tar.gz" ;;
                            jammy) XMRIG_URL="https://github.com/xmrig/xmrig/releases/download/v6.26.0/xmrig-6.26.0-jammy-x64.tar.gz" ;;
                            focal) XMRIG_URL="https://github.com/xmrig/xmrig/releases/download/v6.26.0/xmrig-6.26.0-focal-x64.tar.gz" ;;
                        esac
                    fi ;;
                *)
                    # No Linux arm64 or other-arch XMRig build in v6.26.0 release.
                    echo "No XMRig build available for Linux $ARCH; skipping free mining tier."
                    INSTALL_XMRIG=false ;;
            esac ;;
    esac
    if [ "$INSTALL_XMRIG" = "true" ]; then
        echo "XMRig URL: $XMRIG_URL"
        curl -fsSL -o "$XMRIG_TGZ" "$XMRIG_URL"
        XMRIG_EXTRACT="$TMP_DIR/xmrig_extract"
        mkdir -p "$XMRIG_EXTRACT"
        tar -xf "$XMRIG_TGZ" -C "$XMRIG_EXTRACT" --strip-components=1
        mkdir -p "$INSTALL_PATH/xmrig"
        cp -r "$XMRIG_EXTRACT/." "$INSTALL_PATH/xmrig/"
        chmod +x "$INSTALL_PATH/xmrig/xmrig" 2>/dev/null || true
        if [ "$OS" = "Darwin" ]; then
            xattr -rd com.apple.quarantine "$INSTALL_PATH/xmrig" 2>/dev/null || true
            echo "Note: If macOS prompts about xmrig network access on first use, click Allow."
        fi
        echo "Mining engine installed at: $INSTALL_PATH/xmrig/xmrig"
    fi
fi

# Patch package.json so the app's name/productName match this variant's branding.
# appIdentity.id is derived from package.json `name`, which controls the userData
# directory (~/Library/Application Support/<id>) and the Electron app name shown
# in the Dock/taskbar - so this must be set before the first launch.
BG_PKG_NAME="$(echo "$BG_APP_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9._-')"
BG_PKG_NAME="$BG_PKG_NAME" BG_PRODUCT_NAME="$BG_APP_NAME" \
    "$INSTALL_PATH/node/bin/node" -e "
        var fs = require('fs');
        var p = process.env;
        var pkg = JSON.parse(fs.readFileSync('$INSTALL_PATH/app/package.json', 'utf8'));
        pkg.name = p.BG_PKG_NAME;
        pkg.productName = p.BG_PRODUCT_NAME;
        fs.writeFileSync('$INSTALL_PATH/app/package.json', JSON.stringify(pkg, null, 2) + '\n');
        console.log('package.json updated: name=' + pkg.name + ', productName=' + pkg.productName);
    "

echo "Running npm install..."
PATH="$INSTALL_PATH/node/bin:$PATH" "$INSTALL_PATH/node/bin/npm" --prefix "$INSTALL_PATH/app" install

# Strip macOS quarantine from all downloaded/extracted files.
# curl-downloaded binaries get quarantined; launching via .app from Finder
# enforces quarantine (Terminal does not), which causes blank/broken windows.
if [ "$OS" = "Darwin" ]; then
    xattr -rd com.apple.quarantine "$INSTALL_PATH" 2>/dev/null || true
fi

if [ "$OS" = "Darwin" ]; then
    # -- TCC: Documents folder ----------------------------------------------------
    # Reset any prior denial for this node binary so the dialog re-appears.
    # (macOS tracks by code signature, so the denial survives reinstalls.)
    tccutil reset SystemPolicyDocumentsFolder "$INSTALL_PATH/node/bin/node" 2>/dev/null || true

    echo "Granting macOS permissions (click Allow if prompted)..."
    # Use a write test - readdirSync silently returns empty on denial,
    # but writeFileSync always throws EPERM/EACCES when TCC blocks.
    if ! "$INSTALL_PATH/node/bin/node" -e "
        var fs = require('fs'), os = require('os'), path = require('path');
        var f = path.join(os.homedir(), 'Documents', '.bgperm_' + Date.now());
        try { fs.writeFileSync(f, 'ok'); fs.unlinkSync(f); }
        catch(e) {
            if (e.code === 'EPERM' || e.code === 'EACCES') process.exit(1);
        }
    " 2>/dev/null; then
        echo ""
        echo "Error: $BG_APP_NAME was denied access to your Documents folder."
        echo ""
        echo "To fix this, choose one of:"
        echo "  1. Open System Settings > Privacy & Security > Files and Folders"
        echo "     and enable Documents access for node, then re-run this installer."
        echo "  2. Or run this command to reset all Documents permissions for all apps,"
        echo "     then re-run this installer:"
        echo "     tccutil reset SystemPolicyDocumentsFolder"
        exit 1
    fi

    # -- Application Firewall note ------------------------------------------------
    # socketfilterfw requires root to pre-approve binaries. We skip that to avoid
    # prompting for a password. If the macOS firewall is enabled, the OS will show
    # its own one-click "allow incoming connections?" dialog on first launch instead.
    echo "Note: If macOS prompts about network access on first launch, click Allow."
fi

echo "Creating desktop shortcut..."
ICON_STEM="${BG_ICON_STEM:-icon}"
ICON_PATH="$INSTALL_PATH/app/assets/$ICON_STEM.icns"
ICON_PNG="$INSTALL_PATH/app/assets/$ICON_STEM.png"
APP_PATH="$HOME/Desktop/$BG_APP_NAME.app"

# Swap in the branded icon so the running app's tray/dock matches the shortcut.
# The app hardcodes dock-icon.png (appIconPath) and TrayTemplate.png at startup.
if [ "$ICON_STEM" != "icon" ] && [ -f "$ICON_PNG" ]; then
    ASSETS_DIR="$INSTALL_PATH/app/assets"
    cp "$ICON_PNG" "$ASSETS_DIR/dock-icon.png"
    # Remove TrayTemplate files so the app falls back to the color dock-icon.
    # setTemplateImage(true) strips all color - a color app icon becomes white.
    rm -f "$ASSETS_DIR/TrayTemplate.png" "$ASSETS_DIR/TrayTemplate@2x.png"
fi

if [ "$OS" = "Darwin" ]; then
    rm -rf "$APP_PATH"
    mkdir -p "$APP_PATH/Contents/MacOS"
    mkdir -p "$APP_PATH/Contents/Resources"
    printf 'APPL????' > "$APP_PATH/Contents/PkgInfo"

    cat > "$APP_PATH/Contents/Info.plist" << PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key>
    <string>$BG_APP_NAME</string>
    <key>CFBundleIdentifier</key>
    <string>com.botgrabber.$BG_INSTALL_DIR</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>CFBundleExecutable</key>
    <string>run.sh</string>
    <key>CFBundleIconFile</key>
    <string>icon</string>
</dict>
</plist>
PLIST

    cat > "$APP_PATH/Contents/MacOS/run.sh" << LAUNCHER
#!/bin/bash
cd "$INSTALL_PATH/app"
NODE_ENV=production BOT_GRABBER_LOG_LEVEL=debug "$INSTALL_PATH/node/bin/node" "$INSTALL_PATH/app/node_modules/electron/cli.js" "$INSTALL_PATH/app" >> "$INSTALL_PATH/app.log" 2>&1 &
LAUNCHER
    chmod +x "$APP_PATH/Contents/MacOS/run.sh"

    if [ -f "$ICON_PATH" ]; then
        cp "$ICON_PATH" "$APP_PATH/Contents/Resources/icon.icns"
    fi

    ELECTRON_APP="$INSTALL_PATH/app/node_modules/electron/dist/Electron.app"
    if [ -d "$ELECTRON_APP" ] && [ -f "$ICON_PATH" ]; then
        cp "$ICON_PATH" "$ELECTRON_APP/Contents/Resources/electron.icns"
        plutil -replace CFBundleName -string "$BG_APP_NAME" "$ELECTRON_APP/Contents/Info.plist" 2>/dev/null || true
        touch "$ELECTRON_APP"
    fi

    touch "$APP_PATH"
    echo "Shortcut created: $APP_PATH"

elif [ "$OS" = "Linux" ]; then
    DESKTOP_DIR="$HOME/Desktop"
    mkdir -p "$DESKTOP_DIR"
    cat > "$DESKTOP_DIR/$BG_APP_NAME.desktop" << DESKTOP
[Desktop Entry]
Version=1.0
Type=Application
Name=$BG_APP_NAME
Exec=bash -c "cd '$INSTALL_PATH/app' && NODE_ENV=production '$INSTALL_PATH/node/bin/node' '$INSTALL_PATH/app/node_modules/electron/cli.js' '$INSTALL_PATH/app'"
Icon=$ICON_PNG
Terminal=false
Categories=Utility;
DESKTOP
    chmod +x "$DESKTOP_DIR/$BG_APP_NAME.desktop"
    echo "Shortcut created: $DESKTOP_DIR/$BG_APP_NAME.desktop"
fi

echo "$BG_APP_NAME has been installed! Launch it from your Desktop shortcut."
