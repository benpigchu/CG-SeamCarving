const log=require("./log.js").log

const sobelKernel=(lefttop,top,righttop,left,middle,right,leftbottom,bottom,rightbottom)=>{
	let factor1=righttop+rightbottom+2*right-lefttop-leftbottom-2*left
	let factor2=righttop+lefttop+2*top-leftbottom-rightbottom-2*bottom
	return Math.hypot(factor1,factor2)
}

const transpose=(image)=>{
	let data=new Uint8ClampedArray(image.data.length)
	for(let i=0;i<image.height;i++){
		for(let j=0;j<image.width;j++){
			for(let k=0;k<4;k++){
				data[4*(j*image.height+i)+k]=image.data[4*(i*image.width+j)+k]
			}
		}
	}
	return{width:image.height,height:image.width,data:data}
}

const grayscale=(image)=>{
	let data=new Float32Array(image.width*image.height)
	for(let i=0;i<image.width*image.height;i++){
		data[i]=(image.data[4*i]+image.data[4*i+1]+image.data[4*i+2])/3
	}
	return{width:image.width,height:image.height,data:data}
}

const heatMap=(grayImage,kernel)=>{
	let data=new Float32Array(grayImage.width*grayImage.height)
	for(let i=0;i<grayImage.height;i++){
		for(let j=0;j<grayImage.width;j++){
			let left=(j===0)?j:j-1
			let right=(j===grayImage.width-1)?j:j+1
			let top=(i===0)?i:i-1
			let bottom=(i===grayImage.height-1)?i:i+1
			data[i*grayImage.width+j]=sobelKernel(grayImage.data[top*grayImage.width+left],
												grayImage.data[top*grayImage.width+j],
												grayImage.data[top*grayImage.width+right],
												grayImage.data[i*grayImage.width+left],
												grayImage.data[i*grayImage.width+j],
												grayImage.data[i*grayImage.width+right],
												grayImage.data[bottom*grayImage.width+left],
												grayImage.data[bottom*grayImage.width+j],
												grayImage.data[bottom*grayImage.width+right])
		}
	}
	return{width:grayImage.width,height:grayImage.height,data:data}
}

const imageFromData=(grayImage)=>{
	let data=new Uint8ClampedArray(grayImage.width*grayImage.height*4)
	for(let i=0;i<grayImage.width*grayImage.height;i++){
		data[4*i]=grayImage.data[i]
		data[4*i+1]=grayImage.data[i]
		data[4*i+2]=grayImage.data[i]
		data[4*i+3]=255
	}
	return{width:grayImage.width,height:grayImage.height,data:data}
}

const getSeam=(image)=>{
	let heat=heatMap(grayscale(image)).data
	let total=new Float32Array(image.width*image.height)
	let direction=new Int8Array(image.width*image.height)
	let min=Infinity
	let minpos=0
	for(let i=0;i<image.height;i++){
		for(let j=0;j<image.width;j++){
			if(i===0){
				total[i*image.width+j]=heat[i*image.width+j]
				direction[i*image.width+j]=0
			}else{
				let localmin=total[(i-1)*image.width+j]
				let localmindire=0
				if(j!==0){
					if(total[(i-1)*image.width+j-1]<localmin){
						localmin=total[(i-1)*image.width+j-1]
						localmindire=-1
					}
				}
				if(j!==image.width-1){
					if(total[(i-1)*image.width+j+1]<localmin){
						localmin=total[(i-1)*image.width+j+1]
						localmindire=1
					}
				}
				total[i*image.width+j]=localmin+heat[i*image.width+j]
				direction[i*image.width+j]=localmindire
				if(i===image.height-1){
					if(total[i*image.width+j]<min){
						min=total[i*image.width+j]
						minpos=j
					}
				}
			}
		}
	}
	let posList=[]
	for(let i=image.height-1;i>=0;i--){
		posList.unshift(minpos)
		minpos+=direction[i*image.width+minpos]
	}
	return posList
}

const getSeams=(image,seamNum,returnImage=false)=>{
	let processingImage={width:image.width,height:image.height,data:new Uint8ClampedArray(image.data)}
	let seams=[]
	for(let i=0;i<seamNum;i++){
		let seam=getSeam(processingImage)
		seams.unshift(seam)
		processingImage.width--
		let newData=new Uint8ClampedArray(image.height*image.width*4)
		for(let i=0;i<processingImage.height;i++){
			for(let j=0;j<processingImage.width;j++){
				let oldIndex=i*(processingImage.width+1)+j+(j<seam[i]?0:1)
				let newIndex=i*processingImage.width+j
				for(let k=0;k<4;k++){
					newData[4*newIndex+k]=processingImage.data[4*oldIndex+k]
				}
			}
		}
		processingImage.data=newData
	}
	if(returnImage){
		return processingImage
	}
	let currentWidth=image.width-seamNum
	let flags=new Array(image.height*currentWidth).fill(0)
	for(let seam of seams){
		currentWidth++
		for(let i=0;i<image.height;i++){
			flags.splice(i*currentWidth+seam[i],0,1)
		}
	}
	return new Int8Array(flags)
}

const changeWidth=(image,newWidth)=>{
	if(newWidth<image.width){
		return getSeams(image,image.width-newWidth,true)
	}
	while(newWidth>2*image.width){
		let data=new Uint8ClampedArray(4*image.width*image.height*2)
		for(let i=0;i<image.height*image.width;i++){
			for(let j=0;j<4;j++){
				data[i*8+j]=image.data[i*4+j]
				data[i*8+4+j]=(image.data[i*4+j]+image.data[i*4+j+((i+1)%image.width===0?0:4)])/2
			}
		}
		image.data=data
		image.width*=2
	}
	if(image.width===newWidth){
		return image
	}
	let seams=getSeams(image,newWidth-image.width)
	let newPos=0
	let data=new Uint8ClampedArray(4*image.height*newWidth)
	for(let i=0;i<image.height*image.width;i++){
		for(let j=0;j<4;j++){
			data[4*newPos+j]=image.data[4*i+j]
		}
		newPos++
		if(seams[i]===1){
			for(let j=0;j<4;j++){
				data[4*newPos+j]=(image.data[4*i+j]+image.data[4*i+j+((i+1)%image.width===0?0:4)])/2
			}
			newPos++
		}
	}
	image.data=data
	image.width=newWidth
	return image

}

const markSeams=(image,seamNum,color)=>{
	let flags=getSeams(image,seamNum)
	let data=new Uint8ClampedArray(image.data)
	for(let i=0;i<image.height*image.width;i++){
		if(flags[i]===1){
			for(let j=0;j<4;j++){
				data[4*i+j]=color[j]
			}
		}
	}
	return{width:image.width,height:image.height,data:data}
}

const resize=(image,newWidth,newHeight)=>{
	return transpose(changeWidth(transpose(changeWidth(image,newWidth)),newHeight))
}

module.exports={resize:resize,markSeams:markSeams}