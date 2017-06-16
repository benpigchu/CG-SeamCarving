const parseDecimal=(str)=>{
	let num=Math.floor(+str)
	if((num+"")!==str||num<=0){
		throw new Error(`${str} is not a decimal`)
	}
	return num
}

/// import P6 PPM format
/// notice only the 255 maxval is supported
/// the image use a HTML ImageData like structure
const importPPM=(stream)=>new Promise((res,rej)=>{
	let isMeta=true
	let isMetaBlank=false
	let metaCount=0
	let metaCache=""
	let width=0
	let height=0
	let imageData
	const processMeta=(meta)=>{
		switch(metaCount){
		case 0:
			if(meta!=="P6"){
				stream.destroy(new Error("PPM Parser: Not PPM file"))
			}
			break
		case 1:
			try{
				width=parseDecimal(meta)
			}catch(err){
				stream.destroy(new Error("PPM Parser: Invalid Format"))
			}
			break
		case 2:
			try{
				height=parseDecimal(meta)
			}catch(err){
				stream.destroy(new Error("PPM Parser: Invalid Format"))
			}
			break
		case 3:
			if(meta!=="255"){
				stream.destroy(new Error("PPM Parser: Unsupported maxval"))
			}
			imageData=new Uint8ClampedArray(height*width*4)
			isMeta=false
			break
		default:
			break
		}
	}
	let byteCount=0
	const nextChar=(byte)=>{
		if(isMeta){
			let char=String.fromCharCode(byte)
			switch(char){
			case"\t":
			case"\n":
			case"\v":
			case"\f":
			case"\r":
			case" ":
				if(!isMetaBlank){
					isMetaBlank=true
					processMeta(metaCache)
					metaCount++
					metaCache=""
				}
				break
			default:
				if(isMetaBlank){
					isMetaBlank=false
				}
				metaCache+=char
				break
			}
		}else{
			imageData[byteCount]=byte
			byteCount++
			if(byteCount%4===3){
				imageData[byteCount]=255
				byteCount++
			}
		}
	}
	stream.on("error",(err)=>{
		rej(err)
	})
	stream.on("data",(chunk)=>{
		for(const byte of chunk){
			nextChar(byte)
		}
	})
	stream.on("end",()=>{
		if(4*width*height!==byteCount){
			rej(new Error("PPM Parser: Length mismatch"))
		}
		res({width:width,height:height,data:imageData})
	})
})

/// export a PPM image
/// the image use a HTML ImageData like structure
const exportPPM=(image,stream)=>{
	stream.write(Buffer.from(`P6 ${image.width} ${image.height} 255\n`,{encoding:"acsii"}))
	for(let i=0;i<4*image.width*image.height;i+=4){
		stream.write(Buffer.from(image.data.buffer,i,3))
	}
	stream.end()
}

module.exports={importPPM:importPPM,exportPPM:exportPPM}
