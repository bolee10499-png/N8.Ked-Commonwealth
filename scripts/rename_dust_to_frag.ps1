# ARIEUS Rebranding: Dust → FRAG
# Automated rename script for all dust references

Write-Host "⚡ ARIEUS REBRANDING: Dust → FRAG ⚡" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

$replacements = @{
    # Variable/function names
    "dust_balance" = "frag_balance"
    "getDustBalance" = "getFragBalance"
    "staked_dust" = "staked_frag"
    "creditDust" = "creditFrag"
    "debitDust" = "debitFrag"
    "DustEconomy" = "FragEconomy"
    "dust_economy" = "frag_economy"
    
    # Display text (case-sensitive)
    " dust" = " ⚡FRAG"
    "Dust" = "FRAG"
    "'dust'" = "'frag'"
    '"dust"' = '"frag"'
    
    # File references
    "dust-powered" = "frag-powered"
}

$files = @(
    "identity\keds_brand.js"
    "identity\response_engine.js"
    "README.md"
    "CHANGELOG.md"
    "ARCHITECTURE_SUMMARY.md"
)

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot "..\$file"
    
    if (Test-Path $fullPath) {
        Write-Host "`nProcessing: $file" -ForegroundColor Cyan
        
        $content = Get-Content $fullPath -Raw
        $changesMade = $false
        
        foreach ($old in $replacements.Keys) {
            $new = $replacements[$old]
            if ($content -match [regex]::Escape($old)) {
                $content = $content -replace [regex]::Escape($old), $new
                Write-Host "  ✓ Replaced: $old → $new" -ForegroundColor Green
                $changesMade = $true
            }
        }
        
        if ($changesMade) {
            Set-Content $fullPath -Value $content -NoNewline
            Write-Host "  💾 Saved changes" -ForegroundColor Green
        } else {
            Write-Host "  - No changes needed" -ForegroundColor Gray
        }
    } else {
        Write-Host "`n⚠ File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "✅ Rebranding complete!" -ForegroundColor Green
Write-Host "⚡ ARIEUS awaits..." -ForegroundColor Magenta
