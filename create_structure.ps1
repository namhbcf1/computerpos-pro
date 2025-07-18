# PowerShell script to create directory structure for SmartPOS Pro
# Run this script with: powershell -ExecutionPolicy Bypass -File create_structure.ps1

# Define the base directory
$baseDir = "$PSScriptRoot\smartpos-pro"

# Create main directories
$mainDirs = @(
    ".github/workflows",
    ".vscode",
    "public/icons",
    "public/images/logo",
    "public/images/hero",
    "public/images/features",
    "public/images/testimonials",
    "public/images/mockups",
    "public/videos",
    "public/sounds",
    "public/fonts/Inter",
    "public/fonts/JetBrainsMono",
    "public/locales/en",
    "public/locales/vi",
    "src/components",
    "src/layouts",
    "src/lib",
    "src/pages",
    "src/styles",
    "src/assets",
    "src/utils",
    "src/types",
    "src/services",
    "src/hooks",
    "src/store",
    "src/context",
    "src/constants",
    "src/config",
    "src/router",
    "src/theme",
    "src/i18n",
    "src/analytics",
    "tests/unit",
    "tests/integration",
    "tests/e2e",
    "tests/utils",
    "tests/mocks",
    "tests/fixtures",
    "tests/coverage",
    "docs/api",
    "docs/guides",
    "docs/examples",
    "scripts",
    "config"
)

Write-Host "Creating directory structure for SmartPOS Pro..." -ForegroundColor Cyan

# Create base directory if it doesn't exist
if (-not (Test-Path -Path $baseDir)) {
    New-Item -ItemType Directory -Path $baseDir | Out-Null
    Write-Host "Created base directory: $baseDir" -ForegroundColor Green
}

# Create all directories
foreach ($dir in $mainDirs) {
    $fullPath = Join-Path -Path $baseDir -ChildPath $dir
    if (-not (Test-Path -Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-Host "Created directory: $fullPath" -ForegroundColor Green
    } else {
        Write-Host "Directory already exists: $fullPath" -ForegroundColor Yellow
    }
}

Write-Host "\nDirectory structure created successfully!" -ForegroundColor Green
Write-Host "Location: $baseDir" -ForegroundColor Cyan
