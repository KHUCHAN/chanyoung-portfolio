import { test, expect } from '@playwright/test';

test.describe('Extras 섹션 & Footer 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#extras').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
  });

  test('"Quick Access" 헤딩이 있음', async ({ page }) => {
    await expect(page.locator('#extras h3')).toContainText('Quick Access');
  });

  test('"Extras" 서브타이틀이 있음', async ({ page }) => {
    await expect(page.locator('#extras h2')).toContainText('Extras');
  });

  test('Contact Page 카드가 있음', async ({ page }) => {
    await expect(page.locator('h4:has-text("Contact Page")')).toBeVisible();
  });

  test('Open Posts Workspace 카드가 있음', async ({ page }) => {
    await expect(page.locator('h4:has-text("Open Posts Workspace")')).toBeVisible();
  });

  test('LinkedIn Profile 카드가 있음', async ({ page }) => {
    await expect(page.locator('h4:has-text("LinkedIn Profile")')).toBeVisible();
  });

  test('LinkedIn Profile 링크가 올바른 URL을 가짐', async ({ page }) => {
    const linkedinLink = page.locator('a[href*="linkedin.com"]').last();
    const href = await linkedinLink.getAttribute('href');
    expect(href).toContain('linkedin.com/in/chanyoung-kim');
  });

  test('LinkedIn Profile이 새 탭으로 열림', async ({ page }) => {
    const linkedinLink = page.locator('a[href*="linkedin.com"]').last();
    const target = await linkedinLink.getAttribute('target');
    expect(target).toBe('_blank');
  });

  // Footer 테스트
  test('Footer가 존재함', async ({ page }) => {
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('저작권 텍스트가 표시됨', async ({ page }) => {
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expect(page.locator('footer')).toContainText('Chanyoung Kim');
    await expect(page.locator('footer')).toContainText('2026');
  });

  test('"System Online" 인디케이터가 표시됨', async ({ page }) => {
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expect(page.locator('text=System Online')).toBeVisible();
  });

  test('Green pulse dot이 존재함', async ({ page }) => {
    await page.locator('footer').scrollIntoViewIfNeeded();
    const dot = page.locator('footer .bg-green-500');
    await expect(dot).toBeVisible();
  });

  test('Footer에 id="contact"가 있음', async ({ page }) => {
    const footer = page.locator('footer#contact');
    await expect(footer).toBeAttached();
  });

  test('Contact Me 버튼 클릭 시 Footer로 스크롤', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href="#contact"]:has-text("Contact Me")').click();
    await page.waitForTimeout(600);
    const footer = page.locator('footer#contact');
    const isVisible = await footer.isVisible();
    expect(isVisible).toBeTruthy();
  });
});
