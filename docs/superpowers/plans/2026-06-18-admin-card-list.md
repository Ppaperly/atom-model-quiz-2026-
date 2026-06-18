# Administrator Card List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the administrator participation rows with filtered, grouped, sortable square cards.

**Architecture:** Add pure filter and layout functions to `src/admin-view-model.js`, then let `src/app.js` render controls and grouped card sections from that model. Keep existing modal, visibility update, and deletion service calls unchanged. Add responsive layout rules to `feature-styles.css`.

**Tech Stack:** Vanilla JavaScript ES modules, CSS Grid, Node.js built-in test runner.

---

### Task 1: View-model filtering and grouping

- [ ] Add failing tests for empty-selection filtering, multiple grades/classes, recent order, team sections, and number order.
- [ ] Run the focused test and confirm missing exports fail.
- [ ] Implement `filterParticipationRecords`, `getParticipationFilterOptions`, and `buildParticipationSections`.
- [ ] Run focused and full tests.

### Task 2: Administrator controls and card menu

- [ ] Add static UI assertions for filter checkboxes, three layout buttons, card body, and ellipsis menu.
- [ ] Render dynamic grade/class filters and preserve the search field.
- [ ] Add `전체 배치`, `조별 배치`, and `번호순 배치` state.
- [ ] Open the existing answer modal from the card body.
- [ ] Move visibility and deletion actions into the card ellipsis menu.
- [ ] Close menus on outside click.

### Task 3: Responsive square grid

- [ ] Add CSS assertions for two mobile columns, four desktop columns, square aspect ratio, and group boundaries.
- [ ] Implement independent grade/class and team sections.
- [ ] Run all tests and JavaScript syntax checks.
- [ ] Create a feature branch, publish a PR, inspect the diff, and squash-merge to `main`.
