import { test, expect } from '@playwright/test';

test.describe('Contact 페이지 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('"Let\'s Connect" 헤딩이 있음', async ({ page }) => {
    await expect(page.locator('h1')).toContainText("Let's Connect");
  });

  test('소개 텍스트가 있음', async ({ page }) => {
    await expect(page.locator('text=Looking for data engineering roles')).toBeVisible();
  });

  test('이메일 버튼이 표시됨', async ({ page }) => {
    await expect(page.locator('button:has-text("kimchany@usc.edu")')).toBeVisible();
  });

  test('이메일 복사 버튼 클릭 시 "Copied!" 표시', async ({ page }) => {
    // 클립보드 권한 부여
    await page.context().grantPermissions(['clipboard-write', 'clipboard-read']);
    const emailBtn = page.locator('button').filter({ hasText: 'kimchany@usc.edu' });
    await emailBtn.click();
    await expect(page.locator('text=Copied!')).toBeVisible();
  });

  test('"Copied!" 2초 후 사라짐', async ({ page }) => {
    await page.context().grantPermissions(['clipboard-write', 'clipboard-read']);
    const emailBtn = page.locator('button').filter({ hasText: 'kimchany@usc.edu' });
    await emailBtn.click();
    await expect(page.locator('text=Copied!')).toBeVisible();
    await page.waitForTimeout(2200);
    await expect(page.locator('text=Copied!')).toHaveCount(0);
  });

  test('LinkedIn 링크가 표시됨', async ({ page }) => {
    const linkedinLink = page.locator('a[href*="linkedin.com"]');
    await expect(linkedinLink).toBeVisible();
    await expect(linkedinLink).toContainText('Chanyoung Kim');
  });

  test('LinkedIn 링크가 새 탭으로 열림', async ({ page }) => {
    const linkedinLink = page.locator('a[href*="linkedin.com"]');
    expect(await linkedinLink.getAttribute('target')).toBe('_blank');
  });

  test('GitHub 링크가 표시됨', async ({ page }) => {
    const githubLink = page.locator('a[href*="github.com"]');
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toContainText('KHUCHAN');
  });

  test('GitHub 링크가 올바른 URL을 가짐', async ({ page }) => {
    const githubLink = page.locator('a[href*="github.com"]');
    const href = await githubLink.getAttribute('href');
    expect(href).toContain('github.com/KHUCHAN');
  });

  test('GitHub 링크가 새 탭으로 열림', async ({ page }) => {
    const githubLink = page.locator('a[href*="github.com"]');
    expect(await githubLink.getAttribute('target')).toBe('_blank');
  });

  test('위치 "Los Angeles, CA"가 표시됨', async ({ page }) => {
    await expect(page.locator('text=Los Angeles, CA')).toBeVisible();
  });

  test('"Back to Portfolio" 버튼이 있음', async ({ page }) => {
    await expect(page.locator('button:has-text("Back to Portfolio")')).toBeVisible();
  });

  test('"Back to Portfolio" 클릭 시 홈으로 이동', async ({ page }) => {
    await page.locator('button:has-text("Back to Portfolio")').click();
    await expect(page).toHaveURL('/');
  });

  test('컬러 그라디언트 상단 바가 있음', async ({ page }) => {
    const bar = page.locator('.bg-gradient-to-r').first();
    await expect(bar).toBeAttached();
  });
});
