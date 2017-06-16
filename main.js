const fs=require("fs")

const importPPM=require("./ppm.js").importPPM
const exportPPM=require("./ppm.js").exportPPM

const resize=require("./SeamCarving.js").resize

importPPM(fs.createReadStream("test.ppm")).then((image)=>exportPPM(resize(image,500,500),fs.createWriteStream("test2.ppm"))).catch((err)=>console.log(err))