# Project agent workflow

For this project, use the shared AI workflow maintained outside the repository.

## Source of truth

- Orchestrator: `C:\dev\ai-agents\orchestrator.md`
- Agents directory: `C:\dev\ai-agents\agents`

Do not copy agent definitions into this project. Always read the shared files when agent-specific guidance is needed so updates are picked up across projects.

## Operating rule

For every non-trivial project request:

1. Load the orchestrator from `C:\dev\ai-agents\orchestrator.md`.
2. Select the relevant agent profiles from `C:\dev\ai-agents\agents`.
3. Apply the orchestrator flow and decision gate before making structural or architectural decisions.
4. Use Janus as the final quality gate for production readiness, regressions, architecture consistency, security, testability, and maintainability.

## Agent map

- Archimedes: architecture and modular boundaries (`archimedes.md`)
- Solomon: clean code and vertical slice implementation (`solomon.md`)
- Oracle: data layer, EF Core, query performance (`horacle.md`)
- Hermes: API and integration design (`hermes.md`)
- Argus: tests and regression coverage (`argus.md`)
- Sentinel: security and hardening (`sentinel.md`)
- Vulcan: DevOps and CI/CD (`vulcan.md`)
- Pixel: UX/frontend review when applicable (`pixel.md`)
- Janus: final validation and quality gate (`janus.md`)
- Scribe: engineering history when tracking is requested or required (`scribe.md`)

## Defaults

Unless the user says otherwise, assume .NET 8, Vertical Slice Architecture, EF Core, Azure DevOps, xUnit, REST APIs, production-grade code, Modular Monolith architecture, MediatR, and FluentValidation.
