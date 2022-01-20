exports.DC = checkDCgallery;
exports.stock = scrapStocksUsingApi;

const puppeteer = require("puppeteer");
const axios = require("axios").default;
const rw = require("./readFile.js");
const main = require("./main.js");

const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));
let lastIds;

async function getLastPostId(siteName) {
    lastIds = rw.readId();
    if(!lastIds.hasOwnProperty(siteName)) {
        lastIds[siteName]=0;
        rw.writeId(lastIds);
    }
    return lastIds[siteName];
}

async function checkDCgallery() {
    const galleryList = rw.readSettings("galleryList");
    for(let i=0; i<galleryList.length; i++)
        await scrapDCgallery(galleryList[i]);
}

async function scrapDCgallery(galleryLink) {
    const nowTime = new Date();
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
    page.goto(galleryLink + "&exception_mode=recommend");
    await page.waitForSelector("tbody");
    const link = "https://gall.dcinside.com/" + galleryLink.split("?id=")[1] + "/";
    
    const siteName = await page.evaluate(() => {
        return document.querySelector("div.fl.clear > h2 > a").innerText;
    });
    let lastPostedId = await getLastPostId(siteName);
    console.log(('0' + nowTime.getHours()).slice(-2) + ':' + ('0' + nowTime.getMinutes()).slice(-2) + ':' + ('0' + nowTime.getMinutes()).slice(-2), siteName + " scrap");

    // get post list
    const postList = await page.evaluate(() => {
        let posts = [];
        const tbody = document.querySelector("tbody").children;

        for(let i=1; i<tbody.length; i++)
            posts.push(tbody[i].querySelector("td.gall_num").innerText);
        return posts;
    });

    for(let i=postList.length-40; i>=0; i--) {
        if(parseInt(lastPostedId) < parseInt(postList[i])) {
            lastPostedId=postList[i];
            console.log(siteName + " / " +postList[i] + "번 게시물");
            page.goto(link+postList[i]);
            await page.waitForSelector("span.title_subject");

            let mailTitle = await page.evaluate(() => {
                return document.querySelector("div.fl.clear > h2 > a").innerText + " / " + document.querySelector("span.gall_date").innerText; 
            }) +  " / " + postList[i];

            let mailContents = await page.evaluate(async () => {

                async function getDCComments(container, elem) {
                    container.push(elem.querySelector("span.nickname").innerText + " // ");
                    try {
                        container.push(elem.querySelector("p.usertxt").innerText + " ---- ");
                    }
                    catch {
                        container.push("디씨콘 (" + elem.querySelector("span.over_alt").innerText + ") ---- ");
                    }
                }
                
                let mailContents = [];
                try {
                    let lst;
                    await new Promise(resolve => {
                        let ret = [];
                        ret.push(document.querySelector("div.fl.clear > h2 > a").innerText);
                        ret.push(document.querySelector("span.title_subject").innerText);
                        ret.push(document.querySelector("span.nickname.in > em").innerText);
                        ret.push(document.querySelector("span.gall_date").innerText);
                        ret.push(document.querySelector("div.write_div").children);
                        ret.push(document.querySelector("ul.cmt_list").children);
                        resolve(ret);
                    }).then(res => lst=res);
                    const [galleryName, postName, postWriter, postDate, mainBody, commentsBody] = lst;
                    
                    mailContents.push(`${galleryName} / ${postName} / ${postWriter} / ${postDate}`);

                    mailContents.push(" ---본문--- ");
                    for(let i=0; i<mainBody.length; i++)
                        mailContents.push(mainBody[i].innerText + " ");
    
                    mailContents.push("---- 댓글 ---- ");
                    for(let i=0; i<commentsBody.length; i++){
                        if(commentsBody[i].classList.contains("dory")) continue; // 광고?
                        else if(commentsBody[i].classList.contains("ub-content")) {
                            getDCComments(mailContents, commentsBody[i]);
                        }
                        else if(commentsBody[i].classList.length == 0) {
                            mailContents.push(" - 리플 - ");
                            for(let j=0; j<commentsBody[i].querySelector("ul.reply_list").children.length; j++) {
                                await getDCComments(mailContents, commentsBody[i].querySelector("ul.reply_list").children[j]);
                            }
                            mailContents.push(" - /리플 - ");
                        }
                    }
                }
                catch(e) {console.log(e)};

                return mailContents; 
            });
            await main.trySendMail(mailTitle, mailContents);
            lastIds[siteName]=lastPostedId;
            rw.writeId(lastIds);
        }
    }
    await page.evaluate(() => window.stop());
    await browser.close();
}

