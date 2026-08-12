# Phase 4 API Contracts

> **GATE AIR-1 Command Center** · Endpoints & Schema Contracts

---

## 1. Execute AI Generation Request

### Endpoint
`POST /api/v1/ai/requests`

### Request Body Schema
```json
{
  "capability": "LESSON_SUMMARY | STUDY_NOTES | CONCEPT_EXPLANATION | FLASHCARD_GENERATION | MISTAKE_ANALYSIS | AI_COACH",
  "sourceId": "UUID (optional, required for LESSON and MISTAKE capabilities)",
  "userInput": "string (optional)",
  "userId": "string (optional, defaults to 'default_user')"
}
```

### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "requestId": "c1f7a2d8-4e89-4a92-8086-1d1136b8017c",
    "artifactId": "e8392104-58a1-432d-94aa-77d90bc39112",
    "output": "[NVIDIA ZZLM 5.2 Grounded Output...]",
    "usage": {
      "totalTokens": 200,
      "costInr": 0.01
    }
  },
  "error": null
}
```

### Budget Exhausted Error Response (`500 Internal Server Error`)
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "AI_MONTHLY_BUDGET_EXHAUSTED: ₹1,000 monthly AI budget ceiling reached."
  }
}
```

---

## 2. Check AI Budget Status

### Endpoint
`GET /api/v1/ai/budget`

### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "monthlyLimitInr": 1000,
    "currentSpendInr": 12.50,
    "spendPercentage": 1,
    "warningLevel": "NONE",
    "isExhausted": false
  },
  "error": null
}
```
