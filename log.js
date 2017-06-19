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
	let str=strings.unshift()
	for(let key of keys){
		str+=key
		str+=strings.unshift()
	}
	config.logger(str)
}

module.exports={setVerbose:setVerbose,setLogger:setLogger,log:log}