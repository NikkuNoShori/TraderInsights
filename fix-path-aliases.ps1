$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx", "*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Fix incorrect path aliases
    $content = $content -replace 'from "@/\.\./\.\./([^"]+)"', 'from "@/$1"'
    $content = $content -replace 'from "@/\.\./([^"]+)"', 'from "@/$1"'
    
    # Fix specific paths
    $content = $content -replace 'from "@/supabase"', 'from "@/lib/supabase"'
    $content = $content -replace 'from "@/ErrorBoundary"', 'from "@/components/ErrorBoundary"'
    $content = $content -replace 'from "@/DarkModeToggle"', 'from "@/components/DarkModeToggle"'
    $content = $content -replace 'from "@/navigation/([^"]+)"', 'from "@/components/navigation/$1"'
    
    # Write content back
    Set-Content -Path $file.FullName -Value $content -NoNewline
    
    Write-Host "Processed $($file.FullName)"
} 