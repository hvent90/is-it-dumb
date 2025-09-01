import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
  test('should display trending overview with charts', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Switch to trending tab
    await page.getByRole('tab', { name: 'Trending' }).click();

    // Wait for the analytics dashboard to load
    await expect(page.getByText('Top Reported Models')).toBeVisible();
    await expect(page.getByText('Issue Distribution')).toBeVisible();

    // Check that charts are rendered
    await expect(page.locator('[data-testid="responsive-container"]')).toHaveCount(3);

    // Check filter controls are present
    await expect(page.getByText('Filters')).toBeVisible();
    await expect(page.getByText('Time Range')).toBeVisible();
    await expect(page.getByText('Model Family')).toBeVisible();
  });

  test('should apply filters and update charts', async ({ page }) => {
    // Navigate to trending tab
    await page.goto('/');
    await page.getByRole('tab', { name: 'Trending' }).click();

    // Wait for initial load
    await expect(page.getByText('Top Reported Models')).toBeVisible();

    // Change time range filter
    await page.getByRole('combobox', { name: /time range/i }).click();
    await page.getByRole('option', { name: 'Last 30 days' }).click();

    // Change model family filter
    await page.getByRole('combobox', { name: /model family/i }).click();
    await page.getByRole('option', { name: 'OpenAI' }).click();

    // Click apply filters
    await page.getByRole('button', { name: 'Apply Filters' }).click();

    // Should show loading state briefly
    await expect(page.getByText('Loading...')).toBeVisible();

    // Charts should still be visible after filtering
    await expect(page.getByText('Top Reported Models')).toBeVisible();
  });

  test('should navigate to model detail page when clicking chart bar', async ({ page }) => {
    // Navigate to trending tab
    await page.goto('/');
    await page.getByRole('tab', { name: 'Trending' }).click();

    // Wait for charts to load
    await expect(page.getByText('Top Reported Models')).toBeVisible();

    // Mock the chart click by navigating directly to a model page
    // (In a real scenario, you'd need to interact with the Recharts components)
    await page.goto('/analytics/model/GPT-4');

    // Should be on model detail page
    await expect(page.getByText('GPT-4')).toBeVisible();
    await expect(page.getByText('Report Trends Over Time')).toBeVisible();
    await expect(page.getByText('Issue Breakdown')).toBeVisible();
  });

  test('should navigate to issue detail page when clicking issue chart', async ({ page }) => {
    // Navigate to trending tab
    await page.goto('/');
    await page.getByRole('tab', { name: 'Trending' }).click();

    // Wait for charts to load
    await expect(page.getByText('Issue Distribution')).toBeVisible();

    // Mock navigation to issue detail page
    await page.goto('/analytics/issue/Hallucination');

    // Should be on issue detail page
    await expect(page.getByText('Hallucination')).toBeVisible();
    await expect(page.getByText('Models Affected by Hallucination')).toBeVisible();
  });

  test('should display model detail page with quality data', async ({ page }) => {
    // Navigate to model detail page
    await page.goto('/analytics/model/GPT-4');

    // Check basic model info
    await expect(page.getByText('GPT-4')).toBeVisible();
    await expect(page.getByText('Report Trends Over Time')).toBeVisible();

    // Check quality evaluation section
    await expect(page.getByText('Automated Quality Evaluation')).toBeVisible();
    await expect(page.getByText('Overall Score')).toBeVisible();
    await expect(page.getByText('Accuracy')).toBeVisible();
    await expect(page.getByText('Safety')).toBeVisible();
    await expect(page.getByText('Efficiency')).toBeVisible();

    // Check quality trends chart
    await expect(page.getByText('Quality Score Trends (Automated Evaluation)')).toBeVisible();
  });

  test('should display issue detail page with affected models', async ({ page }) => {
    // Navigate to issue detail page
    await page.goto('/analytics/issue/Hallucination');

    // Check basic issue info
    await expect(page.getByText('Hallucination')).toBeVisible();
    await expect(page.getByText('Models Affected by Hallucination')).toBeVisible();

    // Check statistics
    await expect(page.getByText('Total Reports')).toBeVisible();
    await expect(page.getByText('Affected Models')).toBeVisible();

    // Check model list
    await expect(page.getByText('Most Affected Models')).toBeVisible();
  });

  test('should handle back navigation from detail pages', async ({ page }) => {
    // Navigate to model detail page
    await page.goto('/analytics/model/GPT-4');

    // Click back button
    await page.getByRole('button', { name: 'Back to Analytics' }).click();

    // Should return to trending tab
    await expect(page.getByText('Top Reported Models')).toBeVisible();
  });

  test('should highlight recently reported model', async ({ page }) => {
    // First submit a report to create a highlighted model
    await page.goto('/');

    // Select a model and submit report
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'GPT-4' }).first().click();

    await page.getByLabel('Briefly describe the issue *').fill('Test issue for highlighting');
    await page.getByRole('radio', { name: 'Hallucination' }).check();
    await page.getByRole('radio', { name: 'Direct API' }).check();

    await page.getByRole('button', { name: 'Submit Report' }).click();

    // Wait for success and auto-navigation to trending
    await expect(page.getByText(/Detailed report submitted successfully/)).toBeVisible();

    // Should show highlight message
    await expect(page.getByText(/You just reported an issue for GPT-4/)).toBeVisible();
  });

  test('should display quality scores in trending overview', async ({ page }) => {
    // Navigate to trending tab
    await page.goto('/');
    await page.getByRole('tab', { name: 'Trending' }).click();

    // Check for quality scores chart
    await expect(page.getByText('Model Quality Scores (Automated Evaluation)')).toBeVisible();

    // Should have both user reports and quality data
    await expect(page.getByText('Top Reported Models')).toBeVisible();
  });
});