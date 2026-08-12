# Test Strategy Specification

## 1. Multi-Tier Testing Pyramid

The project mandates three complementary testing levels to eliminate bugs and contract drift before deployment:

```text
       /\
      /  \     Playwright End-to-End Tests (Vertical Slices)
     /----\    ---------------------------------------------
    /      \    React Testing Library (Component UI Tests)
   /--------\   ---------------------------------------------
  /          \  Vitest Unit & Zod API Contract Integration Tests
 /------------\ ---------------------------------------------
```

## 2. Test Layer Specifications & Fixture Removal Rules

### Layer 1: Unit & Contract Tests (Vitest)
* **Scope**: Domain math formulas (Mastery calculations, SM-2 spaced repetition interval updates, Priority scores), Importer regex parsers, and Zod API schema validation.
* **Contract Tests**: Verify that API client methods accept only valid Zod payloads and that Route Handlers return envelopes matching declared schemas.

### Layer 2: Component & UI Integration Tests (React Testing Library)
* **Scope**: Render testing for complex UI components such as NAT Virtual Keypad, Embedded Video Player controls, PYQ Option Selectors, and Importer File Dropzones.
* **Mock Strategy**: Use MSW (Mock Service Worker) to intercept API requests at the network layer for UI components.

### Layer 3: Vertical Slice End-to-End Tests (Playwright)
* **Scope**: Real browser automation running against a real local server and isolated Supabase PostgreSQL database.
* **Mandatory Integration & Fixture Removal Rule**: No phase may be declared complete if the UI is still wired to hardcoded fixture data for a feature scheduled for backend integration in that phase. Playwright integration tests must execute full vertical slices (User Action -> Typed API Client -> Route Handler -> Service -> Supabase PostgreSQL DB -> UI DOM state update).
