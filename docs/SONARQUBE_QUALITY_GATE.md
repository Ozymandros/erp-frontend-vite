# SonarQube Quality Gate Configuration

This document explains how to configure SonarQube/SonarCloud Quality Gate to only fail on **critical issues**, not on suggestions or minor code smells.

## 🎯 Philosophy

The CI pipeline should **only fail** when there are:

- **Real errors**: Tests failing, build errors, linting errors, confirmed vulnerabilities
- **Critical Quality Gate violations**: Bugs, Vulnerabilities, Critical Code Smells, Coverage below minimum

The pipeline should **NOT fail** for:

- Security Hotspots (review suggestions, not vulnerabilities)
- Minor Code Smells
- Maintenance suggestions
- Test duplication (often acceptable)
- Any "to review" items that are not actual issues

## 🔧 Configuring Quality Gate in SonarCloud

### Step 1: Access Quality Gate Settings

1. Go to your SonarCloud project
2. Navigate to **Quality Gates** → **Your Project's Quality Gate**
3. Click **Edit** on the default Quality Gate or create a custom one

### Step 2: Configure Conditions

Set up conditions that **only block on critical issues**:

#### ✅ Should Block Pipeline

- **Bugs**: `> 0` (any bugs should fail)
- **Vulnerabilities**: `> 0` (any vulnerabilities should fail)
- **Critical Code Smells**: `> 0` (critical issues should fail)
- **Coverage on New Code**: `< 80%` (adjust to your minimum)
- **Duplicated Lines on New Code**: `> 3%` (only in production code, not tests)

#### ❌ Should NOT Block Pipeline

- **Security Hotspots**: Do NOT add as a blocking condition
- **Minor Code Smells**: Do NOT add as a blocking condition
- **Info Code Smells**: Do NOT add as a blocking condition
- **Duplicated Lines in Tests**: Exclude test files from duplication checks

### Step 3: Exclude Test Files from Duplication

In `sonar-project.properties`, we already exclude test files:

```properties
sonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**,**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/test/**,**/__tests__/**,**/*.d.ts,**/vite-env.d.ts
sonar.test.exclusions=**/node_modules/**,**/dist/**,**/coverage/**,**/test/**,**/__tests__/**
```

This ensures duplication in tests doesn't affect the Quality Gate.

### Step 4: Configure Security Hotspots

Security Hotspots should be **reviewed manually**, not block the pipeline:

1. In SonarCloud, go to **Project Settings** → **Analysis Scope**
2. Ensure Security Hotspots are set to "Review" mode, not "Fail" mode

## 🔄 CI/CD Integration

The workflow is configured to:

1. **Run SonarQube analysis** with `continue-on-error: true`
2. **Check Quality Gate** but not fail the pipeline if it fails
3. **Report results** in the CI summary without blocking

This means:

- ✅ Critical issues (bugs, vulnerabilities) will still be reported
- ✅ The pipeline won't be blocked by suggestions or minor issues
- ✅ You can review Security Hotspots manually without blocking development

## 📊 Recommended Quality Gate Conditions

Here's a recommended setup for a balanced Quality Gate:

```
Conditions:
├── Bugs on New Code: > 0 ❌ (FAIL)
├── Vulnerabilities on New Code: > 0 ❌ (FAIL)
├── Critical Code Smells on New Code: > 0 ❌ (FAIL)
├── Coverage on New Code: < 80% ❌ (FAIL)
├── Duplicated Lines on New Code: > 3% ❌ (FAIL, production code only)
├── Security Hotspots: (NOT configured - manual review)
├── Minor Code Smells: (NOT configured - informational only)
└── Info Code Smells: (NOT configured - informational only)
```

## 🛠️ Custom Quality Gate Example

If you want to create a custom Quality Gate:

1. Go to **Quality Gates** → **Create**
2. Name it: `ERP Frontend - Critical Only`
3. Add only the critical conditions listed above
4. Assign it to your project

## 📝 Notes

- **Security Hotspots** are not vulnerabilities - they're areas to review manually
- **Code Smells** are suggestions for improvement, not errors
- **Test duplication** is often acceptable and should not block the pipeline
- The goal is a **stable, predictable pipeline** that catches real issues without false positives

## 🔗 Related Documentation

- [SonarCloud Quality Gates](https://docs.sonarcloud.io/user-guide/quality-gates/)
- [Security Hotspots vs Vulnerabilities](https://docs.sonarcloud.io/user-guide/security-hotspots/)
- [Code Smells](https://docs.sonarcloud.io/user-guide/code-smells/)
