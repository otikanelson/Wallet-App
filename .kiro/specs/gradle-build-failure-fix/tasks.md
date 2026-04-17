# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Gradle 8.8 Compatibility Failure
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: For deterministic bugs, scope the property to the concrete failing case(s) to ensure reproducibility
  - Test that Android release builds fail with Gradle 8.8 and expo-module-gradle-plugin (from Bug Condition in design)
  - Verify "Unresolved reference: extensions" and "Unresolved reference: extra" compilation errors occur
  - Run `./gradlew :app:assembleRelease` on UNFIXED code with Gradle 8.8
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Release Build Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (debug builds, development server, iOS builds)
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Test that debug builds (`./gradlew :app:assembleDebug`) work correctly on unfixed code
  - Test that development server commands (`expo start`, `expo run:android`) work correctly on unfixed code
  - Test that iOS builds remain unaffected on unfixed code
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Fix for Gradle 8.8 compatibility issue

  - [x] 3.1 Implement the Gradle version downgrade
    - Update `mobile/android/gradle/wrapper/gradle-wrapper.properties`
    - Change `distributionUrl` from Gradle 8.8 to Gradle 8.6
    - Set `distributionUrl=https\://services.gradle.org/distributions/gradle-8.6-all.zip`
    - Verify Android Gradle Plugin 8.2.2 compatibility with Gradle 8.6
    - Ensure Expo SDK ~54.0.0 compatibility with Gradle 8.6
    - _Bug_Condition: isBugCondition(input) where input.gradleVersion == "8.8" AND input.buildTask == "assembleRelease" AND input.hasExpoModuleGradlePlugin == true_
    - _Expected_Behavior: successfulBuild(result) for all Android release builds_
    - _Preservation: Debug builds, development server functionality, and iOS builds remain unchanged_
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Gradle 8.6 Compatibility Success
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Release Build Behavior
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [-] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.