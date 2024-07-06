Param(
    [string]$commit_message
)

if (-not $commit_message) {
    Write-Host "Veuillez fournir un message de commit."
    exit 1
}

Add-Content README.md "$(Get-Date): $commit_message"
git add README.md
git commit --amend -m $commit_message
