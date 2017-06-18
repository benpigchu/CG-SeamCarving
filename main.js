const fs=require("fs")

const importPPM=require("./ppm.js").importPPM
const exportPPM=require("./ppm.js").exportPPM

const resize=require("./SeamCarving.js").resize
const markSeams=require("./SeamCarving.js").markSeams

importPPM(fs.createReadStream("test.ppm")).then((image)=>exportPPM(markSeams(image,500,[255,0,0,0]),fs.createWriteStream("test2.ppm"))).catch((err)=>console.log(err))