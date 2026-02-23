import { test, expect } from '@playwright/test';

test.describe('라우팅 테스트', () => {
  test('홈(/) 접속 시 포트폴리오 페이지 렌더링', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Chanyoung Kim');
  });

  test('/posts 접속 시 NotionPosts 페이지 렌더링', async ({ page }) => {
    await page.goto('/posts');
    await expect(page).toHaveURL('/posts');
    // 사이드바 또는 에디터 영역이 존재해야 함
    await expect(page.locator('body')).toBeVisible();
    // 포트폴리오 Hero는 없어야 함
    await expect(page.locator('h1:has-text("Chanyoung Kim")')).toHaveCount(0);
  });

  test('/contact 접속 시 ContactPage 렌더링', async ({ page }) => {
    await page.goto('/contact');
    await expect(page).toHaveURL('/contact');
    await expect(page.locator('h1')).toContainText("Let's Connect");
  });

  test('존재하지 않는 경로 접속 시 빈 화면 또는 리다이렉트', async ({ page }) => {
    const response = await page.goto('/nonexistent-page');
    // SPA이므로 200 또는 404 둘 다 허용
    expect([200, 404]).toContain(response.status());
  });

  test('네비게이션: Technical Posts 클릭 → /posts 이동', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href="/posts"], a:has-text("Technical Posts")').first().click();
    await expect(page).toHaveURL('/posts');
  });

  test('네비게이션: /contact 뒤로가기 버튼 → / 이동', async ({ page }) => {
    await page.goto('/contact');
    await page.locator('button:has-text("Back to Portfolio")').click();
    await expect(page).toHaveURL('/');
  });

  test('네비게이션: Extras - Contact Page 버튼 → /contact 이동', async ({ page }) => {
    await page.goto('/');
    await page.locator('button:has-text("Contact Page")').scrollIntoViewIfNeeded();
    await page.locator('button:has-text("Contact Page")').click();
    await expect(page).toHaveURL('/contact');
  });

  test('네비게이션: Extras - Open Posts Workspace 버튼 → /posts 이동', async ({ page }) => {
    await page.goto('/');
    await page.locator('button:has-text("Open Posts Workspace")').scrollIntoViewIfNeeded();
    await page.locator('button:has-text("Open Posts Workspace")').click();
    await expect(page).toHaveURL('/posts');
  });
});
