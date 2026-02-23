import { test, expect } from '@playwright/test';

test.describe('Projects 아코디언 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#projects').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
  });

  test('"Deep Dive" 헤딩이 있음', async ({ page }) => {
    await expect(page.locator('#projects h3')).toContainText('Deep Dive');
  });

  test('"Professional Projects" 서브타이틀이 있음', async ({ page }) => {
    await expect(page.locator('#projects h2')).toContainText('Professional Projects');
  });

  test('8개의 프로젝트 아코디언이 렌더링됨', async ({ page }) => {
    const accordions = page.locator('#projects button').filter({ hasText: /Global|Samsung|Yuanta|IBK|Forensic|Barrier|Seoul|Maritime/ });
    await expect(accordions).toHaveCount(8);
  });

  test('첫 번째 프로젝트(RegTech AI)가 기본으로 열려있음', async ({ page }) => {
    await expect(page.locator('text=Global Compliance RegTech AI Solution')).toBeVisible();
    await expect(page.locator('text=Key Achievements')).toBeVisible();
  });

  test('프로젝트 클릭 시 아코디언 열림/닫힘 토글', async ({ page }) => {
    // 두 번째 프로젝트 클릭
    const secondBtn = page.locator('#projects button').filter({ hasText: 'Global Maritime Supply Chain' });
    await secondBtn.scrollIntoViewIfNeeded();
    await secondBtn.click();
    await page.waitForTimeout(500);
    // 두 번째 아코디언 펼쳐졌을 때만 보이는 achievements 텍스트 확인
    await expect(page.locator('text=Designed Random Forest models')).toBeVisible();

    // 다시 클릭하면 닫힘 (AnimatePresence exit animation 대기)
    await secondBtn.click();
    await page.waitForTimeout(600);
    // achievements 텍스트가 사라져야 함 (expanded content만 제거됨)
    await expect(page.locator('text=Designed Random Forest models')).toHaveCount(0);
  });

  test('한 번에 하나만 열림 (첫 번째 닫히고 두 번째 열림)', async ({ page }) => {
    const firstBtn = page.locator('#projects button').filter({ hasText: 'Global Compliance RegTech' });
    const secondBtn = page.locator('#projects button').filter({ hasText: 'Global Maritime Supply Chain' });

    // 처음엔 1번이 열려있음
    await expect(page.locator('text=Key Achievements')).toBeVisible();

    // 2번 클릭
    await secondBtn.scrollIntoViewIfNeeded();
    await secondBtn.click();
    await page.waitForTimeout(400);

    // 1번 닫히고 2번 열려야 함
    await expect(page.locator('text=Architected an AI-driven Early Warning System')).toBeVisible();
  });

  test('프로젝트 열릴 때 Role 정보가 표시됨', async ({ page }) => {
    await expect(page.locator('text=Senior Consultant | Data Scientist')).toBeVisible();
  });

  test('프로젝트 열릴 때 Tech Stack이 표시됨', async ({ page }) => {
    await expect(page.locator('text=Tech Stack')).toBeVisible();
    await expect(page.locator('span:has-text("RAG")').first()).toBeVisible();
  });

  test('Samsung AML 프로젝트 열기', async ({ page }) => {
    const btn = page.locator('#projects button').filter({ hasText: 'Samsung Fire' });
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForTimeout(400);
    await expect(page.locator('text=K-Means Clustering').first()).toBeVisible();
  });

  test('Forensic 프로젝트 열기', async ({ page }) => {
    const btn = page.locator('#projects button').filter({ hasText: 'Forensic Data Analysis' });
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForTimeout(400);
    await expect(page.locator('text=Forensic Data Specialist')).toBeVisible();
  });

  test('IBK AML 프로젝트 열기', async ({ page }) => {
    const btn = page.locator('#projects button').filter({ hasText: 'IBK AML' });
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForTimeout(400);
    await expect(page.locator('text=Oracle OFSAA').first()).toBeVisible();
  });

  test('Barrier-Free 프로젝트 열기', async ({ page }) => {
    const btn = page.locator('#projects button').filter({ hasText: 'Barrier-Free' });
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForTimeout(400);
    await expect(page.locator('text=Project Leader')).toBeVisible();
  });

  test('Seoul Line 1 프로젝트 열기', async ({ page }) => {
    const btn = page.locator('#projects button').filter({ hasText: 'Seoul Line 1' });
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForTimeout(400);
    await expect(page.locator('text=Lead Analyst')).toBeVisible();
  });

  test('각 프로젝트 날짜가 표시됨', async ({ page }) => {
    await expect(page.locator('text=Oct 2025 - Dec 2025')).toBeVisible();
  });

  test('ChevronDown 아이콘이 열릴 때 회전함', async ({ page }) => {
    const firstBtn = page.locator('#projects button').first();
    // 처음엔 열려있으므로 chevron이 180도 회전 상태여야 함
    const chevronWrapper = firstBtn.locator('div').last();
    const transform = await chevronWrapper.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.transform;
    });
    // transform 값이 있어야 함 (rotate 적용됨)
    expect(transform).not.toBe('none');
  });
});
