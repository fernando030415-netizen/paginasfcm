$dest = "$env:USERPROFILE\Desktop\claude-transfer"
$zip  = "$env:USERPROFILE\Desktop\claude-transfer.zip"

Write-Host "Empacando todo..." -ForegroundColor Cyan

# Crear carpeta temporal
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
New-Item -ItemType Directory $dest | Out-Null
New-Item -ItemType Directory "$dest\claude-global" | Out-Null
New-Item -ItemType Directory "$dest\proyecto" | Out-Null

# 1. Config global de Claude
$claudeSrc = "$env:USERPROFILE\.claude"
Copy-Item "$claudeSrc\settings.json" "$dest\claude-global\" -ErrorAction SilentlyContinue
Copy-Item "$claudeSrc\mcp.json"      "$dest\claude-global\" -ErrorAction SilentlyContinue
Copy-Item "$claudeSrc\projects"      "$dest\claude-global\projects" -Recurse -ErrorAction SilentlyContinue
New-Item -ItemType Directory "$dest\claude-global\plugins" | Out-Null
Copy-Item "$claudeSrc\plugins\installed_plugins.json"  "$dest\claude-global\plugins\" -ErrorAction SilentlyContinue
Copy-Item "$claudeSrc\plugins\.install-manifests"      "$dest\claude-global\plugins\.install-manifests" -Recurse -ErrorAction SilentlyContinue

# 2. Proyecto completo (incluyendo .claude/launch.json)
$projectSrc = "D:\USER\Nueva carpeta (4)\#1 claude"
Copy-Item $projectSrc "$dest\proyecto\claude-projects" -Recurse -Exclude ".git" -ErrorAction SilentlyContinue

# 3. Script de instalación para Mac
@'
#!/bin/bash
echo "Instalando en Mac..."

CLAUDE_DIR="$HOME/.claude"
mkdir -p "$CLAUDE_DIR/plugins/.install-manifests"
mkdir -p "$CLAUDE_DIR/projects"

# Config global
cp claude-global/settings.json "$CLAUDE_DIR/"
cp claude-global/mcp.json      "$CLAUDE_DIR/"
cp -r claude-global/projects/. "$CLAUDE_DIR/projects/"
cp claude-global/plugins/installed_plugins.json "$CLAUDE_DIR/plugins/"
cp -r "claude-global/plugins/.install-manifests/." "$CLAUDE_DIR/plugins/.install-manifests/"

# Proyecto
PROJECTS_DIR="$HOME/Documentos/claude-projects"
mkdir -p "$PROJECTS_DIR"
cp -r proyecto/claude-projects/. "$PROJECTS_DIR/"

echo ""
echo "Listo. Pasos finales:"
echo "1. Abre Claude Code en el Mac"
echo "2. Los plugins se instalan solos"
echo "3. Abre el proyecto desde: $PROJECTS_DIR"
'@ | Out-File -FilePath "$dest\instalar-en-mac.sh" -Encoding utf8

# 4. ZIP
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path "$dest\*" -DestinationPath $zip
Remove-Item $dest -Recurse -Force

Write-Host ""
Write-Host "ZIP listo en tu Desktop: claude-transfer.zip" -ForegroundColor Green
Write-Host ""
Write-Host "En el Mac:" -ForegroundColor Yellow
Write-Host "  1. Abre Terminal"
Write-Host "  2. cd ~/Downloads/claude-transfer"
Write-Host "  3. chmod +x instalar-en-mac.sh && ./instalar-en-mac.sh"
