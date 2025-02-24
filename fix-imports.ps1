# PowerShell script to fix relative imports
$files = Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Replace relative imports with absolute imports
    $content = $content -replace '(?m)^import\s+(.+?)\s+from\s+["'']\.\.\/(.+?)["'']', 'import $1 from "@/$2"'
    $content = $content -replace '(?m)^import\s+(.+?)\s+from\s+["'']\.\./\.\.\/(.+?)["'']', 'import $1 from "@/$2"'
    $content = $content -replace '(?m)^import\s+(.+?)\s+from\s+["'']\.\./\.\./\.\.\/(.+?)["'']', 'import $1 from "@/$2"'
    
    # Write the content back to the file
    Set-Content -Path $file.FullName -Value $content -NoNewline
}

Write-Host "Import paths have been updated." 