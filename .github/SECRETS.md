# GitHub Secrets Configuration

This document lists all GitHub Secrets required for the CI/CD pipelines.

## Required Secrets

Add these in **Settings → Secrets and variables → Actions → New repository secret**.

| Secret Name | Description | Example Value |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_API_URL` | Backend API base URL | `https://skill-workshop-management-system-backend.vercel.app/api/v1` |
| `NEXT_PUBLIC_FRONTEND_URL` | Frontend deployment URL | `https://skill-workshop-management-system.vercel.app` |
| `JWT_SECRET` | JWT signing secret (generate with `openssl rand -base64 32`) | `AoACz3wDD8s7AEZTMG711Jd4MZg2IRqpCmhMqTrCePs` |
| `VERCEL_TOKEN` | Vercel API token for deployments | `vercel_xxxxxxxxxxxx` |

## Workflows Using Secrets

| Workflow | Secrets Used |
|---|---|
| `ci.yml` | `NEXT_PUBLIC_BACKEND_API_URL`, `NEXT_PUBLIC_FRONTEND_URL`, `JWT_SECRET` |
| `ci-frontend.yml` | `NEXT_PUBLIC_BACKEND_API_URL`, `NEXT_PUBLIC_FRONTEND_URL`, `JWT_SECRET` |
| `ci-e2e.yml` | `NEXT_PUBLIC_BACKEND_API_URL`, `NEXT_PUBLIC_FRONTEND_URL`, `JWT_SECRET` |
| `bundle-analysis.yml` | `NEXT_PUBLIC_BACKEND_API_URL`, `NEXT_PUBLIC_FRONTEND_URL`, `JWT_SECRET` |
| `deploy-preview.yml` | `VERCEL_TOKEN`, `NEXT_PUBLIC_BACKEND_API_URL`, `NEXT_PUBLIC_FRONTEND_URL`, `JWT_SECRET` |
| `deploy-production.yml` | `VERCEL_TOKEN`, `NEXT_PUBLIC_BACKEND_API_URL`, `NEXT_PUBLIC_FRONTEND_URL`, `JWT_SECRET` |

## Environment Variables in Code

These secrets map to the following environment variables used by the application:

- `NEXT_PUBLIC_BACKEND_API_URL` — Used by `src/lib/constants.ts` to configure the API base URL
- `NEXT_PUBLIC_FRONTEND_URL` — Used by `src/lib/constants.ts` for frontend URL references
- `JWT_SECRET` — Used by middleware and auth utilities for session signing

## Generating JWT_SECRET

```bash
openssl rand -base64 32
```

## Vercel Token

1. Go to [Vercel Account Settings → Tokens](https://vercel.com/account/tokens)
2. Create a new token with full scope
3. Add it as `VERCEL_TOKEN` in GitHub Secrets
