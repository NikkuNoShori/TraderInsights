# Git Command Cheat Sheet

## Basic Commands

### Getting Started
```bash
git init                    # Initialize a new Git repository
git clone <url>            # Clone a repository from URL
git config --global user.name "Your Name"     # Set your Git username
git config --global user.email "your@email.com"  # Set your Git email
```

### Basic Operations
```bash
git status                 # Check repository status
git add <file>            # Add file(s) to staging area
git add .                 # Add all changes to staging area
git commit -m "message"   # Commit staged changes with a message
git commit --amend        # Modify the last commit
```

### Working with Branches
```bash
git branch                # List all local branches
git branch -a            # List all branches (local and remote)
git branch <name>        # Create a new branch
git checkout <branch>    # Switch to a branch
git checkout -b <branch> # Create and switch to a new branch
git merge <branch>       # Merge branch into current branch
git branch -d <branch>   # Delete a branch
```

### Remote Operations
```bash
git remote -v                     # View remote repositories
git remote add origin <url>       # Add remote repository
git push origin <branch>          # Push changes to remote branch
git pull origin <branch>          # Pull changes from remote branch
git fetch                         # Fetch changes from remote
git remote show origin           # Show remote branch information
```

### Viewing History
```bash
git log                   # View commit history
git log --oneline        # View commit history (compact)
git log --graph          # View commit history as graph
git diff                 # View unstaged changes
git diff --staged        # View staged changes
```

### Undoing Changes
```bash
git restore <file>       # Discard changes in working directory
git restore --staged <file>  # Unstage changes
git reset HEAD~1        # Undo last commit, keep changes
git reset --hard HEAD~1 # Undo last commit, discard changes
git revert <commit>     # Create new commit that undoes specified commit
```

### Stashing
```bash
git stash               # Stash changes
git stash list         # List stashes
git stash pop          # Apply and remove latest stash
git stash apply        # Apply latest stash (keep it in stash list)
git stash drop         # Remove latest stash
```

### Advanced Operations
```bash
git rebase <branch>     # Rebase current branch onto another
git cherry-pick <commit>  # Apply specific commit to current branch
git tag <tagname>      # Create a new tag
git tag -a <tagname> -m "message"  # Create annotated tag
```

### Cleaning
```bash
git clean -n            # Show what files would be removed
git clean -f            # Remove untracked files
git clean -fd           # Remove untracked files and directories
```

## Best Practices

1. Commit often with clear, descriptive messages
2. Pull before pushing to avoid conflicts
3. Create branches for new features/fixes
4. Keep commits atomic and focused
5. Don't commit sensitive information
6. Regularly fetch from upstream
7. Use .gitignore for project-specific exclusions

## Common Workflows

### Feature Branch Workflow
```bash
git checkout -b feature/new-feature  # Create feature branch
# Make changes
git add .
git commit -m "Add new feature"
git push origin feature/new-feature  # Push to remote
# Create pull request
```

### Fixing Mistakes
```bash
# Undo last commit but keep changes
git reset HEAD~1

# Completely undo last commit
git reset --hard HEAD~1

# Fix last commit message
git commit --amend -m "New message"
```

### Syncing with Upstream
```bash
git fetch upstream
git checkout main
git merge upstream/main
``` 