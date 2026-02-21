const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({width: 1200, height: 800});
    await page.goto('https://en.wikipedia.org/wiki/Kyung_Hee_University', { waitUntil: 'networkidle2' });
    const el = await page.$('.infobox-image img');
    if (el) {
        await el.screenshot({path: 'public/kyunghee_logo.png', omitBackground: true});
        console.log('Saved success!');
    } else {
        console.log('Element not found!');
    }
    await browser.close();
})();
