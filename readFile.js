exports.readId = readPostId;
exports.writeId = writePostId;
exports.readSettings = readSettings;

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