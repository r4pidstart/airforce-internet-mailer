exports.trySendMail = trySendMail;

const sendMail = require("./sendMail.js");
const scrap = require("./scrapSites.js");
const schedule = require("node-schedule");
const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

async function trySendMail(title, contents)
{
    const time = new Date();
    console.log(time.toString(), "[ " + title + " ]" + " 메일 작성 시도");
    try {
        await sendMail(title, contents);
    }
    catch (error)
    {
        console.log("caught" + error);
        await delay(300000);
        await trySendMail(title, contents);
        return;
    }
    console.log(title + " 메일 작성 성공");
    await delay(20000);
}

setInterval(scrap.DCsff, 1200000);
const usStockMarket = schedule.scheduleJob("0 0,2,4,6 * * 2-6", () => {
    scrap.apiStock("US");
});
const krStockMarket = schedule.scheduleJob("30 9,11,13,15 * * 1-5", () => {
    scrap.apiStock("KR");
});
