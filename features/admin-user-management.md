# Admin User Management

status: done
id: admin-user-management
updated_at: 2025-11-01T00:00:00Z
agent: admin-implementer
target: tasty-banana-admin

## 1. Summary

- Admins can list/search/filter users, view details, create new users, edit profile fields (username, email, role, status), lock/unlock by status, soft-delete or hard-delete, and manage user tokens (view balance/history, credit/debit with idempotency).

## 2. Pages / Routes

- /admin/users
- /admin/users/:userId

## 3. UI Blocks

- [ ] list
- [ ] filter / search
- [ ] create / edit form
- [ ] detail / drawer
- [ ] token balance + history panel
- [ ] token credit/debit modal

## 4. Data Contract (hint)

API_BASE: /api

### 4.1 Endpoints

- name: list users
  method: GET
  url: /api/admin/users
  request_from: query params (page, limit, search, role, status, sortBy, sortOrder)
  response_shape: UNKNOWN (implementer: inspect tasty-banana-v2 for real schema)
  code_lookup:

  - tasty-banana-v2/server/src/routes/admin/users.route.js
  - tasty-banana-v2/server/src/controllers/admin/users.controller.js
  - tasty-banana-v2/server/src/services/admin/userManagement.service.js

- name: get user details
  method: GET
  url: /api/admin/users/:userId
  request_from: path params
  response_shape: UNKNOWN (implementer: inspect service/controller)
  code_lookup:

  - tasty-banana-v2/server/src/routes/admin/users.route.js
  - tasty-banana-v2/server/src/controllers/admin/users.controller.js
  - tasty-banana-v2/server/src/services/admin/userManagement.service.js

- name: create user
  method: POST
  url: /api/admin/users
  request_from: body (username, email, password, role?, status?, initialTokens?)
  response_shape: UNKNOWN
  code_lookup:

  - tasty-banana-v2/server/src/controllers/admin/users.controller.js
  - tasty-banana-v2/server/src/services/admin/userManagement.service.js

- name: update user
  method: PUT
  url: /api/admin/users/:userId
  request_from: body (username?, email?, role?, status?)
  response_shape: UNKNOWN
  code_lookup:

  - tasty-banana-v2/server/src/controllers/admin/users.controller.js
  - tasty-banana-v2/server/src/services/admin/userManagement.service.js

- name: update user status (lock/unlock)
  method: PATCH
  url: /api/admin/users/:userId/status
  request_from: body (status: active|inactive, reason?)
  response_shape: UNKNOWN
  code_lookup:

  - tasty-banana-v2/server/src/controllers/admin/users.controller.js
  - tasty-banana-v2/server/src/services/admin/userManagement.service.js

- name: delete user
  method: DELETE
  url: /api/admin/users/:userId
  request_from: query (permanent=true|false)
  response_shape: UNKNOWN
  code_lookup:

  - tasty-banana-v2/server/src/controllers/admin/users.controller.js
  - tasty-banana-v2/server/src/services/admin/userManagement.service.js

- name: get token balance
  method: GET
  url: /api/admin/users/:userId/tokens/balance
  request_from: path params
  response_shape: UNKNOWN
  code_lookup:

  - tasty-banana-v2/server/src/controllers/admin/users.controller.js
  - tasty-banana-v2/server/src/services/tokens/TokenService.js

- name: get token history
  method: GET
  url: /api/admin/users/:userId/tokens/history
  request_from: query (limit?, cursor?, type?, reason?)
  response_shape: UNKNOWN
  code_lookup:

  - tasty-banana-v2/server/src/controllers/admin/users.controller.js
  - tasty-banana-v2/server/src/services/tokens/TokenService.js

- name: credit tokens
  method: POST
  url: /api/admin/users/:userId/tokens/credit
  request_from: body (amount[int, required], reason?, notes?, idempotencyKey?)
  response_shape: UNKNOWN
  code_lookup:

  - tasty-banana-v2/server/src/controllers/admin/users.controller.js
  - tasty-banana-v2/server/src/services/admin/userManagement.service.js

- name: debit tokens
  method: POST
  url: /api/admin/users/:userId/tokens/debit
  request_from: body (amount[int, required], reason?, notes?, idempotencyKey?)
  response_shape: UNKNOWN
  code_lookup:

  - tasty-banana-v2/server/src/controllers/admin/users.controller.js
  - tasty-banana-v2/server/src/services/admin/userManagement.service.js

### 4.2 Server Schema (context)

- users table (from tasty-banana-v2/server/src/db/schema.js):
  - id (uuid), username (string, unique), password (string), email (string, unique), role (string, default "user"), status (string, default "active"), createdAt, updatedAt
- user_tokens table joins to users for balances
- token_transactions table used for history and admin credit/debit traces

## 5. Permissions

- required_roles: ["admin"]

## 6. Notes for Implementer

- use antd
- reuse layout
- generate service from endpoint list
- implement paginated table with columns: username, email, role, status (badge), tokenBalance, createdAt; actions: View, Edit, Status (Activate/Deactivate), Delete
- add search (username/email), role/status filters, sort by createdAt/username/email
- detail drawer loads GET details + balance; include token panel with Credit/Debit modals
- create/edit form: username, email, password (create only), role (admin/user/mod/warehouse/owner), status (active/inactive)
- delete flow: soft delete by default; surface permanent delete with confirm dialog
- idempotencyKey optional input for token ops (generate UUID client-side)
- if response is UNKNOWN ? fetch once and derive fields for table

## 7. Execution Log

- 2025-11-01: created by AdminDispatcher
- 2025-11-01: Implemented Admin Users list/detail with credit/debit using coin icon; services and routes added by Codex
- 2025-11-01: Fixed token credit/debit form amount validation by switching to InputNumber
- 2025-11-01: Forced token credit/debit modals to render on document.body to avoid inline forms in drawer
- 2025-11-01: Credit/Debit modals now display current balance and refresh token info after submit
- 2025-11-01: Token history parsing updated to handle backend { transactions: [...] } shape
- 2025-11-01: Date displays formatted with dayjs (DD-MM-YYYY HH:mm)
- 2025-11-01: Optimized user list action column with colored icon buttons
- 2025-11-01: Added reusable AdminTable + action icons (adopted on Users, Prompts, Style Libraries, Hints, Operations)

## 8. Generated Files
- src/features/users/pages/AdminUsersPage.tsx
- src/components/admin/AdminUserForm.tsx
- src/features/users/api/users.api.ts

