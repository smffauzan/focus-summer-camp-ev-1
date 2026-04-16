# Google Sheets Structure Update - Summary

## Overview
Updated the Google Sheets sync functionality to use a new file structure with **s_id** as the primary unique key instead of student name, and restructured the header row format.

## Changes Made

### 1. Google Sheets Header Structure
**Old Format:**
- Column A: Student Name
- Column B onwards: Dates (date1, date2, ...)

**New Format:**
- Column A: `s_id` (Student ID - unique key)
- Column B: `student_name` (Student Name)
- Column C onwards: Dates (date1, date2, ...)

**Example:**
```
s_id        | student_name         | 2026-04-16 | 2026-04-17 | ...
S001        | Aisha Johnson        | P          | A          | ...
S002        | Brian Kim            | P          | P          | ...
S003        | Carlos Rivera        | A          | P          | ...
```

### 2. Backend Changes

#### File: `server/index.js` (Running Server)
Updated `/api/sync-attendance` endpoint:
- Header initialization changed to: `["s_id", "student_name"]`
- Student row mapping now uses `s_id` as the unique key instead of `student_name`
- When a record is processed:
  - **Existing s_id**: Finds the row by s_id and updates/maintains values in the date column
  - **New s_id**: Creates a new row with s_id in column A and student_name in column B
- Both s_id and student_name are always written to ensure data consistency

#### File: `server/index.ts` (TypeScript Reference)
Updated `/api/sync-attendance` endpoint to match the JavaScript version:
- Switched from old row-based delete approach to matrix/pivot layout
- Header structure: `["s_id", "student_name", date1, date2, ...]`
- Student identification via s_id instead of student name

### 3. Data Flow

**Attendance Sync Request:**
```json
{
  "records": [
    {
      "studentId": "S001",
      "date": "2026-04-16",
      "status": "present",
      "timestamp": "2026-04-16T...",
      "studentName": "Aisha Johnson"
    }
  ],
  "date": "2026-04-16"
}
```

**Processing:**
1. Backend checks if s_id (S001) exists in Google Sheet
2. If exists: Update the row, maintaining s_id and student_name, add 'P' in the date column
3. If new: Create new row with s_id, student_name, and 'P' in the date column

### 4. Key Benefits

✅ **Unique Identification**: s_id is a stable, immutable identifier
✅ **Name Updates**: Student names can be updated without losing attendance records
✅ **Data Consistency**: s_id remains the same even if student name changes
✅ **Easier Lookups**: Direct row lookup by s_id instead of trying to match by name
✅ **Scalability**: Matrix format works efficiently with many dates

### 5. Example Google Sheet After Sync

After syncing attendance for two dates:

| s_id | student_name    | 2026-04-16 | 2026-04-17 |
|------|-----------------|-----------|-----------|
| S001 | Aisha Johnson   | P         | A         |
| S002 | Brian Kim       | P         | P         |
| S003 | Carlos Rivera   | A         | P         |
| S004 | Diana Osei      | P         | P         |

### 6. Files Modified

1. `server/index.js` - Production server with updated sync endpoint
2. `server/index.ts` - TypeScript version for consistency

### 7. Frontend - No Changes Needed

The frontend (`src/hooks/useAttendance.ts`) already enriches records with:
- `studentId` (used as s_id in backend)
- `studentName`
- `status`
- `date`

This matches exactly what the backend now expects.

### 8. Testing the Changes

1. **Add a student** → Go to Students page, add student (auto-generates S001, S002, etc.)
2. **Mark attendance** → Mark students present/absent for a date
3. **Sync to Sheets** → Click "Sync to Google Sheets"
4. **Check Google Sheet** → Should see the new format with s_id in column A

### 9. Backward Compatibility

- The new structure only affects how data is stored in Google Sheets
- Frontend and backend communication remains unchanged
- Student management endpoints (add/edit/delete) are unaffected
- Attendance tracking logic is unaffected

### 10. Data Persistence

- Student data: Stored in `/public/students.json`
- Attendance data: Synced to Google Sheets in the new s_id-based matrix format
- All existing students maintain their s_ids
