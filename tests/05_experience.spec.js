import { test, expect } from '@playwright/test';

test.describe('Experience 섹션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#experience').scrollIntoViewIfNeeded();
  });

  test('"Experience" 섹션 헤딩이 있음', async ({ page }) => {
    await expect(page.locator('#experience h3')).toContainText('Experience');
  });

  test('"Professional Journey" 서브타이틀이 있음', async ({ page }) => {
    await expect(page.locator('#experience h2')).toContainText('Professional Journey');
  });

  test('KPMG 카드가 표시됨', async ({ page }) => {
    await expect(page.locator('text=KPMG')).toBeVisible();
  });

  test('KPMG 직책이 표시됨', async ({ page }) => {
    await expect(page.locator('text=Senior Consultant').first()).toBeVisible();
  });

  test('KPMG 기간이 표시됨', async ({ page }) => {
    await expect(page.locator('text=Jan 2023 - Dec 2025')).toBeVisible();
  });

  test('경희대 Research Assistant 카드가 표시됨', async ({ page }) => {
    await expect(page.locator('text=Research Assistant')).toBeVisible();
  });

  test('ROKA 카드가 표시됨', async ({ page }) => {
    await expect(page.locator('text=ROKA')).toBeVisible();
  });

  test('ROKA Sergeant 직책이 표시됨', async ({ page }) => {
    await expect(page.locator('text=Sergeant')).toBeVisible();
  });

  test('골드 배지 - "Outstanding Participant of Global Elite Program" 표시됨', async ({ page }) => {
    const badge = page.locator('text=Outstanding Participant of Global Elite Program');
    await expect(badge).toBeVisible();
    // 배경색이 yellow 계열인지 확인
    const classList = await badge.getAttribute('class');
    expect(classList).toContain('yellow');
  });

  test('골드 배지 - "Outstanding Paper Award" 표시됨', async ({ page }) => {
    const badge = page.locator('text=Outstanding Paper Award');
    await expect(badge).toBeVisible();
    const classList = await badge.getAttribute('class');
    expect(classList).toContain('yellow');
  });

  test('골드 배지 - "Battalion Commander\'s Commendation" 표시됨', async ({ page }) => {
    const badge = page.locator('text=Battalion Commander\'s Commendation (x2)');
    await expect(badge).toBeVisible();
    const classList = await badge.getAttribute('class');
    expect(classList).toContain('yellow');
  });

  test('경력 카드 3개가 렌더링됨', async ({ page }) => {
    const cards = page.locator('#experience .rounded-3xl');
    await expect(cards).toHaveCount(3);
  });

  test('근무 기간 태그들이 표시됨 (3 yrs, 1 yr, 1 yr 10 mos)', async ({ page }) => {
    await expect(page.locator('text=3 yrs')).toBeVisible();
    await expect(page.locator('text=1 yr').first()).toBeVisible();
  });
});
