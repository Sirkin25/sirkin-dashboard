# Requirements Document

## Introduction

The Hebrew building management dashboard currently has several data display issues that affect user experience and data accuracy. These issues include inconsistent data formatting, misaligned API responses with component expectations, poor error handling, and inconsistent loading states. This feature aims to systematically fix all data display problems to ensure reliable, consistent, and user-friendly data presentation across all dashboard components.

## Requirements

### Requirement 1

**User Story:** As a building manager, I want consistent and accurate data formatting across all dashboard components, so that I can trust the information displayed and make informed decisions.

#### Acceptance Criteria

1. WHEN viewing any monetary amount THEN the system SHALL display it using consistent Hebrew currency formatting (₪ symbol, Hebrew locale)
2. WHEN viewing any date THEN the system SHALL display it using consistent Hebrew date formatting (Hebrew month names, RTL layout)
3. WHEN viewing apartment numbers THEN the system SHALL display them with consistent Hebrew prefixes ("דירה X")
4. WHEN viewing payment status indicators THEN the system SHALL use consistent icons and colors (✓ green for paid, ✗ red for unpaid, ⏳ yellow for pending)
5. WHEN viewing percentage values THEN the system SHALL display them with Hebrew locale formatting and consistent decimal places

### Requirement 2

**User Story:** As a building manager, I want the tenant payments table to correctly display payment data from Google Sheets, so that I can accurately track which tenants have paid their fees.

#### Acceptance Criteria

1. WHEN the tenant payments API receives data from Google Sheets THEN the system SHALL correctly parse the month-by-month payment matrix
2. WHEN displaying tenant payments THEN the system SHALL show the correct payment status for each apartment and month combination
3. WHEN switching between year/half-year filters THEN the system SHALL display the correct months and payment data for the selected period
4. WHEN calculating payment statistics THEN the system SHALL accurately count paid vs unpaid apartments for the displayed period
5. WHEN Google Sheets data is unavailable THEN the system SHALL fall back to mock data with clear indication of the data source

### Requirement 3

**User Story:** As a building manager, I want clear and informative error states when data cannot be loaded, so that I understand what went wrong and how to resolve it.

#### Acceptance Criteria

1. WHEN a data fetch fails THEN the system SHALL display a user-friendly error message in Hebrew
2. WHEN Google Sheets connection fails THEN the system SHALL show specific connection error details
3. WHEN using mock data THEN the system SHALL clearly indicate the data source with appropriate visual indicators
4. WHEN an API returns malformed data THEN the system SHALL handle it gracefully without crashing the component
5. WHEN network errors occur THEN the system SHALL provide retry options and clear error descriptions

### Requirement 4

**User Story:** As a building manager, I want consistent loading states across all dashboard components, so that I have clear feedback when data is being fetched.

#### Acceptance Criteria

1. WHEN any component is loading data THEN the system SHALL display a consistent loading spinner with Hebrew text
2. WHEN data is being refreshed THEN the system SHALL show loading state without hiding existing data
3. WHEN multiple components are loading THEN the system SHALL coordinate loading states to avoid UI jumping
4. WHEN loading takes longer than expected THEN the system SHALL provide progress feedback or timeout handling
5. WHEN data loads successfully THEN the system SHALL smoothly transition from loading to data display

### Requirement 5

**User Story:** As a building manager, I want the account status component to accurately reflect the building's financial health, so that I can monitor cash flow and make budget decisions.

#### Acceptance Criteria

1. WHEN displaying account balance THEN the system SHALL show the correct amount with proper Hebrew currency formatting
2. WHEN showing monthly change percentage THEN the system SHALL calculate and display it accurately with appropriate color coding
3. WHEN determining account status (healthy/warning/critical) THEN the system SHALL use consistent thresholds and visual indicators
4. WHEN account data is updated THEN the system SHALL reflect changes immediately with proper timestamp display
5. WHEN Google Sheets data is unavailable THEN the system SHALL use mock data with clear source indication

### Requirement 6

**User Story:** As a building manager, I want all dashboard components to handle Hebrew text and RTL layout correctly, so that the interface is natural and readable for Hebrew users.

#### Acceptance Criteria

1. WHEN displaying any Hebrew text THEN the system SHALL use proper RTL text direction
2. WHEN showing tables with Hebrew headers THEN the system SHALL align content correctly for RTL reading
3. WHEN displaying mixed Hebrew and numeric content THEN the system SHALL maintain proper text flow and alignment
4. WHEN using Hebrew month names THEN the system SHALL display them consistently across all components
5. WHEN showing status messages THEN the system SHALL use proper Hebrew grammar and terminology

### Requirement 7

**User Story:** As a building manager, I want the data refresh functionality to work reliably across all components, so that I can get the latest information when needed.

#### Acceptance Criteria

1. WHEN clicking refresh on any component THEN the system SHALL fetch fresh data from the appropriate API endpoint
2. WHEN auto-refresh is enabled THEN the system SHALL update data at the specified intervals without user intervention
3. WHEN refresh fails THEN the system SHALL show error state while preserving existing data
4. WHEN multiple components refresh simultaneously THEN the system SHALL handle concurrent requests efficiently
5. WHEN data is successfully refreshed THEN the system SHALL update timestamps and connection status indicators

### Requirement 8

**User Story:** As a developer maintaining the dashboard, I want clean and consistent code organization for data handling, so that the codebase is maintainable and bugs are easier to prevent.

#### Acceptance Criteria

1. WHEN handling data transformations THEN the system SHALL use consistent utility functions across all components
2. WHEN defining data types THEN the system SHALL use proper TypeScript interfaces that match API responses
3. WHEN parsing data from different sources THEN the system SHALL use centralized parsing logic to avoid duplication
4. WHEN handling errors THEN the system SHALL use consistent error handling patterns across all API endpoints
5. WHEN formatting display values THEN the system SHALL consolidate formatting functions to eliminate inconsistencies