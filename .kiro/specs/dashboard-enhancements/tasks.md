# Implementation Plan

- [x] 1. Create theme management system with dark mode support
  - Implement ThemeProvider component with React context for theme state management
  - Create useTheme hook for accessing and updating theme state across components
  - Add CSS variables and dark mode styles with proper Hebrew text contrast
  - Build DarkModeToggle component with smooth theme transitions
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 2. Implement user preference management system
  - Create PreferenceManager class for local storage operations with error handling
  - Build usePreferences hook for accessing and updating user preferences
  - Add preference validation and default value fallbacks for corrupted data
  - Implement preference persistence for theme and tab selections
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 3. Build centralized refresh management system
  - Create RefreshManager class to coordinate tab-specific refresh operations
  - Implement useRefreshManager hook for managing refresh state and operations
  - Add tab detection logic to refresh only current tab's data hooks
  - Build single refresh button component with loading states and error handling
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 4. Implement auto-refresh functionality with intelligent controls
  - Create useAutoRefresh hook with 30-second interval timer management
  - Add browser visibility detection to pause refresh when tab is not active
  - Implement network status monitoring to adjust refresh behavior
  - Add auto-refresh pause/resume logic for error conditions and user inactivity
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 5. Remove all mock data dependencies and references
  - Delete lib/mock-data.ts file and all mock data exports
  - Update all API route handlers to remove mock data imports and fallbacks
  - Modify sheetsClient to return error states instead of mock data
  - Update data hooks to handle no-data states without mock fallbacks
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 6. Create enhanced error handling for no-data states
  - Build NoDataAvailable component for displaying when Google Sheets is unavailable
  - Create ConnectionError component with retry functionality and Hebrew messages
  - Implement LoadingState component with proper Hebrew text and animations
  - Add error boundary components to handle data loading failures gracefully
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 7. Update DashboardLayout with integrated refresh and theme systems
  - Integrate ThemeProvider at the root level of DashboardLayout component
  - Add centralized refresh button to header with tab-aware refresh logic
  - Implement theme toggle button in header with preference persistence
  - Update layout styling to support both light and dark themes
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 6.1, 7.1_

- [x] 8. Enhance main dashboard page with tab preference management
  - Update HomePage component to use preference manager for active tab state
  - Implement tab switching logic that saves selection to local storage
  - Add tab-specific refresh integration with centralized refresh manager
  - Update tab rendering to work properly with both light and dark themes
  - _Requirements: 1.2, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 9. Update all dashboard components for theme compatibility
  - Modify AccountStatus component to use theme-aware styling and remove mock data
  - Update TenantPayments component with dark mode support and no-data states
  - Enhance ApartmentFees component with theme variables and error handling
  - Update all card components and UI elements to support both themes
  - _Requirements: 3.2, 3.3, 3.4, 4.1, 4.2, 4.3_

- [x] 10. Clean up unused code and optimize imports
  - Remove all unused React imports and component imports across the codebase
  - Delete unused utility functions and helper files
  - Remove unused CSS classes and style definitions
  - Clean up package.json to remove unused dependencies
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 11. Update data hooks to work with new refresh and error systems
  - Modify useSheetData hook to integrate with centralized refresh manager
  - Remove auto-refresh logic from individual hooks in favor of centralized system
  - Update error handling to use new no-data states instead of mock data
  - Add proper loading state coordination across multiple hooks
  - _Requirements: 1.2, 1.4, 2.1, 2.2, 4.4, 4.5_

- [x] 12. Add comprehensive error boundaries and loading coordination
  - Create DashboardErrorBoundary component for handling component failures
  - Implement LoadingCoordinator to manage loading states across multiple components
  - Add error recovery mechanisms with Hebrew error messages
  - Build retry functionality for failed data operations
  - _Requirements: 4.3, 4.4, 8.1, 8.2, 8.3_

- [x] 13. Implement performance optimizations for refresh and theme systems
  - Add debouncing to prevent rapid refresh requests
  - Implement request cancellation for in-flight requests during new refreshes
  - Optimize theme switching to prevent layout shifts
  - Add memoization to prevent unnecessary re-renders during theme changes
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 14. Create unit tests for new systems and components
  - Write tests for RefreshManager class and refresh coordination logic
  - Test ThemeProvider and theme switching functionality
  - Add tests for PreferenceManager local storage operations
  - Test auto-refresh timer behavior and visibility detection
  - _Requirements: 1.1, 2.1, 3.1, 6.1, 7.1_

- [x] 15. Integration testing and final cleanup
  - Test complete dashboard workflow with all new systems integrated
  - Verify theme persistence across browser sessions
  - Test auto-refresh behavior over extended periods
  - Perform final code cleanup and remove any remaining dead code
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_