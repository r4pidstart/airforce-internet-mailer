module.exports = sendMail;
const puppeteer = require("puppeteer");
const rw = require("./readFile.js");

// 훈련생 정보
const soldierName = rw.readSettings("soldierName");
const soldierBirthday = rw.readSettings("soldierBirthday");

// 보내는 사람 정보
const userName = rw.readSettings("userName");
const userRelationship = rw.readSettings("userRelationship");
const userZipcode = rw.readSettings("userZipcode");
const userAddress = rw.readSettings("userAddress");
const pw = rw.readSettings("userPassword");

// 0: 기본군사훈련단, 1: 군수1학교, 3: 군수2학교, 4: 정보통신학교, 5:행정학교, 6: 방공포병학교
const urlNumber = rw.readSettings("mailTarget");
const urls = [
    "https://www.airforce.mil.kr/user/indexSub.action?codyMenuSeq=156893223&siteId=last2", // 기본군사훈련단
    "http://airforce.mil.kr:8081/user/indexSub.action?codyMenuSeq=157620025&siteId=gisool2&menuUIType=sub", // 군수1학교
    "http://airforce.mil.kr:8081/user/indexSub.action?codyMenuSeq=157615558&siteId=gunsu&menuUIType=sub", // 군수2학교
    "https://www.airforce.mil.kr/user/indexSub.action?codyMenuSeq=156894686&siteId=tong-new&menuUIType=sub", // 정보통신학교
    "http://airforce.mil.kr:8081/user/indexSub.action?codyMenuSeq=159014200&siteId=haengjeong&menuUIType=sub", // 행정학교
    "http://airforce.mil.kr:8081/user/indexSub.action?codyMenuSeq=158327574&siteId=bangpogyo&menuUIType=sub" // 방공포병학교
];


async function sendMail(title, contents) {
    const args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
    ];
    
    const options = {
        args,
        headless: true,
        ignoreHTTPSErrors: true,
    };
    
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    const nav = new Promise(res => browser.on('targetcreated', res));
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(urls[urlNumber]);

    console.log(title + " 작성");
    
    // 훈련생 정보 입력
    await page.type("#searchName", soldierName);
    await page.type("#birthYear", soldierBirthday.year);
    await page.type("#birthMonth", soldierBirthday.month);
    await page.type("#birthDay", soldierBirthday.day);
    
    await page.waitForTimeout(100);
    await page.click("#btnNext");
    await nav
    let pages = await browser.pages();
    await pages[2].waitForSelector(".choice");
    await pages[2].click(".choice");
    await page.click("#btnNext");
    
    // 편지 쓰기
    await page.waitForSelector("div.UIbtn > span > input");
    await page.click("div.UIbtn > span > input");
    
    // 주소 입력
    await page.waitForSelector("#senderZipCode");
    await page.$eval("#senderZipCode", (el, userZipcode) => el.value=userZipcode, userZipcode); // 우편번호
    await page.$eval("#senderAddr1", (el, userAddress) => el.value=userAddress, userAddress); // 주소 1
    await page.$eval("#senderAddr2", el => el.value="."); // 주소 2
    await page.$eval("#senderName", (el, userName) => el.value=userName, userName); // 보내는 사람
    await page.$eval("#relationship", (el, userRelationship) => el.value=userRelationship, userRelationship); // 관계

    // 내용 입력
    await page.evaluate(({title, contents, pw}) => {
        document.querySelector("#title").value = title;
        document.querySelector("#contents").value = contents.join('');
        document.querySelector("#password").value = pw;
    }, {title, contents, pw});
    
    // 발송
    await page.click(".submit");

    // await page.waitForNavigation(); -> Navitagion Timeout?
    await page.waitForSelector(".message");
    let checkSuccess = await page.$eval(".message", el => el.innerText);
    if(checkSuccess == "정상적으로 등록되었습니다.") {
        await browser.close();
        return 0;
    }
    else {
        await browser.close();
        throw new Error("비정상 등록");
    }
};
