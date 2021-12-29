// 훈련생 정보
const soldierName="";
const soldierBirthday={year:"2000", month:"04", day:"27"};

const puppeteer = require("puppeteer");
(async () =>
{
    const browser = await puppeteer.launch({
        headless: false, ignoreHTTPSErrors: true, args: ["--ignore-certificate-errors"],});
    const page = await browser.newPage();
    let pages;
    const nav = new Promise(res => browser.on('targetcreated', res));
    await page.setViewport({ width: 1280, height: 720 });
    
    // 공군 기본군사훈련단
    await page.goto("https://www.airforce.mil.kr/user/indexSub.action?codyMenuSeq=156893223&siteId=last2");
    
    // 훈련생 정보 입력
    await page.type("#birthYear", soldierBirthday.year);
    await page.type("#birthMonth", soldierBirthday.month);
    await page.type("#birthDay", soldierBirthday.day);
    await page.type("#searchName", soldierName);

    await page.waitForTimeout(100);
    await page.click("#btnNext");
    await nav
    pages = await browser.pages();
    await pages[2].waitForSelector(".choice");
    await pages[2].click(".choice");
    await page.click("#btnNext");

    // 편지 쓰기
    await page.waitForSelector("div.UIbtn > span > input");
    await page.click("div.UIbtn > span > input");
    
    // 주소 입력
    await page.waitForSelector("#senderZipCode");
    await page.$eval("#senderZipCode", el => el.value="03048"); // 우편번호
    await page.$eval("#senderAddr1", el => el.value="서울특별시 종로구 청와대로 1"); // 주소 1
    await page.$eval("#senderAddr2", el => el.value="."); // 주소 2
    await page.$eval("#senderName", el => el.value="정보봇"); // 보내는 사람
    await page.$eval("#relationship", el => el.value="몰?루"); // 관계

    // 내용 입력
    await page.$eval("#title", el => el.value=""); // 제목
    await page.$eval("#contents", el => el.value=""); // 내용
    await page.$eval("#password", el => el.value="defaultpw"); // 비밀번호

    // 발송
    await page.click("#submit");
})();