# PowerShell script to remove legacy WebUll integration files

# Navigate to the project root directory
Set-Location -Path "C:\dev\TraderInsights"

Write-Host "Starting removal of legacy WebUll integration files..." -ForegroundColor Cyan

# Define array of files to be deleted
$filesToDelete = @(
    "src/lib/webull/client.ts",
    "src/lib/webull/types.ts",
    "src/lib/webull/test.ts",
    "src/lib/webull/storage.ts",
    "src/lib/webull/TROUBLESHOOTING.md",
    "src/lib/webull/TECHNICAL.md",
    "src/lib/webull/SUMMARY.md",
    "src/lib/webull/README.md",
    "src/lib/webull/QUICKSTART.md",
    "src/types/webull.d.ts",
    "src/components/webull/WebullTest.tsx"
)

# Delete each file
foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Write-Host "Removing $file..." -ForegroundColor Yellow
        Remove-Item -Path $file -Force
    }
    else {
        Write-Host "Warning: $file not found. Skipping..." -ForegroundColor Red
    }
}

# Create the webull directory structure if it doesn't exist
$directoriesToCreate = @(
    "src/lib/webull"
)

foreach ($dir in $directoriesToCreate) {
    if (-not (Test-Path $dir)) {
        Write-Host "Creating directory $dir..." -ForegroundColor Green
        New-Item -Path $dir -ItemType Directory -Force | Out-Null
    }
}

# Create stub files for new implementation
$stubFiles = @{
    "src/types/webull.ts"   = "// WebUll API type definitions - To be implemented";
    "src/lib/webull/api.ts" = "// WebUll API client - To be implemented";
}

foreach ($stubFile in $stubFiles.Keys) {
    Write-Host "Creating stub file $stubFile..." -ForegroundColor Green
    New-Item -Path $stubFile -ItemType File -Force | Out-Null
    Set-Content -Path $stubFile -Value $stubFiles[$stubFile]
}

# Create backup of files that will be modified later
$filesToBackup = @(
    "src/services/webullService.ts",
    "src/utils/webullTransforms.ts",
    "src/components/trades/WebullImportForm.tsx"
)

foreach ($file in $filesToBackup) {
    if (Test-Path $file) {
        $backupFile = "$file.bak"
        Write-Host "Creating backup of $file to $backupFile..." -ForegroundColor Yellow
        Copy-Item -Path $file -Destination $backupFile -Force
    }
    else {
        Write-Host "Warning: $file not found. Cannot create backup." -ForegroundColor Red
    }
}

Write-Host "Legacy WebUll integration files removal complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review the integration guide at src/docs/WEBULL_API_INTEGRATION_GUIDE.md" -ForegroundColor White
Write-Host "2. Implement the new WebUll API client following the guide" -ForegroundColor White
Write-Host "3. Update the service layer and UI components" -ForegroundColor White 