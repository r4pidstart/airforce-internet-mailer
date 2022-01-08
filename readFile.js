exports.readId = readPostId;
exports.writeId = writePostId;
exports.readSettings = readSettings;
exports.checkSettings = checkSettings;
exports.doInitSettings = doInitSettings;

const fs = require("fs");
const idPath = "./lastPostId.json";
const settingsPath = "./settings.json";

function readPostId()
{
    if(!fs.existsSync(idPath)) fs.writeFileSync(idPath, JSON.stringify({}));
    return JSON.parse(fs.readFileSync(idPath).toString());
}

function writePostId(ids)
{
    fs.writeFileSync(idPath, JSON.stringify(ids));
}

function readSettings(type)
{
    if(!fs.existsSync(settingsPath)) throw new Error("settings.json");
    return JSON.parse(fs.readFileSync(settingsPath).toString())[type];
}

function checkSettings()
{
    if(!fs.existsSync(settingsPath)) return 1;
    else return 0;
}

async function doInitSettings() {
    const readline = require("readline");
    const rl = readline.createInterface({input : process.stdin, output : process.stdout});
    
    const soldierName = await new Promise(resolve => {
        rl.question("훈련병 이름은? ex) 홍길동\n>> ", resolve);
    });
    const soldierBirthday = await new Promise(resolve => {
        rl.question("훈련병 생일은? ex) 2000 01 01\n>> ", resolve);
    });
    const soldierType = await new Promise(resolve => {
        rl.question("훈련병 소속\n1. 기본군사훈련단, 2. 군수1학교, 3. 군수2학교\n4. 정보통신학교, 5. 행정학교, 6. 방공포병학교\n>> ", ans => {resolve(ans-1);});
    });
    const mailPassword = await new Promise(resolve => {
        rl.question("메일을 보내는 데 사용할 비밀번호\n>> ", resolve);
    });
    const yahooFinanceAPIKey = await new Promise(resolve => {
        rl.question("야후 파이낸스 api 키 (공란일 경우 미사용)\n>> ", resolve);
    });

    rl.close();
    
    const defaultUSstockList = "ETH-USD,LTC-USD,INTC,AMD,NVDA,MSFT,U,SOXL,SOXS,KRW=X";
    const defaultKRstockList = "^KS11,^KQ11,005930.KS,000660.KS,035420.KS,035720.KS,006400.KS,018260.KS,196170.KQ,KRW=X";

    const array = {
        "soldierName" : soldierName,
        "soldierBirthday" : {
            "year" : soldierBirthday.split(' ')[0],
            "month" : soldierBirthday.split(' ')[1],
            "day" : soldierBirthday.split(' ')[2] 
        },
        "userPassword" : mailPassword,
        "mailTarget" : parseInt(soldierType),
        "yahooFinanceAPIKey" : yahooFinanceAPIKey,
        "USstockList" : defaultUSstockList,
        "KRstockList" : defaultKRstockList
    };

    fs.writeFileSync(settingsPath, JSON.stringify(array));
}
