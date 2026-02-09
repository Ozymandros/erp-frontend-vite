# SonarQube Community Edition Setup

This project uses SonarQube Community Edition for code quality analysis.

## Setup Instructions

### Option 1: SonarCloud (Recommended - Free for Public Repos)

1. Go to [SonarCloud.io](https://sonarcloud.io/)
2. Sign in with your GitHub account
3. Import your repository
4. Generate a token from your account settings
5. Add the following secrets to your GitHub repository:
   - `SONAR_TOKEN`: Your SonarCloud token
   - `SONAR_HOST_URL`: `https://sonarcloud.io` (or leave empty, defaults to SonarCloud)

### Option 2: Self-Hosted SonarQube Community Edition

1. Set up a SonarQube Community Edition server
2. Create a project in SonarQube
3. Generate a token for the project
4. Add the following secrets to your GitHub repository:
   - `SONAR_TOKEN`: Your SonarQube token
   - `SONAR_HOST_URL`: Your SonarQube server URL (e.g., `https://sonarqube.example.com`)

## Configuration

The SonarQube analysis is configured in:
- `.github/workflows/ci.yml` - CI workflow with SonarQube job
- `sonar-project.properties` - SonarQube project configuration

## Analysis

SonarQube will automatically run on:
- Pull requests to `main` or `develop` branches
- Pushes to `main` or `develop` branches

The analysis includes:
- Code quality metrics
- Code smells detection
- Security vulnerabilities
- Test coverage (if available)
- Technical debt estimation

## Quality Gate

The workflow includes a Quality Gate check that will:
- Pass if code quality meets the defined standards
- Fail if code quality is below the threshold
- Continue on error (non-blocking) if SonarQube is not configured

## Notes

- The SonarQube job uses `continue-on-error: true` so it won't block the CI pipeline if SonarQube is not configured
- Coverage reports are generated from Vitest and uploaded to SonarQube
- The analysis excludes test files and generated files automatically
