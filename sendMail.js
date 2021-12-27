// 훈련생 정보
const soldierName="";
const soldierBirthday={year:"2000", month:"04", day:"27"};

const puppeteer = require("puppeteer");
(async () =>
{
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    // 공군 기본군사훈련단
    await page.goto("https://www.airforce.mil.kr/user/indexSub.action?codyMenuSeq=156893223&siteId=last2");
    
    // 훈련생 정보 입력
    await page.type("#searchName", soldierName);
    await page.type("#birthYear", soldierBirthday.year);
    await page.type("#birthMonth", soldierBirthday.month);
    await page.type("#birthDay", soldierBirthday.day);
    const nav = new Promise(res => browser.on('targetcreated', res))
    await page.click("#btnNext");
    await nav
    const pages = await browser.pages();
    await pages[2].waitForSelector(".choice");
    await pages[2].click(".choice");
    await page.click("#btnNext");

})();