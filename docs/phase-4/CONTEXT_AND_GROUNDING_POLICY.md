# Context & Grounding Policy

> **GATE AIR-1 Command Center** · Anti-Hallucination & Dynamic Context Synthesis Policy

---

## 1. Grounding Principles

1. **Zero External Knowledge Fabrication**: All academic features (`LESSON_SUMMARY`, `STUDY_NOTES`, `CONCEPT_EXPLANATION`, `FLASHCARD_GENERATION`, `MISTAKE_ANALYSIS`) MUST be anchored in verified database context.
2. **Missing Source Guardrail**: If a required `sourceId` cannot be retrieved, [`ContextBuilder`](file:///c:/Users/yaksh/Downloads/personal%20gate/src/server/ai/context.builder.ts) throws `INSUFFICIENT_GROUNDED_CONTENT`, preventing ungrounded generation.

---

## 2. Context Construction Pipeline

```
       [ Client Request: capability + sourceId ]
                          |
                          v
         [ ContextBuilder.buildContext() ]
                          |
     +--------------------+--------------------+
     |                                         |
     v (Capability == LESSON_*)                v (Capability == MISTAKE_ANALYSIS)
 [ Query lectures, topics, subjects ]       [ Query mistakes, quiz_questions ]
     |                                         |
     +--------------------+--------------------+
                          |
                          v
          [ Formatted Grounded Context String ]
```

---

## 3. Grounding Formats

### Lesson Grounding Format
```text
Subject: <Subject Title>
Topic: <Topic Title>
Lecture Title: <Lecture Title>
Lecture Notes: <Lecture Notes Text>
```

### Mistake Grounding Format
```text
Question Text: <Question>
User Selected Answer: <User JSON>
Correct Answer: <Correct JSON>
Official Explanation: <Explanation>
User Reflection: <Reflection>
```
