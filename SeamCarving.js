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

const getSeam=(image,seamNum)=>{

}

const resize=(image,newWidth,newHeight)=>{
	console.log(`image: ${image.width}x${image.height}`)
	return imageFromData(heatMap(grayscale(image)))
}

module.exports={resize:resize}