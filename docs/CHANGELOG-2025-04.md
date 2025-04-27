# Changelog - April 2025

## [2025-04-22] - Auth System Improvements

### Fixed
- Fixed login page rendering issues by properly implementing auth layout
- Corrected AuthLayout component usage in routing configuration
- Fixed auth store integration in Login component (signIn vs login method)
- Resolved theme integration issues in auth components

### Changed
- Refactored Login component to use AuthLayout instead of duplicating structure
- Updated auth routes to have proper titles and subtitles for each page
- Improved broker callback component import path
- Updated auth store implementation to use consistent method names
- Enhanced error handling in auth components

### Added
- New theme-aware components following project styling rules
- Improved form validation in auth components
- Better loading state handling in auth flows

### Technical Details
- Auth layout provides consistent structure across all auth-related pages
- Improved error handling and validation in login form
- Theme integration follows project rules using CSS variables and Tailwind
- Auth store methods standardized for consistency
- All components follow project styling conventions

## [2025-04-22] - SnapTrade Integration Updates

### Fixed
- Fixed broker portal functionality by implementing proper SDK integration
- Resolved authentication issues in SnapTrade client
- Fixed error handling in SnapTrade API calls

### Changed
- Updated SnapTrade SDK to version 9.0.97
- Refactored client implementation to follow SDK-first approach
- Improved error handling with SnapTradeError type
- Enhanced authentication flow in SnapTrade integration

### Added
- New SnapTrade client implementation with proper type safety
- Added validation functions for auth headers and user credentials
- Implemented proper error handling for SnapTrade API calls
- Added documentation for SnapTrade integration

### Technical Details
- SnapTrade integration follows official SDK patterns
- Authentication handled through SDK methods
- Type safety maintained throughout integration
- Error handling standardized across all SnapTrade operations 