let config={verbose:false,logger:()=>{}}

const setVerbose=(verbose)=>{
	config.verbose=verbose
}
const setLogger=(logger)=>{
	if(!(logger instanceof Function)){
		throw new Error("Logger should be function")
	}
	config.logger=logger
}

const log=(strings,...keys)=>{
	if(!config.verbose){
		return
	}
	let strs=Array.from(strings)
	const getStr=()=>{
		let str=strs.shift()
		if(str===undefined){
			throw new Error("Invalid string")
		}
		return str
	}
	let str=getStr()
	for(let key of keys){
		str+=key
		str+=getStr()
	}
	config.logger(str)
}

module.exports={setVerbose:setVerbose,setLogger:setLogger,log:log}