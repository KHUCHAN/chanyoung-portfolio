import { test, expect } from '@playwright/test';

test.describe('Hero 섹션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('이름 "Chanyoung Kim" 표시', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Chanyoung Kim');
  });

  test('인사말 "Hey, I\'m" 표시', async ({ page }) => {
    await expect(page.locator('h1')).toContainText("Hey, I'm");
  });

  test('직책 설명 표시', async ({ page }) => {
    await expect(page.locator('p:has-text("AI/Data Engineer")')).toBeVisible();
    await expect(page.locator('p:has-text("Finance & Business")')).toBeVisible();
  });

  test('"System Operational" 배지 표시', async ({ page }) => {
    // inline-flex 배지 요소를 정확히 지정
    await expect(page.locator('.inline-flex:has-text("System Operational")')).toBeVisible();
  });

  test('View LinkedIn 버튼이 올바른 URL을 가짐', async ({ page }) => {
    const linkedinBtn = page.locator('a:has-text("View LinkedIn")').first();
    await expect(linkedinBtn).toBeVisible();
    const href = await linkedinBtn.getAttribute('href');
    expect(href).toContain('linkedin.com/in/chanyoung-kim');
  });

  test('View LinkedIn 버튼이 새 탭으로 열림', async ({ page }) => {
    const linkedinBtn = page.locator('a:has-text("View LinkedIn")').first();
    const target = await linkedinBtn.getAttribute('target');
    expect(target).toBe('_blank');
  });

  test('View Projects 버튼이 #projects 앵커를 가짐', async ({ page }) => {
    const projectsBtn = page.locator('a[href="#projects"]:has-text("View Projects")');
    await expect(projectsBtn).toBeVisible();
  });

  test('아바타 이미지가 렌더링됨', async ({ page }) => {
    // Hero 내 motion div 안에 img
    const avatar = page.locator('img[alt="Chanyoung Kim"]');
    await expect(avatar).toBeAttached();
  });

  test('Hero 섹션이 화면 높이를 충분히 차지함', async ({ page }) => {
    const hero = page.locator('section').first();
    const box = await hero.boundingBox();
    expect(box.height).toBeGreaterThan(400);
  });
});
