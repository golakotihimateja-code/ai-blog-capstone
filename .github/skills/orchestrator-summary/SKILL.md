### name: orchestrator-run-summary

## Purpose

Generate a concise summary of the completed Agentic SDLC workflow run.

## When To Use

Invoke after the full SDLC workflow completes.

The summary should be understandable by someone who did not observe the workflow execution.

## Output

Generate a Markdown report containing:

# Workflow Summary

## Objective

What the project aimed to build.

## Requirements Phase

Summary of requirements identified.

## Architecture Phase

Summary of architecture decisions.

## Design Review Phase

Key findings and improvements identified.

## Implementation Phase

Major files and features created.

## Code Review Phase

Important review observations.

## Verification Phase

Verification activities performed and results.

## Pull Request Phase

Summary of PR contents.

## Final Outcome

Project completion status.

## Outstanding Items

Any remaining work or future enhancements.

## Rules

- Be concise.
- Use markdown headings.
- Do not include secrets.
- Do not include raw logs.
- Focus on major outcomes rather than every action.