"use strict";

var winston = require("winston");

var LoggerFactory = {
	getLogger:function(opt){
		this.logger = new winston.Logger({
			transports:[
				new (winston.transports.Console)({
					timestamp:true,
					label:opt.label,
					colorize:true,
					prettyPrint:true,
				}),
			]
		});

		return this.logger;
	}
}

exports.LoggerFactory = LoggerFactory;