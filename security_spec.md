# Security Specification: Tatkal Assist Pro RBAC & User Management

## 1. Data Invariants
- Only verified system administrators (`admins/{adminId}`) may create, view all, update roles, or suspend user accounts.
- Normal users may only read and update their own profile document (`/users/{userId}`) where `userId == request.auth.uid`.
- Regular users cannot escalate their role to `admin` or modify their `role` field.
- Document IDs must conform to valid alphanumeric strings (`isValidId()`).
- Audit logs (`/audit_logs/{logId}`) are writeable only by authenticated administrators and cannot be altered or deleted once written.

## 2. Dirty Dozen Security Attack Payloads
1. **Unauthenticated User Enumeration**: Anonymous GET `/users` -> Expected: PERMISSION_DENIED.
2. **Standard User Role Escalation**: User `user-123` updates `/users/user-123` with `{ "role": "admin" }` -> Expected: PERMISSION_DENIED.
3. **Impersonated User Creation**: Non-admin attempting to POST `/users/user-456` -> Expected: PERMISSION_DENIED.
4. **Admin Document Insertion**: Non-admin user attempting to write `/admins/{request.auth.uid}` -> Expected: PERMISSION_DENIED.
5. **Cross-Tenant Account Tampering**: User `user-123` attempting to modify `/users/user-999` -> Expected: PERMISSION_DENIED.
6. **Audit Log Tampering / Deletion**: Any user attempting DELETE on `/audit_logs/log-1` -> Expected: PERMISSION_DENIED.
7. **Audit Log Modification**: Modifying an existing audit log -> Expected: PERMISSION_DENIED.
8. **Malicious ID Path Poisoning**: Accessing `/users/../../system` -> Expected: PERMISSION_DENIED.
9. **Oversized String Buffer Overflow Payload**: Injecting 500KB JSON into profile -> Expected: PERMISSION_DENIED.
10. **Suspended Account Privilege Execution**: User with status `suspended` attempting write actions -> Expected: PERMISSION_DENIED.
11. **Arbitrary Field Injection (Shadow Fields)**: Creating user doc with undocumented keys -> Expected: PERMISSION_DENIED.
12. **Blanket Read Request without Auth**: Unauthenticated GET on `/audit_logs` -> Expected: PERMISSION_DENIED.
