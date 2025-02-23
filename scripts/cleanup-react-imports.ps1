$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx", "*.ts"
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $newContent = $content -replace "import React from 'react';\r?\n", "" `
        -replace "import \* as React from 'react';\r?\n", "" `
        -replace "import React, \{ [^}]+ \} from 'react';\r?\n", ""
    if ($content -ne $newContent) {
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Cleaned up React imports in $($file.Name)"
    }
} 