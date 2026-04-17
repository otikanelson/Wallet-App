# Gradle Build Failure Fix Design

## Overview

The Android build process fails during the `:expo-module-gradle-plugin:compileKotlin` task with "Unresolved reference" errors for 'extensions' and 'extra' properties when using Gradle 8.8. This is a compatibility issue between Gradle 8.8 and expo-module-gradle-plugin in Expo SDK ~54.0.0. The fix involves downgrading to a compatible Gradle version (8.6) that maintains compatibility with the current Android Gradle Plugin (8.2.2) and Expo toolchain while preserving all existing functionality.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the build failure - when Gradle 8.8 is used with expo-module-gradle-plugin causing Kotlin compilation errors
- **Property (P)**: The desired behavior when building Android release - successful compilation without "Unresolved reference" errors
- **Preservation**: Existing debug builds, development server functionality, and iOS builds that must remain unchanged
- **gradle-wrapper.properties**: The file in `mobile/android/gradle/wrapper/gradle-wrapper.properties` that specifies the Gradle distribution version
- **distributionUrl**: The property that determines which Gradle version is downloaded and used for builds

## Bug Details

### Bug Condition

The bug manifests when running Android release builds (`gradlew :app:assembleRelease`) with Gradle 8.8 and expo-module-gradle-plugin. The expo-module-gradle-plugin's Kotlin code fails to compile because it cannot resolve references to 'extensions' and 'extra' properties, which are part of Gradle's Project API that changed between versions.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type BuildConfiguration
  OUTPUT: boolean
  
  RETURN input.gradleVersion == "8.8"
         AND input.buildTask == "assembleRelease"
         AND input.hasExpoModuleGradlePlugin == true
         AND input.compilationPhase == "compileKotlin"
END FUNCTION
```

### Examples

- **Release Build Failure**: Running `./gradlew :app:assembleRelease` with Gradle 8.8 fails with "Unresolved reference: extensions" during `:expo-module-gradle-plugin:compileKotlin`
- **Kotlin Compilation Error**: The expo-module-gradle-plugin cannot access Project.extensions property due to API changes in Gradle 8.8
- **Build Task Termination**: The entire build process stops at the Kotlin compilation phase, preventing APK generation
- **Debug Builds Work**: Running `./gradlew :app:assembleDebug` may work because different code paths are used

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Debug builds (`./gradlew :app:assembleDebug`) must continue to work exactly as before
- Development server commands (`expo start`, `expo run:android`) must continue to function without issues
- iOS builds must remain completely unaffected by Android Gradle version changes

**Scope:**
All build configurations that do NOT involve Android release builds should be completely unaffected by this fix. This includes:
- Development and debugging workflows
- iOS platform builds
- Web platform builds
- Metro bundler functionality

## Hypothesized Root Cause

Based on the bug description and Gradle version analysis, the most likely issues are:

1. **Gradle API Changes**: Gradle 8.8 introduced breaking changes to the Project API that affect how plugins access 'extensions' and 'extra' properties
   - The expo-module-gradle-plugin was built for earlier Gradle versions
   - API methods for accessing project extensions changed signature or behavior

2. **Plugin Compatibility Matrix**: The current Expo SDK ~54.0.0 with expo-module-gradle-plugin is not compatible with Gradle 8.8
   - Expo documentation likely specifies supported Gradle versions
   - The plugin needs updates to work with newer Gradle APIs

3. **Kotlin Compilation Context**: The Kotlin compiler in Gradle 8.8 has stricter reference resolution
   - Previously accessible properties are now resolved differently
   - The plugin's Kotlin code needs adaptation for the new compilation context

4. **Android Gradle Plugin Interaction**: The combination of Android Gradle Plugin 8.2.2 with Gradle 8.8 may create compatibility issues
   - The AGP version may not fully support Gradle 8.8 features
   - Plugin interaction patterns may have changed

## Correctness Properties

Property 1: Bug Condition - Gradle Compatibility Fix

_For any_ build configuration where Gradle 8.8 is used with expo-module-gradle-plugin and Android release builds are attempted, the fixed configuration SHALL use a compatible Gradle version that allows successful compilation without "Unresolved reference" errors.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Non-Release Build Behavior

_For any_ build configuration that is NOT an Android release build (debug builds, development server, iOS builds), the fixed Gradle version SHALL produce exactly the same behavior as the original configuration, preserving all existing development and debugging functionality.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `mobile/android/gradle/wrapper/gradle-wrapper.properties`

**Property**: `distributionUrl`

**Specific Changes**:
1. **Gradle Version Downgrade**: Change from Gradle 8.8 to Gradle 8.6
   - Update `distributionUrl=https\://services.gradle.org/distributions/gradle-8.6-all.zip`
   - Gradle 8.6 is known to be compatible with Android Gradle Plugin 8.2.2

