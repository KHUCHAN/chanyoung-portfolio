import { test, expect } from '@playwright/test';

test.describe('반응형 레이아웃 테스트', () => {

  test('모바일(375px) - 홈 페이지 정상 렌더링', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Chanyoung Kim');
  });

  test('모바일(375px) - Hero 제목 표시', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('p:has-text("AI/Data Engineer")')).toBeVisible();
  });

  test('모바일(375px) - Education 카드 스택 렌더링', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.locator('#education').scrollIntoViewIfNeeded();
    await expect(page.locator('text=University of Southern California')).toBeVisible();
  });

  test('모바일(375px) - Navbar 내부 메뉴 숨겨짐', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const navMenu = page.locator('nav .hidden.md\\:flex');
    await expect(navMenu).toBeHidden();
  });

  test('태블릿(768px) - 홈 페이지 정상 렌더링', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Chanyoung Kim');
  });

  test('데스크톱(1280px) - 전체 Navbar 메뉴 보임', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(page.locator('nav .hidden.md\\:flex')).toBeVisible();
  });

  test('데스크톱(1280px) - Hero 아바타 영역 보임', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    // lg:block 클래스 - 데스크톱에서만 보임
    const avatarSection = page.locator('.hidden.lg\\:block');
    await expect(avatarSection).toBeVisible();
  });

  test('모바일(375px) - Hero 아바타 영역 숨겨짐', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const avatarSection = page.locator('.hidden.lg\\:block');
    await expect(avatarSection).toBeHidden();
  });

  test('모바일 - Contact 페이지 정상 렌더링', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/contact');
    await expect(page.locator('h1')).toContainText("Let's Connect");
    await expect(page.locator('button').filter({ hasText: 'kimchany@usc.edu' })).toBeVisible();
  });

  test('모바일 - Projects 아코디언 정상 작동', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.locator('#projects').scrollIntoViewIfNeeded();
    const btn = page.locator('#projects button').filter({ hasText: 'Global Maritime Supply Chain' });
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForTimeout(400);
    await expect(page.locator('text=Architected an AI-driven Early Warning System')).toBeVisible();
  });
});
