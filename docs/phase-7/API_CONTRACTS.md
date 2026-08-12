# API Contracts

## Service Interface Specifications (`@/contracts/exam/exam.contract.ts`)

### `GET /api/exam/questions`
- **Query**: `subjectId?: string`
- **Response**: `QuestionBankQuestion[]`

### `GET /api/exam/tests`
- **Response**: `ExamTest[]`

### `POST /api/exam/attempt/start`
- **Body**: `{ testId: string }`
- **Response**: `ExamAttempt`

### `POST /api/exam/answer/save`
- **Body**: `{ attemptId: string, testQuestionId: string, payload: any }`
- **Response**: `{ status: 'SAVED', savedAt: string }`

### `POST /api/exam/attempt/submit`
- **Body**: `{ attemptId: string }`
- **Response**: `ExamAttempt`
