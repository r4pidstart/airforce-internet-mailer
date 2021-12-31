exports.trySendMail = trySendMail;

const sendMail = require("./sendMail.js");
const scrap = require("./scrapSites.js");
const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

async function trySendMail(title, contents)
{
    await delay(10000);
    try {
        await sendMail(title, contents);
    }
    catch (error)
    {
        console.log("caught" + error);
        await delay(500);
        await trySendMail(title, contents);
    }
}

// scrap.giggleHW();
// scrap.DCsff();
