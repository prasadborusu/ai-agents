# REMEMBR System Architecture

Explains high-level dataflow between React SPA, FastAPI backend, Supabase DB, and Hindsight.


## Security Boundaries
All communications between UI and API enforce TLS 1.3 encryption.


## Memory Lifecycle
Every recorded incident writes immutable audit trail in memory references.
