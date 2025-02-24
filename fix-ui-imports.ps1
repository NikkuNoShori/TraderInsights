$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx", "*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Fix UI component imports
    $content = $content -replace 'import \{ ([^}]+) \} from "@/ui/([^"]+)";', 'import { $1 } from "@/components/ui";'
    $content = $content -replace 'import \{ ([^}]+) \} from "@/../../components/ui/([^"]+)";', 'import { $1 } from "@/components/ui";'
    $content = $content -replace 'import \{ ([^}]+) \} from "@/../components/ui/([^"]+)";', 'import { $1 } from "@/components/ui";'
    
    # Write content back
    Set-Content -Path $file.FullName -Value $content -NoNewline
    
    Write-Host "Processed $($file.FullName)"
} 