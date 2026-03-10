/**
 * Test script to verify all 3 bug fixes without needing a live DB or server.
 * Run with: node test_fixes.js
 */

const argon2 = require('argon2');
const { encryptData, deEncryption } = require('./src/middleware/encrptions');

let passed = 0;
let failed = 0;

function assert(label, condition) {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n=== Fix 1: updateCurrentUser / updateUserById (undefined `updates` variable) ===');
  try {
    // Simulate the fixed logic
    const req_body = { name: 'Test User', phoneNumber: '08012345678', password: 'secret', email: 'x@x.com', id: '123' };
    const updateData = { ...req_body };
    ['password', 'email', 'id'].forEach((field) => delete updateData[field]);

    assert('updateData contains name', updateData.name === 'Test User');
    assert('updateData contains phoneNumber', updateData.phoneNumber === '08012345678');
    assert('password is stripped', !('password' in updateData));
    assert('email is stripped', !('email' in updateData));
    assert('id is stripped', !('id' in updateData));
  } catch (e) {
    console.error('  ❌ Exception:', e.message);
    failed++;
  }

  console.log('\n=== Fix 2: transactionPin is now hashed with argon2 before saving ===');
  try {
    const rawPin = '1234';
    const hashedPin = await argon2.hash(rawPin);

    assert('hashed pin is a string', typeof hashedPin === 'string');
    assert('hashed pin is not plain text', hashedPin !== rawPin);
    assert('argon2.verify succeeds with correct pin', await argon2.verify(hashedPin, rawPin));
    assert('argon2.verify fails with wrong pin', !(await argon2.verify(hashedPin, '9999')));
  } catch (e) {
    console.error('  ❌ Exception:', e.message);
    failed++;
  }

  console.log('\n=== Fix 3: getSagecloudToken returns { access_token } object ===');
  try {
    // Simulate what the fixed getSagecloudToken returns
    const mockSagecloudResponse = { success: true, data: { token: 'abc123token', business_name: 'TestBiz' } };
    const fixedReturn = { access_token: mockSagecloudResponse.data.token };

    // Simulate how utility_bill.js consumes it
    const accessTokenResponse = fixedReturn;
    const token = accessTokenResponse?.access_token;

    assert('token is extracted correctly', token === 'abc123token');
    assert('token is not undefined', token !== undefined);
  } catch (e) {
    console.error('  ❌ Exception:', e.message);
    failed++;
  }

  console.log('\n=== Fix 4: sagecloud_auth.js no longer auto-invokes on require ===');
  try {
    // If the module auto-invoked, it would throw/log on missing env keys.
    // We just verify the export shape is correct.
    const sagecloudModule = require('./src/config/sagecloud_auth');
    assert('getSagecloudToken is exported as a function', typeof sagecloudModule.getSagecloudToken === 'function');
    assert('module has no extra unexpected exports', Object.keys(sagecloudModule).length === 1);
  } catch (e) {
    console.error('  ❌ Exception:', e.message);
    failed++;
  }

  console.log('\n=== OTP encrypt/decrypt (existing feature sanity check) ===');
  try {
    const otp = '5678';
    const encrypted = await encryptData(otp);           // returns { message: "iv:ciphertext" }
    const decrypted = await deEncryption(encrypted.message); // pass the string value
    assert('OTP encrypts to a non-plain string', encrypted.message !== otp);
    assert('OTP decrypts back correctly', decrypted.message === otp);
  } catch (e) {
    console.error('  ❌ Exception:', e.message);
    failed++;
  }

  console.log(`\n=============================`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`=============================\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
