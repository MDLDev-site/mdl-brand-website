# MDL Lambdas — Project Context

## Overview
Backend API layer — 237+ AWS Lambda functions serving the entire MDL platform.

## Tech Stack
- **Runtime:** Node.js 20.x (.mjs ESM modules)
- **Architecture:** arm64 (Graviton2)
- **API:** API Gateway v2 (HTTP API)
- **Database:** DynamoDB (single-table design per feature)
- **Queue:** SQS for async operations
- **Storage:** S3 for media and assets
- **Auth:** Cognito authorizer at API Gateway level

## Architecture
- Function-per-endpoint pattern (one Lambda per API route)
- channel_id extracted from authorizer context (NEVER from headers)
- Standard response format: `{ statusCode, headers, body: JSON.stringify({ data }) }`
- Memory: 256 MB default, timeout: 30 seconds
- Required resource tags: Project, Feature, Environment, Team, CostCenter, LinearIssue

## Key Patterns
- ALL queries scoped by channel_id
- Ownership verification before mutations
- Generic error messages (never expose internals)
- No PII in CloudWatch logs
- DynamoDB: GSI for access patterns, ProjectionExpression to reduce RCU

## Current State
*(Update as work progresses)*
