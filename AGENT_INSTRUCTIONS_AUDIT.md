# Agent Instructions Audit & Optimization Report

**Date:** February 5, 2026  
**Project:** erp-frontend-vite  
**Auditor:** Expert AI Solutions Architect

---

## Executive Summary

This audit evaluates your agent instruction files against three industry benchmarks:

1. **Antigravity (Google)** - Actionability & Trigger→State→Action patterns
2. **Cursor Rules** - Contextual efficiency & modular MDC format
3. **GitHub Copilot** - Guardrails & negative constraints

### Current State

**Found Files:**

- ✅ `.agents/skills/vercel-react-best-practices/AGENTS.md` (2,935 lines) - Skill-based, not project-level
- ❌ No `.cursor/rules/` directory
- ❌ No `.github/copilot-instructions.md`
- ❌ No root-level `AGENTS.md`
- ❌ No `.cursorrules`

**Critical Finding:** Your project lacks project-level agent instructions. The only instruction file is nested in a skill directory, which may not be automatically discovered by all AI tools.

---

## 1. Alignment Scores

### 1.1 Antigravity Alignment: **6/10**

**Strengths:**

- ✅ Rules include impact metrics (CRITICAL, HIGH, MEDIUM, LOW)
- ✅ Each rule has clear "Incorrect" vs "Correct" examples
- ✅ Rules are categorized by priority

**Weaknesses:**

- ❌ **No Trigger→State→Action structure** - Rules are descriptive, not imperative
- ❌ **Missing conditional triggers** - No "When X happens, do Y" patterns
- ❌ **No activation conditions** - Rules don't specify when to apply
- ❌ **Lacks imperative language** - Uses "should" instead of "must" or "when"

**Example of Missing Actionability:**

```markdown
# Current (Weak):

"Use Promise.all() for independent operations"

# Should be (Strong):

"When you encounter sequential await statements with no dependencies,
immediately refactor to Promise.all() to parallelize execution."
```

### 1.2 Cursor Rules Alignment: **7/10**

**Strengths:**

- ✅ Dense, technical content (no fluff)
- ✅ Concrete code examples
- ✅ Well-organized categories
- ✅ References to external resources

**Weaknesses:**

- ❌ **Not in `.cursor/rules/` format** - File is in skill directory
- ❌ **No MDC frontmatter** - Missing `description`, `globs`, `alwaysApply`
- ❌ **Too large** - 2,935 lines violates "keep under 500 lines" best practice
- ❌ **No modular structure** - Should be split into multiple `.mdc` files
- ❌ **Missing @-references** - Doesn't leverage Cursor's file reference system

**Recommendation:** Split into modular `.cursor/rules/*.mdc` files with frontmatter.

### 1.3 GitHub Copilot Alignment: **5/10**

**Strengths:**

- ✅ Some negative constraints ("Avoid barrel file imports")
- ✅ Clear "Incorrect" vs "Correct" patterns

**Weaknesses:**

- ❌ **Missing explicit "Never" statements** - No strong guardrails
- ❌ **No build/validation instructions** - Missing critical GitHub Copilot requirements
- ❌ **No project layout documentation** - Doesn't help agent understand codebase structure
- ❌ **No path-specific instructions** - Should use `.github/instructions/*.instructions.md`

**Critical Missing Elements:**

- Build commands (`pnpm build`, `pnpm test`)
- Project structure explanation
- API client architecture (Axios vs Dapr)
- Environment variable requirements
- Testing patterns

---

## 2. Critical Fixes

### 2.1 Immediate Issues

1. **Missing Project-Level Instructions**

   - Create `.github/copilot-instructions.md` for GitHub Copilot
   - Create `.cursor/rules/` directory with modular rules
   - Create root-level `AGENTS.md` for universal compatibility

2. **File Too Large**

   - Current: 2,935 lines in single file
   - Should be: Multiple files under 500 lines each
   - Split by category (waterfalls, bundle, server, client, etc.)

3. **No Activation Metadata**

   - Add MDC frontmatter with `globs` patterns
   - Specify `alwaysApply: false` with intelligent descriptions
   - Use `@-mentions` for file references

4. **Missing Build Instructions**

   - Document `pnpm build`, `pnpm test`, `pnpm lint` commands
   - Explain environment setup
   - Document API client selection logic

5. **Weak Guardrails**
   - Add explicit "Never" statements
   - Specify anti-patterns to avoid
   - Add security constraints

### 2.2 Structural Issues

1. **No Trigger Conditions**

   - Rules don't specify when to apply
   - Missing "When editing React components..." triggers
   - No file pattern matching

2. **Lacks Project Context**

   - Doesn't explain Vite vs Next.js differences
   - Missing API client architecture (Axios/Dapr)
   - No routing structure documentation

3. **No Tool-Specific Syntax**
   - Missing Cursor `@-references`
   - No GitHub Copilot path-specific instructions
   - Doesn't leverage Antigravity's rule activation

---

## 3. Refined Instructions (Gold Standard)

I'll create optimized instruction files following all three benchmarks. See the following files:

1. **`.github/copilot-instructions.md`** - GitHub Copilot repository-wide instructions
2. **`.cursor/rules/`** - Modular Cursor rules with MDC frontmatter
3. **`AGENTS.md`** - Universal agent instructions (root level)

---

## 4. Recommendations

### Priority 1: Create Project-Level Instructions

- ✅ Create `.github/copilot-instructions.md` (build, test, project structure)
- ✅ Create `.cursor/rules/` directory with modular `.mdc` files
- ✅ Create root-level `AGENTS.md` for universal compatibility

### Priority 2: Refactor Existing Skill File

- Split `.agents/skills/vercel-react-best-practices/AGENTS.md` into smaller modules
- Add MDC frontmatter with activation conditions
- Add trigger-based language ("When X, do Y")

### Priority 3: Add Guardrails

- Explicit "Never" statements for common mistakes
- Security constraints (e.g., "Never expose API keys")
- Anti-patterns specific to Vite + React Router

### Priority 4: Enhance Actionability

- Convert descriptive rules to imperative triggers
- Add file pattern matching (`globs`)
- Specify activation conditions

---

## 5. Next Steps

1. Review the generated instruction files
2. Customize for your specific project needs
3. Test with your AI tools (Cursor, GitHub Copilot, etc.)
4. Iterate based on agent behavior
5. Keep instructions under 500 lines per file

---

**Note:** The optimized files will be created in the following order:

1. `.github/copilot-instructions.md` (GitHub Copilot)
2. `.cursor/rules/` directory structure (Cursor)
3. `AGENTS.md` (Universal)
