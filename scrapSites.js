// exports.giggleHW = scrapGiggleHW;
exports.DCsff = scrapDCsff;
exports.stock = scrapStock;

const rw = require("./readFile.js");
const puppeteer = require("puppeteer");
const main = require("./main.js");
const sendMail = require("./sendMail.js");
let lastIds;

async function getLastPostId(siteName) {
    lastIds = rw.readId();
    if(!lastIds.hasOwnProperty(siteName)) {
        lastIds[siteName]=0;
        rw.writeId(lastIds);
    }
    return lastIds[siteName];
}

// async function scrapGiggleHW() {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto("");
// }

async function scrapDCsff() {
    const siteName = "DCsff"
    let lastPostedId = await getLastPostId(siteName);
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
    await page.setViewport({ width: 1280, height: 720 });
    page.setDefaultTimeout(0x7FFFFFFF);
    page.goto("https://gall.dcinside.com/mgallery/board/lists?id=sff&exception_mode=recommend");
    await page.waitForSelector("tbody");
    const link = "https://gall.dcinside.com/mgallery/board/view/?id=sff&no=";
    
    // get post list
    const postList = await page.evaluate(() => {
        let posts = [];
        const tbody = document.querySelector("tbody").children;

        for(let i=1; i<tbody.length; i++)
            posts.push(tbody[i].querySelector("td.gall_num").innerText);
        return posts;
    });

    for(let i=postList.length-1; i>=0; i--) {
        if(lastPostedId < postList[i]) {
            lastPostedId=postList[i];
            page.goto(link+postList[i]);
            await page.waitForSelector("span.title_subject");
            let mailTitle = await page.evaluate(() => {
                return "sff / " + document.querySelector("span.gall_date").innerText + " <---본문---> "; 
            });
            let mailContents = await page.evaluate(() => {

                async function getDCComments(container, elem) {
                    container.push(elem.querySelector("span.nickname").innerText + " // ");
                    try {
                        container.push(elem.querySelector("p.usertxt").innerText + " <-개행-> ");
                    }
                    catch {
                        container.push("디씨콘 (" + elem.querySelector("span.over_alt").innerText + ") <-개행-> ");
                    }
                }
                
                let mailContents = [];
                try {
                    mailContents.push("sff / " + document.querySelector("span.title_subject").innerText + " / " + document.querySelectorAll("span.nickname.in > em").innerText + " / " + document.querySelector("span.gall_date").innerText);
                    
                    // const mainBody = document.querySelector("div.write_div").children;
                    for(let i=0; i<document.querySelector("div.write_div").children.length; i++)
                        mailContents.push(document.querySelector("div.write_div").children[i].innerText + " <-개행-> ");
    
                    mailContents.push("<---- 댓글 ----> ");
                    // const commentsBody = document.querySelector("ul.cmt_list").children;
    
                    for(let i=0; i<document.querySelector("ul.cmt_list").children.length; i++){
                        if(document.querySelector("ul.cmt_list").children[i].classList.contains("dory")) continue; // 광고?
                        else if(document.querySelector("ul.cmt_list").children[i].classList.contains("ub-content")) {
                            getDCComments(mailContents, document.querySelector("ul.cmt_list").children[i]);
                        }
                        else if(document.querySelector("ul.cmt_list").children[i].classList.length == 0) {
                            // const replyBody = document.querySelector("ul.cmt_list").children[i].querySelector("ul.reply_list").children;
    
                            mailContents.push(" <- 리플 -> ");
                            for(let j=0; j<document.querySelector("ul.cmt_list").children[i].querySelector("ul.reply_list").children.length; j++) {
                                getDCComments(mailContents, document.querySelector("ul.cmt_list").children[i].querySelector("ul.reply_list").children[j]);
                            }
                            mailContents.push(" <- /리플 -> ");
                        }
                    }
                }
                catch {}

                return mailContents; 
            });
            await main.trySendMail(mailTitle, mailContents);
            console.log(mailTitle, mailContents, lastPostedId);
            lastIds[siteName]=lastPostedId;
            rw.writeId(lastIds);
        }
    }
    await page.evaluate(() => window.stop());
    await browser.close();
}

async function scrapStock() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("");
}

scrapDCsff();