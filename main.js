exports.trySendMail = trySendMail;

const sendMail = require("./sendMail.js");
const scrap = require("./scrapSites.js");
const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

async function trySendMail(contents)
{
    try {
        await sendMail(e);
    }
    catch (error)
    {
        console.log("caught" + error);
        await delay(500);
        await trySendMail(e);
    }
}

scrap.giggleHW();
scrap.DCsff();
