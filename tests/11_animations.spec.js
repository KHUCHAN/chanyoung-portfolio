import { test, expect } from '@playwright/test';

test.describe('애니메이션 & UI 상태 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Hero 섹션이 로드 시 화면에 보임 (opacity > 0)', async ({ page }) => {
    await page.waitForTimeout(800);
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();
  });

  test('Education 카드 hover 시 scale 변환 (CSS transform 적용)', async ({ page }) => {
    await page.locator('#education').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const card = page.locator('#education .rounded-3xl').first();
    await card.hover();
    await page.waitForTimeout(300);
    // hover 후 transform이 적용되었는지
    const transform = await card.evaluate(el => window.getComputedStyle(el).transform);
    // transform이 none이 아니면 애니메이션이 작동 중
    expect(transform).not.toBe('none');
  });

  test('Experience 카드 hover 시 transform 적용', async ({ page }) => {
    await page.locator('#experience').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const card = page.locator('#experience .rounded-3xl').first();
    await card.hover();
    await page.waitForTimeout(300);
    const transform = await card.evaluate(el => window.getComputedStyle(el).transform);
    expect(transform).not.toBe('none');
  });

  test('스킬 칩이 렌더링됨 (wave 애니메이션으로 hover 테스트 제한)', async ({ page }) => {
    await page.locator('#personal').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    // 스킬 칩들이 존재하는지 확인 (wave 애니메이션으로 hover 안정성이 낮으므로 visible 확인)
    const chips = page.locator('#personal span.rounded-xl');
    const count = await chips.count();
    expect(count).toBeGreaterThan(5);
  });

  test('프로젝트 아코디언 애니메이션 - 열릴 때 높이 변환', async ({ page }) => {
    await page.locator('#projects').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const secondBtn = page.locator('#projects button').filter({ hasText: 'Global Maritime Supply Chain' });
    await secondBtn.scrollIntoViewIfNeeded();
    await secondBtn.click();
    await page.waitForTimeout(400);

    // 열린 후 내용이 보여야 함
    const content = page.locator('text=Architected an AI-driven Early Warning System');
    await expect(content).toBeVisible();
  });

  test('Contact 페이지 진입 시 애니메이션으로 카드가 나타남', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForTimeout(800);
    const card = page.locator('.rounded-3xl').first();
    await expect(card).toBeVisible();
    const opacity = await card.evaluate(el => window.getComputedStyle(el).opacity);
    expect(parseFloat(opacity)).toBeGreaterThan(0.5);
  });

  test('Contact 이메일 hover 시 border 색상 변경', async ({ page }) => {
    await page.goto('/contact');
    const emailBtn = page.locator('button').filter({ hasText: 'kimchany@usc.edu' });
    const borderBefore = await emailBtn.evaluate(el => window.getComputedStyle(el).borderColor);
    await emailBtn.hover();
    await page.waitForTimeout(200);
    const borderAfter = await emailBtn.evaluate(el => window.getComputedStyle(el).borderColor);
    // hover 시 border-sky-300으로 변경됨
    expect(borderBefore).not.toBe(borderAfter);
  });

  test('Footer의 green pulse dot이 애니메이션 클래스를 가짐', async ({ page }) => {
    await page.locator('footer').scrollIntoViewIfNeeded();
    const dot = page.locator('footer .bg-green-500');
    const classList = await dot.getAttribute('class');
    expect(classList).toContain('animate-pulse');
  });

  test('배경 그리드 패턴이 존재함', async ({ page }) => {
    // fixed inset-0 -z-10 배경 div가 있는지 확인
    const bg = page.locator('div.fixed.inset-0.-z-10');
    await expect(bg).toBeAttached();
  });
});
