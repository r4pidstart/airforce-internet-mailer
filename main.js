exports.trySendMail = trySendMail;

const sendMail = require("./sendMail.js");
const scrap = require("./scrapSites.js");
const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

async function trySendMail(title, contents)
{
    console.log(title + " 메일 작성");
    try {
        await sendMail(title, contents);
    }
    catch (error)
    {
        console.log("caught" + error);
        await delay(500);
        await trySendMail(title, contents);
    }
    await delay(20000);
}

// scrap.giggleHW();
// scrap.DCsff();

// setInterval(scrap.DCsff, 900000); // 15분