# Requirements Document

## Introduction

The Hebrew building management dashboard needs several enhancements to improve user experience and maintainability. These enhancements include implementing a centralized refresh system with auto-refresh capabilities, adding dark mode support, removing mock data dependencies, cleaning up unused code, and adding user preference persistence. These improvements will create a more professional, efficient, and user-friendly dashboard experience.

## Requirements

### Requirement 1

**User Story:** As a building manager, I want a single refresh button at the top of the dashboard that refreshes only the data relevant to my current tab, so that I can efficiently update information without unnecessary API calls.

#### Acceptance Criteria

1. WHEN viewing any dashboard tab THEN the system SHALL display a single refresh button at the top level
2. WHEN clicking the refresh button THEN the system SHALL refresh only the data for the currently active tab
3. WHEN refresh is in progress THEN the system SHALL show loading state on the refresh button
4. WHEN refresh completes THEN the system SHALL update the last refresh timestamp
5. WHEN refresh fails THEN the system SHALL show error state without affecting existing data

### Requirement 2

**User Story:** As a building manager, I want automatic background refresh every 30 seconds, so that I always see the most current data without manual intervention.

#### Acceptance Criteria

1. WHEN the dashboard is active THEN the system SHALL automatically refresh data every 30 seconds
2. WHEN auto-refresh occurs THEN the system SHALL refresh only the currently visible tab's data
3. WHEN the browser tab is not visible THEN the system SHALL pause auto-refresh to conserve resources
4. WHEN auto-refresh fails THEN the system SHALL continue attempting at the next interval
5. WHEN user manually refreshes THEN the system SHALL reset the 30-second auto-refresh timer

### Requirement 3

**User Story:** As a building manager, I want to toggle between light and dark modes, so that I can use the dashboard comfortably in different lighting conditions.

#### Acceptance Criteria

1. WHEN clicking the dark mode toggle THEN the system SHALL switch between light and dark themes
2. WHEN in dark mode THEN the system SHALL apply dark theme to all dashboard components consistently
3. WHEN switching themes THEN the system SHALL maintain proper contrast and readability for Hebrew text
4. WHEN in dark mode THEN the system SHALL ensure all charts, tables, and UI elements are properly themed
5. WHEN theme changes THEN the system SHALL persist the preference for future sessions

### Requirement 4

**User Story:** As a building manager, I want to see only real data from Google Sheets, so that I can trust the information displayed and make accurate decisions.

#### Acceptance Criteria

1. WHEN Google Sheets data is available THEN the system SHALL display only real data
2. WHEN Google Sheets connection fails THEN the system SHALL show clear error messages instead of mock data
3. WHEN API endpoints cannot connect to sheets THEN the system SHALL display "No data available" states
4. WHEN data is loading THEN the system SHALL show loading states without falling back to mock data
5. WHEN removing mock data THEN the system SHALL ensure no mock data references remain in the codebase

### Requirement 5

**User Story:** As a developer maintaining the dashboard, I want clean, organized code with no unused components or functions, so that the codebase is maintainable and efficient.

#### Acceptance Criteria

1. WHEN reviewing the codebase THEN the system SHALL have no unused imports, components, or functions
2. WHEN building the application THEN the system SHALL not include any dead code in the bundle
3. WHEN examining file structure THEN the system SHALL have clear organization with no orphaned files
4. WHEN checking dependencies THEN the system SHALL have no unused packages in package.json
5. WHEN running linting THEN the system SHALL pass all code quality checks without warnings

### Requirement 6

**User Story:** As a building manager, I want the dashboard to remember my last selected tab, so that I can continue where I left off when returning to the application.

#### Acceptance Criteria

1. WHEN selecting a dashboard tab THEN the system SHALL save the selection to local storage
2. WHEN returning to the dashboard THEN the system SHALL automatically open the last selected tab
3. WHEN no previous tab is saved THEN the system SHALL default to the first tab
4. WHEN tab preference is corrupted THEN the system SHALL gracefully fall back to default tab
5. WHEN clearing browser data THEN the system SHALL handle missing preferences gracefully

### Requirement 7

**User Story:** As a building manager, I want my theme preference (light/dark mode) to be remembered, so that I don't need to reset it every time I use the dashboard.

#### Acceptance Criteria

1. WHEN changing theme preference THEN the system SHALL save it to local storage immediately
2. WHEN loading the dashboard THEN the system SHALL apply the saved theme preference
3. WHEN no theme preference exists THEN the system SHALL default to light mode
4. WHEN theme preference is corrupted THEN the system SHALL fall back to system preference or light mode
5. WHEN clearing browser data THEN the system SHALL handle missing theme preference gracefully

### Requirement 8

**User Story:** As a building manager, I want the refresh system to be intelligent about network usage, so that the dashboard performs well even with slower connections.

#### Acceptance Criteria

1. WHEN network is slow THEN the system SHALL adjust refresh intervals appropriately
2. WHEN multiple tabs are open THEN the system SHALL coordinate refresh requests to avoid conflicts
3. WHEN refresh requests are pending THEN the system SHALL not initiate additional requests
4. WHEN connection is restored after failure THEN the system SHALL resume normal refresh behavior
5. WHEN user is inactive THEN the system SHALL reduce refresh frequency to conserve resources