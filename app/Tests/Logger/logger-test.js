/* Test script for logger */
debugger;
import logger from '../../Models/Logger';


//logger.log('error', "meek mill dissed drake", {data : { a : 'some data'}});
//logger.log('warn', "drake is out of town");
console.log("about to log..");
logger.error("testing logger error", {data : 'test'});
//logger.warn("meek milly", {data:'test'});

