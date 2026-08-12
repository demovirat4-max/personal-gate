# Implementation Summary: Phase 7 Exam & PYQ Engine

## Executive Overview
Phase 7 introduces the full-featured **Exam & Past Year Questions (PYQ) Engine** into the GATE CS/IT 2028 Command Center. It equips candidates with an authentic exam simulation framework compliant with actual GATE test parameters (MCQ, MSQ, NAT), server-authoritative timers, snapshot immutability, and deterministic scoring.

## Core Architectural Pillars
1. **Question Bank & Provenance**: Rich question repository storing verified PYQs (1990-2028), author-created questions, and AI drafts with verification status and detailed provenance metadata.
2. **Immutable Question & Test Snapshots**: Exam tests snapshot their constituent questions upon publish/attempt start, isolating existing exam attempts from background updates to the question bank.
3. **Deterministic Pure Scoring Engine**: Evaluates answers with zero AI hallucination risk using GATE standard marking rules (1-mark/2-mark, -0.33/-0.66 MCQ negative marking, zero negative marking for MSQ and NAT, precise numerical range tolerance for NAT).
4. **Server-Authoritative Timing & State Machine**: State-driven attempt tracking (`NOT_STARTED` -> `IN_PROGRESS` -> `SUBMITTING` -> `SUBMITTED` / `EXPIRED`) with deadline verification calculated on the server to prevent local client clock manipulation.
