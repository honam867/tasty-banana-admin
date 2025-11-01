# AGENTS.md (Admin Implementer – Code-Aware Codex)

**Agent Name:** AdminImplementer
**Location:** `tasty-banana-admin/AGENTS.md`
**Scope:** Read feature markdown files under `tasty-banana-admin/features/`, then generate React/TSX admin pages and API service files. If the dispatcher could not provide exact response shape, you must **inspect existing code** (in `tasty-banana-v2/`) or gracefully generate a placeholder.

---

## 1. Input

```json
{
  "feature_file": "tasty-banana-admin/features/admin-user-management.md"
}
```

You may also receive:

```json
{
  "feature_file": "tasty-banana-admin/features/admin-user-management.md",
  "api_base": "/api",
  "component_lib": "antd"
}
```

---

## 2. Decision-Making Conditions

| Condition                               | Action                                                   |
| --------------------------------------- | -------------------------------------------------------- |
| `status: pending`                       | implement now                                            |
| `status: in-progress`                   | continue                                                 |
| `status: done`                          | stop                                                     |
| endpoint has `response_shape: UNKNOWN`  | try to infer from codebase (see below)                   |
| endpoint has `code_lookup` paths        | open those files to derive fields                        |
| UI blocks contains “list”               | render table using derived fields                        |
| UI blocks contains “create / edit form” | render form using derived request body                   |
| data still unknown after inspection     | generate component with TODO + keep status `in-progress` |

---

## 3. Code Inspection Guideline

When you see:

```yaml
response_shape: UNKNOWN (implementer: inspect tasty-banana-v2 for real schema)
code_lookup:
  - tasty-banana-v2/server/routes/users.ts
  - tasty-banana-v2/server/controllers/users.ts
```

you should:

1. Look up those files in the repo.
2. Derive:
   - actual endpoint URL (confirm)
   - actual method
   - actual response fields (e.g. `id`, `email`, `role`, `status`)
3. Map those to table columns / form fields.
4. If still not found → fall back to:
   ```ts
   type UnknownResponse = {
     success?: boolean;
     data?: any[];
     message?: string;
   };
   ```
   and leave TODO in generated file.

---

## 5. Updating the Feature File

After you generate code:

1. If you succeeded in deriving the real response → set `status: done`
2. If some parts are still unknown → set `status: in-progress` and describe missing parts
3. Append to `## 7. Execution Log`
4. Append `## 8. Generated Files` if not present

Example:

```markdown
## 7. Execution Log

- 2025-11-02: implemented by AdminImplementer (list + form, response derived from tasty-banana-v2/server/controllers/users.ts)

## 8. Generated Files

- src/pages/admin/AdminUserManagement.tsx
- src/services/admin/admin-user-management.ts
```

---

## 6. Output Format

```json
{
  "status": "ok",
  "updated_feature_file": "tasty-banana-admin/features/admin-user-management.md",
  "generated_files": [
    "src/pages/admin/AdminUserManagement.tsx",
    "src/services/admin/admin-user-management.ts"
  ],
  "notes": "Response derived from code."
}
```

If still unknown:

```json
{
  "status": "partial",
  "reason": "Backend response unknown, added TODOs",
  "updated_feature_file": "tasty-banana-admin/features/admin-user-management.md"
}
```

---

## 7. Rules

- Do NOT rename feature files
- Do NOT delete dispatcher sections
- Prefer actual code inspection over guessing

---

_End of Admin Implementer AGENTS.md_
