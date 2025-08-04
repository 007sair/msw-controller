# @msw-controller/sdk

## 1.0.1

### Patch Changes

- Fix UMD build issue where getController was undefined when using CDN

  - Removed dynamic imports in MSWControllerSDK to ensure core package is bundled
  - Fixed "Cannot read properties of undefined (reading 'getController')" error
  - UMD build now includes all necessary dependencies for standalone usage

## 1.0.0

### Major Changes

- release

### Patch Changes

- Updated dependencies
  - @msw-controller/core@1.0.0
