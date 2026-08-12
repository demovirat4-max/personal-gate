# Curriculum and Lecture Import Specification

## 1. Supported Import Channels

1. **Published Google Sheets CSV URL**: Fetches live CSV bytes via server-side HTTP request (`https://docs.google.com/spreadsheets/d/.../pub?output=csv`).
2. **Direct CSV Upload**: Standard `.csv` file upload parsed using `PapaParse`.
3. **Direct XLSX Upload**: Standard `.xlsx` workbook upload parsed using `xlsx` (SheetJS).

> [!NOTE]
> **Authentication Scope**: Public published Google Sheets CSV URLs and manual file uploads are supported natively in Phase 2. Private Google Sheets requiring OAuth authentication remain an optional future adapter and will not be built unless explicitly requested and approved.

## 2. Row Specification & Input Validation Schema

Every row in the spreadsheet must conform to the following mandatory and optional headers:

| Header Name | Type | Constraints / Normalization Rules |
| :--- | :--- | :--- |
| `Subject` | Required | Trimmer, Capitalized (e.g. "Data Structures"). Mapped to `subjects` table. |
| `Topic` | Required | Trimmer. Mapped to `topics` table. |
| `Subtopic` | Optional | Sub-grouping within topic. |
| `Lecture Title` | Required | Title of the video lecture. |
| `YouTube URL` | Required | Must contain valid YouTube Video ID or Playlist ID. Validated via Regex. |
| `Teacher` | Optional | Educator/Instructor name (e.g. "Gate Smashers", "RBR", "NESO Academy"). |
| `Course or Playlist`| Optional | Name of the source playlist/series. |
| `Lecture Order` | Required | Positive Integer (1, 2, 3...). Preserved strictly for sequential watching. |
| `Priority` | Optional | `HIGH`, `NORMAL`, `LOW` (Defaults to `NORMAL`). |
| `Notes` | Optional | Initial lecture summary or markdown links. |

## 3. YouTube Regex & Metadata Extraction Pipeline

```typescript
// Regex for YouTube Video ID Extraction
const YT_VIDEO_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;

// Regex for YouTube Playlist ID Extraction
const YT_PLAYLIST_REGEX = /[?&]list=([^#\&\?]+)/;
```

1. **URL Validation**: If URL parsing fails regex match, flag row with `MALFORMED_YOUTUBE_URL`.
2. **YouTube Data API Metadata Fetch (Server-Side)**:
   * Query YouTube Data API v3 (`videos?part=snippet,contentDetails,status&id=<VIDEO_ID>`).
   * Extract video duration (ISO 8601 duration `PT1H23M45S` -> parsed into total seconds `5025`).
   * Verify `embeddable == true`. If `embeddable == false` or `privacyStatus == 'private'`, flag row with `NON_EMBEDDABLE_VIDEO`.
3. **Dry-Run Mode**: Returns validation report without committing database changes.
4. **Idempotent Safe Re-Import**: Matches existing records on `(youtube_video_id, topic_id)`. If present, updates metadata without losing watched intervals or student notes.
