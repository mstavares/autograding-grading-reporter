# Integration Tests for Spreadsheet API

This directory contains integration tests for the Google Spreadsheet functionality, specifically testing the cell-level updates in v5.2.0.

## Setup

### 1. Environment Variables

Configure these environment variables in your GitHub Actions or locally:

```bash
# Required
SHEETS_CREDENTIALS=<base64-encoded-service-account-json>
SPREADSHEET_ID=<your-spreadsheet-id>
WORKSHEET_NAME=<worksheet-name>

# Optional (with defaults)
AUTHORS_AMOUNT=2
GITHUB_REPOSITORY=test-user/test-repo
```

### 2. AUTHORS.txt File

Create an `AUTHORS.txt` file in the project root with student numbers (one per line):

```
12345
67890
```

Example file is provided as `AUTHORS.txt.example`.

### 3. Spreadsheet Structure

Your Google Sheet should have these columns:
- `numero` - Student number
- `nome` - Student name
- `repositorio` - Repository URL
- Test columns (e.g., `test1`, `test2`, etc.)

## Running Tests

### Run all tests
```bash
npm test
```

### Run only integration tests
```bash
npm test -- spreadsheet-integration.test.js
```

### Run with verbose output
```bash
npm test -- --verbose spreadsheet-integration.test.js
```

## Test Coverage

### Spreadsheet Module Tests
- ✅ Connect to spreadsheet and get worksheet
- ✅ Load header row and verify columns
- ✅ Read rows from worksheet

### GetRow Function Tests
- ✅ Find row by student number (numero)

### Cell-Level Update Tests
- ✅ Update only repositorio cell without affecting other cells
- ✅ Update multiple test score cells in batch

### Auth Module Tests
- ✅ Authenticate authors and get their info

### PostResults Integration Tests
- ✅ Post test results using cell-level updates

## What These Tests Verify

### Cell-Level Updates
The tests verify that the new v5.2.0 implementation correctly:
1. **Only updates specified cells** - When updating the `repositorio` column, other columns (nome, numero) remain unchanged
2. **Batch updates work** - Multiple test score cells can be updated in a single API call
3. **No data loss** - Original data is preserved when updating specific cells

### Expected Behavior
- **Before (v3.x):** Calling `row.save()` would overwrite the entire row
- **After (v5.2.0):** Using `sheet.loadCells()` + `sheet.saveUpdatedCells()` only updates modified cells

## Timeout Configuration

Integration tests have a 30-60 second timeout due to:
- Network requests to Google Sheets API
- Authentication overhead
- Cell loading operations

## CI/CD Integration

These tests can run in GitHub Actions by setting the environment variables as repository secrets:

```yaml
- name: Run Integration Tests
  env:
    SHEETS_CREDENTIALS: ${{ secrets.SHEETS_CREDENTIALS }}
    SPREADSHEET_ID: ${{ secrets.SPREADSHEET_ID }}
    WORKSHEET_NAME: ${{ secrets.WORKSHEET_NAME }}
  run: npm test -- spreadsheet-integration.test.js
```

## Troubleshooting

### "SHEETS_CREDENTIALS environment variable is required"
Make sure to set the environment variable with base64-encoded service account JSON.

### "No rows in sheet, skipping test"
The test spreadsheet needs at least one row of data with numero, nome, and repositorio columns.

### "AUTHORS.txt not found"
Create an AUTHORS.txt file in the project root with valid student numbers from your spreadsheet.

### Authentication errors
Verify that:
1. Service account has access to the spreadsheet
2. SHEETS_CREDENTIALS is correctly base64-encoded
3. The credentials include client_email and private_key

## Test Data Cleanup

Some tests create temporary data (e.g., repository URLs with timestamps). You may want to:
- Use a dedicated test spreadsheet
- Manually clean up test data after test runs
- Implement test teardown to restore original values
