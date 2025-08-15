#!/bin/bash

# Setup Branch Protection for Master Branch
# This script uses GitHub CLI to configure branch protection rules

set -e

echo "🔒 Setting up branch protection for master branch..."

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first:"
    echo "   https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI. Please run: gh auth login"
    exit 1
fi

# Get repository info
REPO_OWNER=$(gh repo view --json owner --jq .owner.login)
REPO_NAME=$(gh repo view --json name --jq .name)

echo "📦 Repository: $REPO_OWNER/$REPO_NAME"

# Create branch protection rule
echo "🛡️  Creating branch protection rule for master branch..."

gh api repos/$REPO_OWNER/$REPO_NAME/branches/master/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":[]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":false,"require_last_push_approval":false}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false \
  --field required_linear_history=true \
  --field allow_fork_syncing=true

echo "✅ Branch protection rule created successfully!"

# Verify the protection rule
echo "🔍 Verifying branch protection rule..."
gh api repos/$REPO_OWNER/$REPO_NAME/branches/master/protection

echo "🎉 Branch protection setup complete!"
echo ""
echo "📋 Protection rules applied:"
echo "   - Require pull request reviews (1 approval)"
echo "   - Dismiss stale reviews"
echo "   - Require status checks to pass"
echo "   - Prevent force pushes"
echo "   - Prevent branch deletion"
echo "   - Require linear history"
echo "   - Allow fork syncing" 