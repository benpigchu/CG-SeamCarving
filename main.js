const fs=require("fs")

const importPPM=require("./ppm.js").importPPM
const exportPPM=require("./ppm.js").exportPPM

const resize=require("./SeamCarving.js").resize
const markSeams=require("./SeamCarving.js").markSeams

require("./log.js").setVerbose(true)
require("./log.js").setLogger((str)=>console.log(str))

importPPM(fs.createReadStream("test.ppm")).then((image)=>exportPPM(resize(image,1500,1000),fs.createWriteStream("test2.ppm"))).catch((err)=>console.log(err))