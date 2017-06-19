const fs=require("fs")

const importPPM=require("./ppm.js").importPPM
const exportPPM=require("./ppm.js").exportPPM

const resize=require("./SeamCarving.js").resize
const markSeams=require("./SeamCarving.js").markSeams

importPPM(fs.createReadStream("test.ppm")).then((image)=>exportPPM(resize(image,image.width,image.height),fs.createWriteStream("test2.ppm"))).catch((err)=>console.log(err))