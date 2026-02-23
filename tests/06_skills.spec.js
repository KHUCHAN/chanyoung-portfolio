import { test, expect } from '@playwright/test';

test.describe('Technical Skills 섹션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#personal').scrollIntoViewIfNeeded();
  });

  test('"Technical Skills" 헤딩이 있음', async ({ page }) => {
    await expect(page.locator('#personal h3')).toContainText('Technical Skills');
  });

  test('"Core Competencies" 서브타이틀이 있음', async ({ page }) => {
    await expect(page.locator('#personal h2')).toContainText('Core Competencies');
  });

  test('"Languages" 카테고리가 있음', async ({ page }) => {
    await expect(page.locator('text=Languages').first()).toBeVisible();
  });

  test('"AI / Machine Learning" 카테고리가 있음', async ({ page }) => {
    await expect(page.locator('text=AI / Machine Learning')).toBeVisible();
  });

  test('"Data Engineering" 카테고리가 있음', async ({ page }) => {
    await expect(page.locator('text=Data Engineering')).toBeVisible();
  });

  test('Python 스킬 칩이 있음', async ({ page }) => {
    await expect(page.locator('span:has-text("Python")').first()).toBeVisible();
  });

  test('SQL 스킬 칩이 있음', async ({ page }) => {
    await expect(page.locator('span:has-text("SQL")')).toBeVisible();
  });

  test('R 스킬 칩이 있음', async ({ page }) => {
    await expect(page.locator('span:has-text("R")').first()).toBeVisible();
  });

  test('JavaScript 스킬 칩이 있음', async ({ page }) => {
    await expect(page.locator('span:has-text("JavaScript")')).toBeVisible();
  });

  test('SAP ABAP 스킬 칩이 있음', async ({ page }) => {
    await expect(page.locator('span:has-text("SAP ABAP")')).toBeVisible();
  });

  test('NLP 스킬 칩이 있음', async ({ page }) => {
    await expect(page.locator('span:has-text("NLP (KoNLPy, NLTK)")')).toBeVisible();
  });

  test('K-Means Clustering 스킬 칩이 있음', async ({ page }) => {
    await expect(page.locator('span:has-text("K-Means Clustering")')).toBeVisible();
  });

  test('Knowledge Graph 스킬 칩이 있음', async ({ page }) => {
    await expect(page.locator('span:has-text("Knowledge Graph (Neo4j, Cypher)")')).toBeVisible();
  });

  test('스킬 카드 3개가 렌더링됨', async ({ page }) => {
    const cards = page.locator('#personal .rounded-3xl');
    await expect(cards).toHaveCount(3);
  });
});
