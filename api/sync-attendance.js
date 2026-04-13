import { google } from "googleapis";

/**
 * Vercel Serverless Function for Google Sheets Attendance Sync
 * Implements matrix/pivot layout: students (rows) × dates (columns)
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { records, date } = req.body;

    // Validate input
    if (!records || !Array.isArray(records) || !date) {
      return res.status(400).json({
        success: false,
        error: "Missing or invalid records/date in request body",
      });
    }

    if (!process.env.GOOGLE_SHEET_ID) {
      return res.status(500).json({
        success: false,
        error: "GOOGLE_SHEET_ID environment variable not set",
      });
    }

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      return res.status(500).json({
        success: false,
        error: "GOOGLE_SERVICE_ACCOUNT_KEY environment variable not set",
      });
    }

    // Parse credentials
    let credentials;
    try {
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    } catch (e) {
      return res.status(500).json({
        success: false,
        error: "Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY JSON",
      });
    }

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // ========================================
    // MATRIX/PIVOT LAYOUT SYNC
    // ========================================

    // Step 1: Read entire sheet
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1",
    });
    let rows = existing.data.values || [];

    // Step 2: Parse or initialize header row
    if (rows.length === 0) {
      rows.push(["Student Name"]); // Initialize with header
    }
    const header = rows[0];

    // Step 3: Add new date column if it doesn't exist
    let dateColIndex = header.indexOf(date);
    if (dateColIndex === -1) {
      header.push(date);
      dateColIndex = header.length - 1;
      console.log(`📅 Added new date column: ${date} at index ${dateColIndex}`);
    } else {
      console.log(`📅 Date column ${date} already exists at index ${dateColIndex}`);
    }

    // Step 4: Build a map of studentName -> row index
    const studentRowMap = {};
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0]) {
        studentRowMap[rows[i][0]] = i;
      }
    }

    // Step 5: Update or add rows for each record
    for (const record of records) {
      const statusChar = record.status === "present" ? "P" : "A";
      if (studentRowMap[record.studentName] !== undefined) {
        const rowIdx = studentRowMap[record.studentName];
        // Pad row if needed
        while (rows[rowIdx].length <= dateColIndex) {
          rows[rowIdx].push("");
        }
        rows[rowIdx][dateColIndex] = statusChar;
        console.log(`  ✓ Updated ${record.studentName}: ${statusChar}`);
      } else {
        // New student row
        const newRow = new Array(dateColIndex + 1).fill("");
        newRow[0] = record.studentName;
        newRow[dateColIndex] = statusChar;
        rows.push(newRow);
        studentRowMap[record.studentName] = rows.length - 1;
        console.log(`  ✓ Added new student: ${record.studentName} with ${statusChar}`);
      }
    }

    // Step 6: Write entire updated matrix back to sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Sheet1!A1",
      valueInputOption: "RAW",
      requestBody: { values: rows },
    });

    console.log(`✓ Synced ${records.length} attendance records for ${date}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("\n=== 🚨 SYNC ERROR ===");
    console.error("Message:", error.message);
    console.error("Error Type:", error.constructor.name);
    if (error.stack) {
      console.error("Stack Trace:", error.stack);
    }
    if (error.errors) {
      console.error("Details:", error.errors);
    }
    console.error("==================\n");
    res.status(500).json({
      success: false,
      error: error.message || "Unknown error",
    });
  }
}
