# Commit Command

Create a conventional commit with proper message.

## Usage

```
/commit [message]
```

## Context

@AGENTS.md

## Instructions

1. Run `git status` to see changes
2. Run `git diff --staged` to see what will be committed
3. If nothing staged, suggest staging specific files
4. Analyze the changes to determine commit type:
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation
   - `style`: Formatting
   - `refactor`: Code change
   - `test`: Tests
   - `chore`: Maintenance
5. If $ARGUMENTS provided, use as commit message base
6. Otherwise, generate appropriate commit message
7. Output the git commit command (do NOT execute unless asked)

## Example Output

```bash
git add [specific files]
git commit -m "feat(component): add loading state to Button

- Added isLoading prop
- Implemented spinner indicator
- Updated tests"
```
