# Test Composition Engine

## Overview
The Test Composition Engine dynamically or statically builds tests according to specified rules and weightages.

## Generator Types
1. **PYQ Year Mock Generator**: Assembles official 65-question papers for specific years (e.g. GATE CS 2024 Session 1).
2. **Subject Test Composition**: Filters active, verified questions for a target `subject_id` across 15-question (25 marks) or 30-question formats.
3. **Topic Practice Quiz**: Assembles targeted 5-10 question drills focused on specific micro-topics.
4. **Adaptive Custom Builder**: Selects weak-topic questions based on Phase 5 mistake telemetry.
