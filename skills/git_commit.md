## Git Commit Message Policy

When the user asks you to commit changes, inspect the actual Git diff before generating the commit message.

Before committing, run:

```bash
git status --short
git diff --stat
git diff
git diff --cached --stat
git diff --cached
```

Generate the commit message from the changes actually present in the repository, not only from the task description.

### Commit message format

Use Conventional Commit-style messages:

```text
<type>(<scope>): <concise imperative summary>
```

Use lowercase English for `type` and `scope`. Keep the summary concise, preferably within 72 characters.

### Paper data rules

When updating information for an existing paper:

```text
data(paper): update <paper-name> metadata
```

Use a more specific summary when appropriate:

```text
data(paper): expand <paper-name> experiment results
data(paper): add <paper-name> reproduction records
data(paper): refine <paper-name> method relations
```

When correcting inaccurate paper data:

```text
fix(data): correct <paper-name> <incorrect-field>
```

Examples:

```text
fix(data): correct DFlash publication metadata
fix(data): correct EAGLE citation records
```

When adding a new paper:

```text
feat(papers): add <paper-name>
```

When adding a paper explanation page:

```text
feat(explanations): add <paper-name> explanation page
```

When changing only the schema or data architecture:

```text
refactor(schema): <summary>
```

When modifying citation or relation graph behavior:

```text
feat(citation-graph): <summary>
```

Use `fix(citation-graph)` instead when correcting existing graph behavior.

### Commit body

For substantial changes, add a commit body containing concise bullet points:

```text
- Describe the important source-data changes.
- Describe generated files that were synchronized.
- Describe validation or tests that passed.
```

Do not include:

* The number of agents or subagents used.
* Internal planning or implementation-process commentary.
* Claims not supported by the actual diff.
* Unrelated changes merely mentioned in the task description.

### Generated data

Paper JSON files under `data/papers/` are the maintained source files.

When source paper data changes, regenerate and include the corresponding aggregate and browser runtime files in the same commit. Do not create a separate commit only for generated-file synchronization unless explicitly requested.

### Data integrity

Do not invent missing paper information.

Use `null` or empty arrays when the repository schema requires a field but no verified evidence exists.

Preserve finalized or read-only paper records unless the user explicitly asks to modify them.

### Commit execution

When asked to commit:

1. Inspect the diff.
2. Run the relevant synchronization and validation commands.
3. Generate the commit message according to these rules.
4. Show the proposed commit message briefly.
5. Execute `git commit` using that message without asking the user to write one.
6. Push only when the user explicitly asks to push or the original request includes pushing.

For a substantial commit, use:

```bash
git commit \
  -m "<type>(<scope>): <summary>" \
  -m "<body>"
```

For a small, self-explanatory change, use:

```bash
git commit -m "<type>(<scope>): <summary>"
```
