import { test, expect } from '@playwright/test';

test.describe('Detailed Report Submission Flow', () => {
  test('should submit detailed report after quick report', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Ensure we're on the search tab
    await expect(page.getByRole('tab', { name: 'Search' })).toBeVisible();
    await page.getByRole('tab', { name: 'Search' }).click();

    // Select a model from the dropdown
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'GPT-4' }).first().click();

    // Verify the model was selected
    await expect(page.getByRole('button', { name: /GPT-4/ })).toBeVisible();

    // Wait for the report form to appear
    await expect(page.getByText('Briefly describe the issue *')).toBeVisible();

    // Fill out the quick report
    await page.getByLabel('Briefly describe the issue *').fill('The model is giving incorrect responses to basic questions');

    // Select an issue category
    await page.getByRole('radio', { name: 'Hallucination' }).check();

    // Select a product context
    await page.getByRole('radio', { name: 'Direct API' }).check();

    // Submit the detailed report
    await page.getByRole('button', { name: 'Submit Report' }).click();

    // Wait for success message
    await expect(page.getByText(/Detailed report submitted successfully/)).toBeVisible();

    // Verify the form is reset after successful submission
    await expect(page.getByLabel('Briefly describe the issue *')).toHaveValue('');
    await expect(page.getByRole('radio', { name: 'Hallucination' })).not.toBeChecked();
    await expect(page.getByRole('radio', { name: 'Direct API' })).not.toBeChecked();
  });

  test('should handle form validation errors', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Select a model
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Claude 3.5 Sonnet' }).click();

    // Try to submit without filling required fields
    await page.getByRole('button', { name: 'Submit Report' }).click();

    // Should show error messages
    await expect(page.getByText('Please describe the issue')).toBeVisible();
    await expect(page.getByText('Please select an issue category')).toBeVisible();
    await expect(page.getByText('Please select a product context')).toBeVisible();
  });

  test('should handle "Other" options correctly', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Select a model
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Gemini 1.5 Pro' }).click();

    // Fill out the basic fields
    await page.getByLabel('Briefly describe the issue *').fill('Custom issue description');

    // Select "Other" for issue category
    await page.getByRole('radio', { name: 'Other' }).first().check();

    // Should show the text input for custom issue
    await expect(page.getByPlaceholder('Please specify the issue category...')).toBeVisible();
    await page.getByPlaceholder('Please specify the issue category...').fill('Custom Issue Type');

    // Select "Other" for product context
    await page.getByRole('radio', { name: 'Other' }).nth(1).check();

    // Should show the text input for custom context
    await expect(page.getByPlaceholder('Please specify...')).toBeVisible();
    await page.getByPlaceholder('Please specify...').fill('Custom Product Context');

    // Submit the form
    await page.getByRole('button', { name: 'Submit Report' }).click();

    // Should succeed
    await expect(page.getByText(/Detailed report submitted successfully/)).toBeVisible();
  });

  test('should show conditional options for Anthropic models', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Select Claude model
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Claude 3.5 Sonnet' }).click();

    // Fill out basic fields
    await page.getByLabel('Briefly describe the issue *').fill('Issue with Claude model');
    await page.getByRole('radio', { name: 'Memory' }).check();

    // Should show "Claude Code" option for Anthropic models
    await expect(page.getByRole('radio', { name: 'Claude Code' })).toBeVisible();

    // Select Claude Code
    await page.getByRole('radio', { name: 'Claude Code' }).check();

    // Submit the form
    await page.getByRole('button', { name: 'Submit Report' }).click();

    // Should succeed
    await expect(page.getByText(/Detailed report submitted successfully/)).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Select a model
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'GPT-4' }).first().click();

    // Fill out the form
    await page.getByLabel('Briefly describe the issue *').fill('Test issue');
    await page.getByRole('radio', { name: 'Reliability' }).check();
    await page.getByRole('radio', { name: 'Official Web UI' }).check();

    // Mock network failure by blocking the API call
    await page.route('**/api/events/report', route => route.abort());

    // Try to submit
    await page.getByRole('button', { name: 'Submit Report' }).click();

    // Should show network error
    await expect(page.getByText('Network error occurred')).toBeVisible();
  });
});