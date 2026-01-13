# Contributing Guidelines

Thank you for your interest in contributing to Phala Cloud SDKs! This guide outlines the requirements for contributing to this project.

## Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification. All commits must adhere to this format:

```
<type>(<scope>): <subject>
```

### Allowed Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools
- `perf`: Performance improvements
- `ci`: Changes to CI configuration files and scripts
- `build`: Changes that affect the build system or external dependencies
- `revert`: Reverts a previous commit

### Examples

```
feat: add user authentication to CLI
fix: resolve memory leak in API client
docs: update README with installation steps
chore(deps): bump axios to 1.7.9
refactor(cli): simplify config loading logic
```

### Validation

All pull requests will be automatically checked for commit message compliance. If your commits do not follow the convention, the PR check will fail with guidance on the correct format.

**Note:** Commit messages are used to automatically generate changelogs, so following this convention is important for project maintenance.

## Submitting a New Template

To submit a new template, please follow these steps:

1. Modify `templates/config.json` and add your template entry following the schema format
2. Ensure your repository directory contains the following files:
   - `README.md`: Detailed documentation and usage instructions
   - `docker-compose.yml`: Deployment configuration
3. Update the project's `README.md` to include your template in the list of available templates
4. (Optional) Add an icon in the `templates/icons` directory:
5. (Optional) Add a "Deploy to Phala Cloud" button to your template's `README.md`:
   ```markdown
   [![](https://cloud.phala.com/deploy-button.svg)](https://cloud.phala.com/templates/{template_id})
   ```
   Replace `{template_id}` with your actual template ID

Thank you for your contribution!
