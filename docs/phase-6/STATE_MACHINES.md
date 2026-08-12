# State Machines Specification

## Flashcard Lifecycle State Machine
```
[ NEW ] ---> (First Review: AGAIN) ---> [ RELEARNING ]
   |                                          |
   +-------> (First Review: GOOD/EASY) ------>+------> [ REVIEW ]
                                                        |      ^
                                                   (AGAIN)    (HARD/GOOD/EASY)
                                                        v      |
                                                  [ RELEARNING ]
```

- **NEW**: Card created, pending initial review.
- **LEARNING**: Card undergoing initial learning steps.
- **REVIEW**: Card active in spaced repetition schedule.
- **RELEARNING**: Card failed review (`AGAIN`), interval reset to 1 day.
- **SUSPENDED**: Card frozen by user, excluded from queues.
