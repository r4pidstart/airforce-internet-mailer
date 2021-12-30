exports.readId = readPostId;
exports.writeId = writePostId;

const fs = require("fs");
const idPath = "./lastPostId.json";

function readPostId()
{
    if(!fs.existsSync(idPath)) fs.writeFileSync(idPath, JSON.stringify({}));
    return JSON.parse(fs.readFileSync(idPath).toString());
}

function writePostId(ids)
{
    fs.writeFileSync(idPath, JSON.stringify(ids));
}