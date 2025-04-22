# Log4Net Analyzer Requirements

## Overview

The Log4Net Analyzer is a web application that helps users analyze and visualize log files from Log4Net. It provides an interactive interface to upload log files, view errors and warnings on a timeline, and analyze their occurrences and details.

## Core Features

### File Management

1. [FM-001] Upload multiple log files simultaneously
2. [FM-002] Support for .txt and .log file extensions
3. [FM-003] Display list of uploaded files with sizes
4. [FM-004] Ability to remove individual files from the upload list
5. [FM-005] Process files client-side without server requirements
6. [FM-006] Show error and warning statistics per file:
    - Display total number of errors found in each file
    - Display total number of warnings found in each file
    - Show statistics immediately after file selection
    - Update statistics when files are removed

### Log Parsing

1. [LP-001] Parse log entries in the format: `YYYY-MM-DD HH:mm:ss.fff +/-TZ:00 [LEVEL] Message`
2. [LP-002] Support for error logs marked with [ERR]
3. [LP-003] Support for warning logs marked with [WRN]
4. [LP-004] Capture multi-line error messages and stack traces
5. [LP-005] Parse stack traces with the following patterns:
   - Lines starting with "at "
   - Indented stack trace lines
   - Lines containing "--- End of"
   - Lines containing " ---> "
   - Lines matching stack trace boundaries

### Timeline Visualization

1. [TV-001] Display errors/warnings on an interactive timeline
2. [TV-002] Show 15-minute interval aggregations
3. [TV-003] Automatically adjust timeline range to include all log entries
4. [TV-004] Add 30-minute padding before first and after last entry
5. [TV-005] Support collapsible timeline view
6. [TV-006] Display counts for each time interval
7. [TV-007] Color-code based on entry type (red for errors, orange for warnings)
8. [TV-008] Interactive tooltips showing:
   - Timestamp with milliseconds
   - Count of entries in the interval
   - List of entries with timestamps and first line of message
9. [TV-009] Support for scatter plot of individual occurrences when an entry is selected
10. [TV-010] Simplified tooltip showing only:
    - Count for the timeslot
    - Type of entry (error or warning)
    - Timestamp of the timeslot

### Error/Warning List

1. [EW-001] Toggle between errors and warnings view (default to errors)
2. [EW-002] Display top 100 most frequent errors/warnings
3. [EW-003] Show for each entry:
   - First line of the message
   - Occurrence count
   - Timestamp of first occurrence
   - Color-coded count badge (red for errors, orange for warnings)
4. [EW-004] Support clicking an entry to highlight it on the timeline
5. [EW-005] Support deselecting the current error/warning group to show all entries
6. [EW-006] Info button to view detailed information about each entry

### Detail Modal

1. [DM-001] Show detailed information for selected error/warning
2. [DM-002] Display:
   - Full timestamp with milliseconds
   - Source log file
   - Complete message
   - Full stack trace in monospace font
3. [DM-003] Support navigation between multiple occurrences of the same error/warning
4. [DM-004] Show current position (e.g., "2 of 5") when navigating
5. [DM-005] Color-code based on entry type (error/warning)

## Technical Requirements

### Dependencies

1. [TD-001] Use Recharts library for Timeline visualization 

### User Interface

1. [UI-001] Responsive design supporting different screen sizes
2. [UI-002] Material-UI based components
3. [UI-003] Consistent color scheme and typography
4. [UI-004] Clear visual hierarchy
5. [UI-005] Interactive elements with hover states
6. [UI-006] Loading states for async operations
7. [UI-007] Collapsible components:
    - FileUpload component should be collapsible
    - Timeline component should be initially collapsed
    - FileUpload component should collapse when "Upload and process" is clicked
    - Timeline component should expand when "Upload and process" is clicked
8. [UI-008] Consistent spacing:
    - Even spacing between ErrorList, FileUpload, and Timeline components
    - Maintain consistent margins and padding throughout the interface

### Performance

1. [PF-001] Handle large log files efficiently
2. [PF-002] Client-side processing of log files
3. [PF-003] Efficient data structures for grouping and counting
4. [PF-004] Optimized rendering of timeline and lists
5. [PF-005] Smooth animations and transitions

### Data Management

1. [DM-001] Maintain state for:
   - Uploaded files
   - Selected error/warning type
   - Selected individual entry
   - Timeline collapse state
2. [DM-002] Clear state when new files are uploaded
3. [DM-003] Reset selection when switching between errors and warnings

### Error Handling

1. [EH-001] Graceful handling of invalid log files
2. [EH-002] Clear error messages for parsing failures
3. [EH-003] Fallback UI for empty states
4. [EH-004] Validation of file types and contents

## Browser Support

1. [BS-001] Support modern browsers (Chrome, Firefox, Safari, Edge)
2. [BS-002] Responsive layout for desktop and tablet devices
3. [BS-003] Support for different time zones and locales

## Accessibility

1. [AC-001] Keyboard navigation support
2. [AC-002] ARIA labels for interactive elements
3. [AC-003] Sufficient color contrast
4. [AC-004] Screen reader friendly content structure
