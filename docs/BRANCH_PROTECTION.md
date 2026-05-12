# Branch Protection Checklist

Recommended protection for `main` before production release:

- Require pull requests before merge.
- Require status checks:
  - `Typecheck & Unit Tests`
  - `E2E Tests`
  - `Dependency Audit`
  - future visual approval check
- Require code-owner review for `.github/`, `shared/src/avionics/`, adapter code, and reference metadata.
- Require all conversations resolved.
- Enable secret scanning and push protection.
- Enable dependency review for new vulnerable packages.
- Keep CI job names unique across workflows so required checks are unambiguous.

This file is an operational checklist. Repository settings still need to be applied in GitHub.
