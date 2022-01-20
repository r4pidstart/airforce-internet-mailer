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
    if(!fs.existsSync(settingsPath)) throw new Error("settings.json이 존재하지 않습니다.");
    return JSON.parse(fs.readFileSync(settingsPath).toString())[type];
}

async function checkSettings()
{
    if(!fs.existsSync(settingsPath)) await doInitSettings();
    else {
        console.log(`${readSettings("soldierName")} / ${readSettings("soldierBirthday").year} ${readSettings("soldierBirthday").month} ${readSettings("soldierBirthday").day}`);
        const readline = require("readline");
        const rl = readline.createInterface({input : process.stdin, output : process.stdout});
        const ans = await new Promise(resolve => {
            rl.question("설정을 변경하시겠습니까? (Y/N)\n>> ", resolve);
        });
        rl.close();
        if(ans == 'Y' || ans == 'y') await doInitSettings();
    };
}

async function doInitSettings() {
    const readline = require("readline");
    const rl = readline.createInterface({input : process.stdin, output : process.stdout});
    
    const soldierName = await new Promise(resolve => {
        rl.question("훈련병 이름 ex) 홍길동\n>> ", resolve);
    });
    const soldierBirthday = await new Promise(resolve => {
        rl.question("훈련병 생일 ex) 2000 01 21\n>> ", resolve);
    });
    const soldierType = await new Promise(resolve => {
        rl.question("훈련병 소속\n1. 기본군사훈련단, 2. 군수1학교, 3. 군수2학교\n4. 정보통신학교, 5. 행정학교, 6. 방공포병학교\n>> ", ans => {resolve(ans-1);});
    });
    const userName = await new Promise(resolve => {
        rl.question("메일을 보내는 데 사용할 이름\n>> ", resolve);
    });
    const userRelationship = await new Promise(resolve => {
        rl.question("메일을 보내는 사람과의 관계\n>> ", resolve);
    });
    const userZipcode = await new Promise(resolve => {
        rl.question("메일을 보내는 사람의 우편번호 ex) 03048\n>> ", resolve);
    });
    const userAddress = await new Promise(resolve => {
        rl.question("메일을 보내는 사람의 주소\n>> ", resolve);
    });
    const mailPassword = await new Promise(resolve => {
        rl.question("메일을 보내는 데 사용할 비밀번호\n>> ", resolve);
    });
    const yahooFinanceAPIKey = await new Promise(resolve => {
        rl.question("야후 파이낸스 api 키 (공란일 경우 미사용)\n>> ", resolve);
    });
    let galleryList = [];
    const linksCnt = await new Promise(resolve => {
        rl.question("스크래핑 할 갤러리 개수\n>> ", resolve);
    });
    for(let i=0; i<linksCnt; i++) {
        galleryList.push(await new Promise(resolve => {
            rl.question("갤러리 주소 ex) https://gall.dcinside.com/board/lists?id=pridepc_new4\n>> ", resolve);
        }));
    }
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
        "userName" : userName,
        "userRelationship" : userRelationship,
        "userZipcode" : userZipcode,
        "userAddress" : userAddress,
        "userPassword" : mailPassword,
        "mailTarget" : parseInt(soldierType),
        "yahooFinanceAPIKey" : yahooFinanceAPIKey,
        "USstockList" : defaultUSstockList,
        "KRstockList" : defaultKRstockList,
        "galleryList" : galleryList
    };

    fs.writeFileSync(settingsPath, JSON.stringify(array));
    console.log("설정을 변경하려면 재실행 하세요.");
}
