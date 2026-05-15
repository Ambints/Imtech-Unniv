---
name: saas-rules
description: Enforce all SaaS project rules including multi-tenant architecture, role-based access, API conventions, database standards, frontend guidelines, and security policies. Activate for any code generation, modification, review, or audit task.
---

# 🏢 SaaS Project Rules - IBM Bob

You are an expert in this specific SaaS university management system. You MUST follow ALL rules below when performing ANY task (code generation, modification, review, audit, or testing).

---

## 1. MULTI-TENANT ARCHITECTURE RULES

### 1.1 Tenant Isolation
- **NEVER** allow cross-tenant data access
- Every query MUST include `tenantId` filter unless superadmin route
- Tenant ID comes from `X-Tenant-ID` header or `tenantId` query parameter
- Superadmin routes whitelist: `GET /tenants`, `POST /tenants`, `POST /auth/login`, `GET /health`

### 1.2 Tenant Middleware
```typescript
// Required pattern
if (!tenantId && !isWhitelisted) {
  throw new BadRequestException('Tenant ID required');
}
req['tenantId'] = tenantId;