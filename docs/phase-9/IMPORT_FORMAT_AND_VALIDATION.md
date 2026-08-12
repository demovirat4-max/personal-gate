# Phase 9: Import Format & Validation Schemas

## Standard JSON Import Payload Schema

All bulk question imports into the system must conform strictly to the following TypeScript/Zod JSON schema contract:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "GateQuestionImportBatch",
  "type": "object",
  "properties": {
    "batch_id": { "type": "string" },
    "source": { "type": "string" },
    "questions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["question_code", "subject_code", "topic_code", "question_type", "marks", "statement_markdown"],
        "properties": {
          "question_code": { "type": "string" },
          "subject_code": { "type": "string" },
          "topic_code": { "type": "string" },
          "question_type": { "type": "string", "enum": ["MCQ", "MSQ", "NAT"] },
          "marks": { "type": "number", "enum": [1.0, 2.0] },
          "statement_markdown": { "type": "string" },
          "options": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "option_key": { "type": "string" },
                "option_text": { "type": "string" },
                "is_correct": { "type": "boolean" }
              }
            }
          },
          "nat_answer": {
            "type": "object",
            "properties": {
              "min_value": { "type": "number" },
              "max_value": { "type": "number" }
            }
          }
        }
      }
    }
  }
}
```
