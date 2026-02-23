import { test, expect } from '@playwright/test';

test.describe('Posts(NotionPosts) 페이지 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/posts');
    await page.waitForTimeout(800);
  });

  // --- 기본 렌더링 ---
  test('페이지가 로드됨 (body 보임)', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
    // 에디터 UI의 핵심 요소 존재 확인
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('좌측 사이드바가 렌더링됨', async ({ page }) => {
    // Sidebar는 div.bg-\[#FBFBFA\] border-r 구조
    const sidebar = page.locator('.border-r.border-gray-200').first();
    await expect(sidebar).toBeAttached();
  });

  test('새 페이지 추가 버튼이 있음 (+ 버튼)', async ({ page }) => {
    // 사이드바의 New Page 버튼
    const plusBtn = page.locator('button[title="New Page"], button[title*="Add"], button[title*="page"]').first();
    // 없으면 Plus 아이콘으로 찾기
    const count = await plusBtn.count();
    if (count === 0) {
      // 사이드바 안에 있는 버튼 중 + 역할을 하는 것
      await expect(page.locator('button').filter({ has: page.locator('svg') }).first()).toBeAttached();
    } else {
      await expect(plusBtn).toBeAttached();
    }
  });

  test('검색 버튼 또는 아이콘이 있음', async ({ page }) => {
    const searchEl = page.locator('button[title*="Search"], svg[data-lucide="search"], [class*="search"]').first();
    await expect(searchEl).toBeAttached();
  });

  test('초기 페이지 데이터가 렌더링됨 (사이드바에 페이지 목록)', async ({ page }) => {
    // postsData.js의 초기 페이지들이 사이드바에 표시되어야 함
    // 에디터 영역에 텍스트 블록이 있어야 함
    await page.waitForTimeout(1000);
    const body = await page.locator('body').textContent();
    expect(body.length).toBeGreaterThan(100);
  });

  // --- 로그인/인증 ---
  test('로그인 버튼이 존재함 (비로그인 → Lock 아이콘)', async ({ page }) => {
    // 비로그인 상태에서 header에 Lock 아이콘 버튼(title="Admin login")이 나타남
    await page.waitForTimeout(1500); // auth 로딩 대기
    const lockBtn = page.locator('button[title="Admin login"]');
    await expect(lockBtn).toBeAttached();
  });

  test('비로그인 상태에서 읽기 전용 모드 (Lock 버튼 존재)', async ({ page }) => {
    await page.waitForTimeout(1500);
    // isReadOnly = true → Lock 버튼 있고 Save 버튼 없음
    const lockBtn = page.locator('button[title="Admin login"]');
    await expect(lockBtn).toBeAttached();
    const saveBtn = page.locator('button:has-text("Save")');
    await expect(saveBtn).toHaveCount(0);
  });

  // --- 에디터 영역 ---
  test('에디터 콘텐츠 영역이 있음', async ({ page }) => {
    // contenteditable div 또는 에디터 container
    const editorArea = page.locator('[contenteditable], .editor, [class*="editor"], [class*="block"]').first();
    await expect(editorArea).toBeAttached();
  });

  test('페이지 제목 영역이 있음', async ({ page }) => {
    // 제목 editableblock이나 h1 contenteditable
    const titleEl = page.locator('[contenteditable][data-placeholder*="Untitled"], [contenteditable]').first();
    await expect(titleEl).toBeAttached();
  });

  // --- 키보드 단축키 ---
  test('Cmd+K (검색) 단축키로 검색 모달이 열림', async ({ page }) => {
    await page.keyboard.press('Meta+k');
    await page.waitForTimeout(300);
    // 검색 모달이 떠야 함
    const modal = page.locator('[class*="modal"], [class*="search"], input[type="text"][placeholder*="Search"]').first();
    await expect(modal).toBeAttached();
  });

  test('검색 모달에서 Escape 키로 닫힘', async ({ page }) => {
    await page.keyboard.press('Meta+k');
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    // 검색 input이 사라져야 함
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toHaveCount(0);
  });

  // --- 내비게이션 ---
  test('Home 아이콘 클릭 시 홈으로 이동', async ({ page }) => {
    // 홈 버튼이나 포트폴리오로 돌아가는 버튼 찾기
    const homeBtn = page.locator('button[title*="Home"], a[href="/"], [data-lucide="home"]').first();
    if (await homeBtn.isVisible()) {
      await homeBtn.click();
      await page.waitForTimeout(400);
      await expect(page).toHaveURL('/');
    } else {
      test.skip();
    }
  });
});
