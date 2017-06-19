const fs=require("fs")

const importPPM=require("./ppm.js").importPPM
const exportPPM=require("./ppm.js").exportPPM

const resize=require("./SeamCarving.js").resize
const markSeams=require("./SeamCarving.js").markSeams

const config=require("./config.json")

if("kernel" in config){
	if(config.kernel in require("./SeamCarving.js").kernels){
		require("./SeamCarving.js").setKernel(require("./SeamCarving.js").kernels[config.kernel])
	}
}

let arg=process.argv.slice(2)

let method=arg[0]||""
let input=arg[1]||""
let output=arg[2]||""

if((arg[arg.length-1]||"")==="-v"){
	require("./log.js").setVerbose(true)
	require("./log.js").setLogger((str)=>console.log(str))
}

if(method!=="resize"&&method!=="mark"){
	throw new Error("Need valid method name")
}

if(input===""){
	throw new Error("Need input file name")
}

if(output===""){
	throw new Error("Need output file name")
}

let func=null

if(method==="mark"){
	let num=arg[3]|""
	let number=Math.floor(+num)
	if((number+"")!==num&&number<0){
		throw new Error("Need marked seam number")
	}
	func=(image)=>markSeams(image,number,[255,0,0,255])
}

if(method==="resize"){
	let neww=arg[3]|""
	let newWidth=Math.floor(+neww)
	if((newWidth+"")!==neww&&newWidth<0){
		throw new Error("Need new width")
	}
	let newh=arg[4]|""
	let newHeight=Math.floor(+newh)
	if((newHeight+"")!==newh&&newHeight<0){
		throw new Error("Need new height")
	}
	func=(image)=>resize(image,newWidth,newHeight)
}

importPPM(fs.createReadStream(input)).then((image)=>exportPPM(func(image),fs.createWriteStream(output))).catch((err)=>console.log(err))