2. **Compatibility Verification**: Ensure the downgraded version maintains compatibility
   - Verify Android Gradle Plugin 8.2.2 supports Gradle 8.6
   - Confirm Expo SDK ~54.0.0 works with Gradle 8.6

3. **Build Tool Consistency**: Maintain consistency with other build configurations
   - Keep Android build tools version at 34.0.0
   - Preserve Kotlin version 1.9.10 compatibility

4. **Alternative Solution Path**: If Gradle 8.6 doesn't resolve the issue
   - Consider Gradle 8.5 or 8.4 as fallback options
   - Evaluate updating expo-module-gradle-plugin if newer versions are available

5. **Documentation Update**: Update any project documentation that references Gradle version requirements
   - Update README or build instructions if they specify Gradle versions
   - Document the compatibility constraint for future reference

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed configuration, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Attempt to build Android release with current Gradle 8.8 configuration and document the exact failure patterns. Run these tests on the UNFIXED configuration to observe failures and understand the root cause.

**Test Cases**:
1. **Release Build Test**: Run `./gradlew :app:assembleRelease` with Gradle 8.8 (will fail on unfixed configuration)
2. **Kotlin Compilation Test**: Isolate the `:expo-module-gradle-plugin:compileKotlin` task (will fail on unfixed configuration)
3. **Clean Build Test**: Run `./gradlew clean :app:assembleRelease` to ensure clean state (will fail on unfixed configuration)
4. **Verbose Build Test**: Run with `--stacktrace --info` flags to get detailed error information (will fail on unfixed configuration)

**Expected Counterexamples**:
- "Unresolved reference: extensions" compilation errors in expo-module-gradle-plugin
- Possible causes: Gradle API changes, plugin incompatibility, Kotlin compiler strictness

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed configuration produces the expected behavior.

**Pseudocode:**
```
FOR ALL buildConfig WHERE isBugCondition(buildConfig) DO
  result := buildWithFixedGradle(buildConfig)
  ASSERT successfulBuild(result)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed configuration produces the same result as the original configuration.

**Pseudocode:**
```
FOR ALL buildConfig WHERE NOT isBugCondition(buildConfig) DO
  ASSERT originalBuild(buildConfig) = fixedBuild(buildConfig)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across different build configurations
- It catches edge cases that manual testing might miss
- It provides strong guarantees that behavior is unchanged for all non-release Android builds

**Test Plan**: Observe behavior on UNFIXED configuration first for debug builds and development workflows, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Debug Build Preservation**: Observe that `./gradlew :app:assembleDebug` works correctly on unfixed configuration, then verify this continues after fix
2. **Development Server Preservation**: Observe that `expo start` and `expo run:android` work correctly on unfixed configuration, then verify this continues after fix
3. **iOS Build Preservation**: Observe that iOS builds work correctly on unfixed configuration, then verify this continues after fix

### Unit Tests

- Test Gradle wrapper configuration parsing and version detection
- Test build task execution for different configurations (debug vs release)
- Test that Android Gradle Plugin compatibility is maintained

### Property-Based Tests

- Generate random build configurations and verify successful compilation with fixed Gradle version
- Generate random development workflow scenarios and verify preservation of functionality
- Test that all non-Android-release builds continue to work across many scenarios

### Integration Tests

- Test full Android release build flow with fixed Gradle version
- Test development workflow integration (expo start → expo run:android)
- Test that build artifacts are generated correctly and APK is functional