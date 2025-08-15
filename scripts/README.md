# Repository Management Scripts

This directory contains scripts to help manage and maintain the repository.

## Scripts

### `setup-branch-protection.sh`

Automatically sets up branch protection rules for the master branch using GitHub CLI.

**Prerequisites:**
- GitHub CLI (`gh`) installed
- Authenticated with GitHub CLI (`gh auth login`)

**Usage:**
```bash
./scripts/setup-branch-protection.sh
```

**What it does:**
- Creates branch protection rule for master branch
- Requires pull request reviews (1 approval minimum)
- Prevents force pushes and branch deletion
- Requires linear history
- Dismisses stale reviews
- Allows fork syncing

## Manual Setup Instructions

If you prefer to set up branch protection manually:

### 1. Branch Protection Setup

1. Go to your repository on GitHub
2. Navigate to **Settings** > **Branches**
3. Click **Add rule** for the `master` branch
4. Configure the following settings:

**Protect matching branches:**
- Branch name pattern: `master`

**Rules to enable:**
- ✅ **Require a pull request before merging**
  - Require approvals: `1`
  - Dismiss stale PR approvals when new commits are pushed
  - Require review from code owners: `false`
  - Require last push approval: `false`

- ✅ **Require status checks to pass before merging**
  - Require branches to be up to date before merging: `true`
  - Status checks: (leave empty for now)

- ✅ **Require linear history**
- ✅ **Do not allow bypassing the above settings**
- ✅ **Restrict pushes that create files larger than 100 MB**

**Additional settings:**
- ❌ Allow force pushes
- ❌ Allow deletions
- ✅ Allow fork syncing

### 2. Automatic Branch Cleanup

The GitHub Actions workflow `.github/workflows/cleanup-branches.yml` will automatically delete feature branches after pull requests are merged.

**Features:**
- Triggers when a pull request is merged
- Only deletes feature branches (not main/master)
- Uses GitHub token for authentication
- Safe deletion with proper error handling

## Verification

After setup, you can verify the protection rules:

```bash
# Using GitHub CLI
gh api repos/:owner/:repo/branches/master/protection

# Or check in GitHub UI
# Go to Settings > Branches > master rule
```

## Troubleshooting

### GitHub CLI Issues
```bash
# Install GitHub CLI
brew install gh  # macOS
# or visit: https://cli.github.com/

# Authenticate
gh auth login
```

### Permission Issues
- Ensure you have admin access to the repository
- Check that the GitHub token has the necessary permissions

### Branch Protection Not Working
- Verify the rule is applied to the correct branch pattern
- Check that the rule is enabled
- Ensure you're not bypassing the rules as an admin 