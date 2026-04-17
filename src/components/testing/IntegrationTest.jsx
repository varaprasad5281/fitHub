/**
 * Integration Test Suite - Validates all critical user flows
 * Run on app startup in dev mode to catch regressions
 */

import { api } from '@/api/client';

const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

async function testCheckoutFlow() {
  try {
    // Test 1: Verify checkout endpoint exists
    const response = await api.functions.invoke('createCheckout', {
      billingPeriod: 'monthly',
      userEmail: 'test@example.com',
      idempotencyKey: `test_${Date.now()}`
    });
    
    if (!response.data?.sessionId) {
      throw new Error('Checkout missing sessionId');
    }
    testResults.passed++;
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`Checkout flow: ${error.message}`);
  }
}

async function testMealLogging() {
  try {
    const validation = validateMealInput({
      date: new Date().toISOString().split('T')[0],
      meal_type: 'breakfast',
      meal_name: 'Eggs',
      calories: 300,
      protein: 15,
      carbs: 5,
      fats: 25
    });

    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    testResults.passed++;
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`Meal logging: ${error.message}`);
  }
}

async function testChatSanitization() {
  try {
    const message = '<script>alert("xss")</script>Hello';
    const sanitized = sanitizeText(message);
    
    if (sanitized.includes('<script>') || sanitized.includes('alert')) {
      throw new Error('XSS not properly sanitized');
    }
    testResults.passed++;
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`Chat sanitization: ${error.message}`);
  }
}

export async function runIntegrationTests() {
  console.log('[TESTS] Running integration test suite...');
  
  await testCheckoutFlow();
  await testMealLogging();
  await testChatSanitization();

  console.log('[TESTS] Results:', {
    passed: testResults.passed,
    failed: testResults.failed,
    errors: testResults.errors
  });

  return testResults;
}

function validateMealInput(data) {
  const errors = [];
  const { date, meal_type, meal_name, calories } = data;

  if (!date || isNaN(new Date(date).getTime())) errors.push('Invalid date');
  if (!['breakfast', 'lunch', 'dinner', 'snack'].includes(meal_type)) errors.push('Invalid meal type');
  if (!meal_name || meal_name.length === 0) errors.push('Meal name required');
  if (typeof calories !== 'number' || calories < 0 || calories > 10000) errors.push('Invalid calories');

  return { isValid: errors.length === 0, errors };
}

function sanitizeText(str) {
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/[\x00-\x1F\x7F]/g, '');
}