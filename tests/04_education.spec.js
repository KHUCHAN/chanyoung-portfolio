import { test, expect } from '@playwright/test';

test.describe('Education 섹션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#education').scrollIntoViewIfNeeded();
  });

  test('"Education" 섹션 헤딩이 있음', async ({ page }) => {
    await expect(page.locator('#education h3')).toContainText('Education');
  });

  test('"Academic Background" 서브타이틀이 있음', async ({ page }) => {
    await expect(page.locator('#education h2')).toContainText('Academic Background');
  });

  test('USC 학교명이 표시됨', async ({ page }) => {
    await expect(page.locator('text=University of Southern California')).toBeVisible();
  });

  test('USC 학위명이 표시됨', async ({ page }) => {
    await expect(page.locator('text=Master of Science in Applied Data Science')).toBeVisible();
  });

  test('USC 기간이 표시됨', async ({ page }) => {
    await expect(page.locator('text=Jan 2026 - Dec 2027')).toBeVisible();
  });

  test('경희대 학교명이 표시됨', async ({ page }) => {
    // .first()는 locator에 적용해야 함
    await expect(page.locator('text=Kyung Hee University').first()).toBeVisible();
  });

  test('경희대 학위명이 표시됨', async ({ page }) => {
    await expect(page.locator('text=Bachelor of Business Administration')).toBeVisible();
  });

  test('GPA 정보가 표시됨', async ({ page }) => {
    await expect(page.locator('text=GPA: 3.89 / 4.5')).toBeVisible();
  });

  test('장학금 정보가 표시됨', async ({ page }) => {
    await expect(page.locator('text=Merit-based Scholarship')).toBeVisible();
  });

  test('두 개의 교육 카드가 렌더링됨', async ({ page }) => {
    const cards = page.locator('#education .rounded-3xl');
    await expect(cards).toHaveCount(2);
  });

  test('로고 이미지들이 렌더링됨', async ({ page }) => {
    const logos = page.locator('#education img');
    const count = await logos.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});