async function scrapStocksUsingApi(region) {
    
    if(rw.readSettings("yahooFinanceAPIKey") == "") return;

    function axiosOptions(userUrl) {
        const apiKey = rw.readSettings("yahooFinanceAPIKey");
        const ret = {
            method : "GET",
            url : userUrl,
            params : {modules: "defaultKeyStatistics,assetProfile"},
            headers : {
                "x-api-key" : apiKey
            }
        };
        return ret;
    }

    function parseSummaryContents(container, elem) {
        for(let i=0; i<elem.length; i++) {
            container.push(" ------- ");

            const type = elem[i]["quoteType"];
            const shortName = elem[i]["shortName"]; // only index, currency, future
            const symbol = elem[i]["symbol"]; // only cryptocurrency
            const marketPrice = elem[i]["regularMarketPrice"]["fmt"];
            const marketChange = elem[i]["regularMarketChangePercent"]["fmt"];

            if(type == "INDEX" || type == "CURRENCY") {
                container.push(`[ ${shortName} ] - ${marketPrice} / ${marketChange}`);
            }
            else if(type == "FUTURE") {
                container.push(`[ ${shortName} ] - $${marketPrice} / ${marketChange}`);
            }
            else if(type == "CRYPTOCURRENCY") {
                container.push(`[ ${symbol} ] - ${marketPrice} / ${marketChange}`)
            }
        }   
    }

    function parseStockContents(container, elem) {
        for(let i=0; i<elem.length; i++) {
            container.push(" ------- ");

            const type = elem[i]["quoteType"]
            const shortName = elem[i]["shortName"];
            const longName = elem[i]["longName"]; // only ETF
            const symbol = elem[i]["symbol"];
            const marketPrice = elem[i]["regularMarketPrice"];
            const marketChange = parseFloat(elem[i]["regularMarketChangePercent"]).toFixed(2);
            const dayRange = elem[i]["regularMarketDayRange"];
            const fiftyTwoWeekRange = elem[i]["fiftyTwoWeekRange"];

            if(type == "INDEX" || type == "CURRENCY") {
                container.push(`[ ${shortName} ] (${symbol}) ] - ${marketPrice} / ${marketChange}% / Day range : ${dayRange} / 52-Week range : ${fiftyTwoWeekRange}`);
            }
            else if(type == "CRYPTOCURRENCY" || type == "EQUITY" || type == "FUTURE") {
                container.push(`[ ${shortName} ] (${symbol}) ] - $${marketPrice} / ${marketChange}% / Day range : ${dayRange} / 52-Week range : ${fiftyTwoWeekRange}`);
            }
            else if(type == "ETF") {
                container.push(`[ ${longName} ] (${symbol}) ] - ${marketPrice} / ${marketChange}% / Day range : ${dayRange} / 52-Week range : ${fiftyTwoWeekRange}`);
            }
        }   
    }

    const customStocksUrl = "https://yfapi.net/v6/finance/quote?region=US&lang=en&symbols=" + rw.readSettings(`${region}stockList`);
    const marketSummaryUrl = "https://yfapi.net/v6/finance/quote/marketSummary?lang=en&region=US";
    const nowTime = new Date();
    const mailTitle = `${nowTime.getFullYear()}/${('0'+(nowTime.getMonth()+1)).slice(-2)}/${('0' + nowTime.getDate()).slice(-2)} ${('0' + nowTime.getHours()).slice(-2)}:${('0' + nowTime.getMinutes()).slice(-2)} - 이 시각 ${region}증권시장`;
    let mailContents = [];
    let marketSummary, customStocks;
    
    if(region == "US") {
        await axios.request(axiosOptions(marketSummaryUrl)).then(res => { marketSummary=res.data["marketSummaryResponse"]["result"]; });
        await axios.request(axiosOptions(customStocksUrl)).then(res => { customStocks=res.data["quoteResponse"]["result"]; });
        mailContents.push(marketSummary[0]["exchangeTimezoneName"] + " " + marketSummary[0]["regularMarketTime"]["fmt"]);
        parseSummaryContents(mailContents, marketSummary);
        parseStockContents(mailContents, customStocks);
    }
    else if(region == "KR") {
        await axios.request(axiosOptions(customStocksUrl)).then(res => { customStocks=res.data["quoteResponse"]["result"]; });
        mailContents.push(customStocks[0]["exchangeTimezoneName"] + " " + nowTime.toString());
        parseStockContents(mailContents, customStocks);
    }

    await main.trySendMail(mailTitle, mailContents);
}