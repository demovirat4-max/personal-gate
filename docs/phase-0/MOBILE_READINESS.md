# Mobile Readiness Specification (Expo / React Native)

## 1. Architectural Strategy for Cross-Platform Mobile Application

The system is designed from day zero so a future Expo / React Native mobile application can consume the exact same backend services, authentication flows, and data contracts without backend changes.

```text
               +----------------------------------+
               |  Next.js 15 App Router Backend   |
               |  Route Handlers (/api/v1/*)      |
               +----------------------------------+
                                 ^
                                 |  Shared Zod Contracts & HTTP Client
               +-----------------+-----------------+
               |                                   |
    +--------------------+               +--------------------+
    | Next.js 15 Web App |               |  Expo Mobile App   |
    | (Desktop & Web)    |               |  (iOS & Android)   |
    +--------------------+               +--------------------+
```

## 2. Shared Code Strategy & Multi-Device Synchronization

* **Shared Contracts**: The `/src/contracts` directory (Zod schemas) can be published as a local workspace package (`@gate/contracts`) or shared directly with the Expo codebase.
* **Shared API Client**: The `ApiClient` class handles HTTP requests via standard `fetch()`, which works natively in both Node/Web browser and React Native environments.
* **Bearer Token Authentication**: The `/api/v1/*` endpoints accept standard `Authorization: Bearer <Supabase_JWT>` headers alongside httpOnly cookies, ensuring native mobile devices can authenticate securely.
* **Multi-Device Synchronization Rule**: Server database (`Supabase PostgreSQL`) is the authoritative source of truth. Device state (like watch position) synchronizes via server endpoints without claiming unconfirmed multi-device real-time sync features.
