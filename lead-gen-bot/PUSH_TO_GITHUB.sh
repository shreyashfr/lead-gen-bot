#!/bin/bash

# Lead Gen Bot - Push to GitHub
# Run this script from your local machine (not the VPS)

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         LEAD GEN BOT - GITHUB PUSH INSTRUCTIONS               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Verify git is configured
echo "Step 1: Verify Git Configuration"
echo "─────────────────────────────────────────────────────────────────"
git config --list | grep user
echo ""

# Step 2: Check current branch
echo "Step 2: Current Branch"
echo "─────────────────────────────────────────────────────────────────"
git branch
echo ""

# Step 3: Check remote
echo "Step 3: Remote Configuration"
echo "─────────────────────────────────────────────────────────────────"
git remote -v
echo ""

# Step 4: Push to GitHub
echo "Step 4: Pushing to GitHub"
echo "─────────────────────────────────────────────────────────────────"
echo "Pushing master branch to https://github.com/shreyashfr/lead-gen-bot/"
echo ""

# Push to GitHub (will prompt for authentication)
git push -u origin master

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Project pushed to GitHub!"
    echo ""
    echo "Visit: https://github.com/shreyashfr/lead-gen-bot"
    echo ""
else
    echo ""
    echo "❌ Push failed. Troubleshooting:"
    echo ""
    echo "1. Make sure you have internet connection"
    echo "2. Check GitHub username is correct: shreyashfr"
    echo "3. Have GitHub credentials ready (PAT or SSH key)"
    echo ""
    echo "For SSH key setup:"
    echo "  ssh-keygen -t ed25519 -C 'shreyash.chavan2016@gmail.com'"
    echo "  git remote set-url origin git@github.com:shreyashfr/lead-gen-bot.git"
    echo "  git push -u origin master"
    echo ""
fi
