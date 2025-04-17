# Log4Net Analyzer Requirements

## Overview
The Log4Net Analyzer is a web application that helps users analyze and visualize log files from Log4Net. It provides an interactive interface to upload log files, view errors and warnings on a timeline, and analyze their occurrences and details.

## Core Features

### File Management
1. Upload multiple log files simultaneously
2. Support for .txt and .log file extensions
3. Display list of uploaded files with sizes
4. Ability to remove individual files from the upload list
5. Process files client-side without server requirements

### Log Parsing
1. Parse log entries in the format: `YYYY-MM-DD HH:mm:ss.fff +/-TZ:00 [LEVEL] Message`
2. Support for error logs marked with [ERR]
3. Support for warning logs marked with [WRN]
4. Capture multi-line error messages and stack traces
5. Parse stack traces with the following patterns:
   - Lines starting with "at "
   - Indented stack trace lines
   - Lines containing "--- End of"
   - Lines containing " ---> "
   - Lines matching stack trace boundaries

### Timeline Visualization
1. Display errors/warnings on an interactive timeline
2. Show 15-minute interval aggregations
3. Automatically adjust timeline range to include all log entries
4. Add 30-minute padding before first and after last entry
5. Support collapsible timeline view
6. Display counts for each time interval
7. Color-code based on entry type (red for errors, orange for warnings)
8. Interactive tooltips showing:
   - Timestamp with milliseconds
   - Count of entries in the interval
   - List of entries with timestamps and first line of message
9. Support for scatter plot of individual occurrences when an entry is selected

### Error/Warning List
1. Toggle between errors and warnings view (default to errors)
2. Display top 15 most frequent errors/warnings
3. Show for each entry:
   - First line of the message
   - Occurrence count
   - Timestamp of first occurrence
   - Color-coded count badge (red for errors, orange for warnings)
4. Support clicking an entry to highlight it on the timeline
5. Support deselecting the current error/warning group to show all entries
6. Info button to view detailed information about each entry

### Detail Modal
1. Show detailed information for selected error/warning
2. Display:
   - Full timestamp with milliseconds
   - Source log file
   - Complete message
   - Full stack trace in monospace font
3. Support navigation between multiple occurrences of the same error/warning
4. Show current position (e.g., "2 of 5") when navigating
5. Color-code based on entry type (error/warning)

## Technical Requirements

### User Interface
1. Responsive design supporting different screen sizes
2. Material-UI based components
3. Consistent color scheme and typography
4. Clear visual hierarchy
5. Interactive elements with hover states
6. Loading states for async operations

### Performance
1. Handle large log files efficiently
2. Client-side processing of log files
3. Efficient data structures for grouping and counting
4. Optimized rendering of timeline and lists
5. Smooth animations and transitions

### Data Management
1. Maintain state for:
   - Uploaded files
   - Selected error/warning type
   - Selected individual entry
   - Timeline collapse state
2. Clear state when new files are uploaded
3. Reset selection when switching between errors and warnings

### Error Handling
1. Graceful handling of invalid log files
2. Clear error messages for parsing failures
3. Fallback UI for empty states
4. Validation of file types and contents

## Browser Support
1. Support modern browsers (Chrome, Firefox, Safari, Edge)
2. Responsive layout for desktop and tablet devices
3. Support for different time zones and locales

## Accessibility
1. Keyboard navigation support
2. ARIA labels for interactive elements
3. Sufficient color contrast
4. Screen reader friendly content structure 