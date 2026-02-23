import { test, expect } from '@playwright/test';

test.describe('Navbar 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Navbar가 페이지에 존재함', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible();
  });

  test('Personal 링크가 있음', async ({ page }) => {
    await expect(page.locator('a[href="#personal"]')).toBeVisible();
  });

  test('Professional Projects 링크가 있음', async ({ page }) => {
    // Navbar 안의 #projects 링크 (Hero의 View Projects와 구분)
    await expect(page.locator('nav a[href="#projects"]')).toBeVisible();
  });

  test('Technical Posts 링크가 있음 (React Router Link)', async ({ page }) => {
    await expect(page.locator('a[href="/posts"]')).toBeVisible();
  });

  test('Contact Me 버튼이 있음', async ({ page }) => {
    await expect(page.locator('a[href="#contact"]')).toBeVisible();
    await expect(page.locator('a[href="#contact"]')).toContainText('Contact Me');
  });

  test('로고 이미지(photo.jpg) 또는 아바타가 있음', async ({ page }) => {
    const logo = page.locator('nav img[alt="Logo"]');
    await expect(logo).toBeVisible();
  });

  test('스크롤 전 Navbar는 투명 배경', async ({ page }) => {
    const nav = page.locator('nav');
    // 스크롤 전: bg-transparent
    const classList = await nav.getAttribute('class');
    expect(classList).not.toContain('bg-white');
  });

  test('스크롤 후 Navbar에 배경이 생김', async ({ page }) => {
    // mouse.wheel은 scroll 이벤트를 확실히 트리거함
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(800);
    const nav = page.locator('nav');
    const classList = await nav.getAttribute('class');
    // scrolled=true 시 bg-white/70 backdrop-blur-md 적용
    expect(classList).toMatch(/bg-white|backdrop-blur|shadow/);
  });

  test('모바일 뷰포트에서 내부 메뉴가 숨겨짐', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    // md:flex 이므로 모바일에서는 hidden
    const menuDiv = page.locator('nav .hidden.md\\:flex');
    await expect(menuDiv).toBeHidden();
  });

  test('데스크톱 뷰포트에서 내부 메뉴가 보임', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const menuDiv = page.locator('nav .hidden.md\\:flex');
    await expect(menuDiv).toBeVisible();
  });
});
