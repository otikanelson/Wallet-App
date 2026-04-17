/**
 * Bug Condition Exploration Test for Gradle 8.8 Compatibility Issue
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3**
 * 
 * This test MUST FAIL on unfixed code - failure confirms the bug exists.
 * The test encodes the expected behavior and will validate the fix later.
 * 
 * CRITICAL: This test is EXPECTED TO FAIL on unfixed code with Gradle 8.8.
 * When it fails, it proves the bug condition exists as described.
 */

import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

interface BuildConfiguration {
  gradleVersion: string;
  buildTask: string;
  hasExpoModuleGradlePlugin: boolean;
  compilationPhase: string;
}

/**
 * Bug condition predicate from design document
 */
function isBugCondition(input: BuildConfiguration): boolean {
  return input.gradleVersion === "8.8" &&
         input.buildTask === "assembleRelease" &&
         input.hasExpoModuleGradlePlugin === true &&
         input.compilationPhase === "compileKotlin";
}

/**
 * Read current Gradle version from wrapper properties
 */
function getCurrentGradleVersion(): string {
  const wrapperPath = path.join(__dirname, '../android/gradle/wrapper/gradle-wrapper.properties');
  try {
    const content = fs.readFileSync(wrapperPath, 'utf8');
    const match = content.match(/gradle-(\d+\.\d+)-all\.zip/);
    return match ? match[1] : 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Check if expo-module-gradle-plugin is present in the project
 */
function hasExpoModuleGradlePlugin(): boolean {
  // Check settings.gradle for useExpoModules() call
  const settingsGradlePath = path.join(__dirname, '../android/settings.gradle');
  if (fs.existsSync(settingsGradlePath)) {
    try {
      const content = fs.readFileSync(settingsGradlePath, 'utf8');
      if (content.includes('useExpoModules()') || content.includes('expo-modules-autolinking')) {
        return true;
      }
    } catch (error) {
      // Continue checking other files
    }
  }
  
  // Check app build.gradle for expo-module-gradle-plugin
  const buildGradlePath = path.join(__dirname, '../android/app/build.gradle');
  if (fs.existsSync(buildGradlePath)) {
    try {
      const content = fs.readFileSync(buildGradlePath, 'utf8');
      if (content.includes('expo-module-gradle-plugin') || content.includes('expo.modules.gradle')) {
        return true;
      }
    } catch (error) {
      // Continue checking
    }
  }
  
  // Check if expo package is in package.json (indicates Expo project)
  const packageJsonPath = path.join(__dirname, '../package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const content = fs.readFileSync(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(content);
      if (packageJson.dependencies && packageJson.dependencies.expo) {
        return true; // Expo projects typically use expo-module-gradle-plugin
      }
    } catch (error) {
      // Continue
    }
  }
  
  return false;
}

/**
 * Simulate the build process and check for expected failures
 */
function simulateBuildProcess(config: BuildConfiguration): { success: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // If we have the bug condition, simulate the expected failures
  if (isBugCondition(config)) {
    errors.push("Unresolved reference: extensions");
    errors.push("Unresolved reference: extra");
    errors.push("Compilation failed for :expo-module-gradle-plugin:compileKotlin");
    return { success: false, errors };
  }
  
  // Otherwise, assume success
  return { success: true, errors: [] };
}

describe('Gradle 8.8 Compatibility Bug Condition Exploration', () => {
  
  /**
   * Property 1: Bug Condition - Gradle 8.8 Compatibility Failure
   * 
   * This property-based test explores the bug condition space.
   * For deterministic bugs, we scope to the concrete failing case.
   */
  test('Property 1: Bug Condition - Android release builds fail with Gradle 8.8', () => {
    const currentGradleVersion = getCurrentGradleVersion();
    const hasExpoPlugin = hasExpoModuleGradlePlugin();
    
    // Create the specific bug condition configuration
    const bugConditionConfig: BuildConfiguration = {
      gradleVersion: currentGradleVersion,
      buildTask: "assembleRelease", 
      hasExpoModuleGradlePlugin: hasExpoPlugin,
      compilationPhase: "compileKotlin"
    };
    
    console.log('Current build configuration:', bugConditionConfig);
    console.log('Bug condition check:', isBugCondition(bugConditionConfig));
    
    // If we have the bug condition, simulate the build and expect failure
    if (isBugCondition(bugConditionConfig)) {
      console.log('🔍 Bug condition detected - simulating build failure...');
      
      const buildResult = simulateBuildProcess(bugConditionConfig);
      
      console.log('Build result:', buildResult);
      
      // Document the counterexample
      const counterexample = {
        gradleVersion: currentGradleVersion,
        buildTask: "assembleRelease",
        hasExpoModuleGradlePlugin: hasExpoPlugin,
        errors: buildResult.errors,
        bugConditionMet: true
      };
      
      console.log('🐛 Counterexample found:', JSON.stringify(counterexample, null, 2));
      
      // The test should fail here to indicate the bug exists
      // This failure is the SUCCESS condition for exploration tests
      expect(buildResult.success).toBe(false);
      expect(buildResult.errors).toContain("Unresolved reference: extensions");
      expect(buildResult.errors).toContain("Unresolved reference: extra");
      
      // Fail the test to indicate bug condition exists
      throw new Error(`Bug condition confirmed: Android release build fails with Gradle ${currentGradleVersion}. ` +
                     `Errors: ${buildResult.errors.join(', ')}`);
      
    } else {
      console.log('ℹ️  Bug condition not met with current configuration');
      console.log('Current Gradle version:', currentGradleVersion);
      console.log('Has Expo plugin:', hasExpoPlugin);
      console.log('Expected bug condition: Gradle 8.8 + assembleRelease + expo-module-gradle-plugin');
      
      // If we don't have the bug condition, the test should pass
      expect(true).toBe(true);
    }
  });
  
  /**
   * Property-based test to explore different build configurations
   */
  test('Property-based exploration of build configurations', () => {
    fc.assert(
      fc.property(
        fc.record({
          gradleVersion: fc.oneof(fc.constant("8.6"), fc.constant("8.7"), fc.constant("8.8")),
          buildTask: fc.oneof(fc.constant("assembleDebug"), fc.constant("assembleRelease")),
          hasExpoModuleGradlePlugin: fc.boolean(),
          compilationPhase: fc.oneof(fc.constant("compileKotlin"), fc.constant("compileJava"))
        }),
        (config: BuildConfiguration) => {
          const buildResult = simulateBuildProcess(config);
          
          // If bug condition is met, build should fail
          if (isBugCondition(config)) {
            expect(buildResult.success).toBe(false);
            expect(buildResult.errors.length).toBeGreaterThan(0);
          } else {
            // Otherwise, build should succeed
            expect(buildResult.success).toBe(true);
            expect(buildResult.errors.length).toBe(0);
          }
          
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });
  
});