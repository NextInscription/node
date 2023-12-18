const logger = require('./logger')
const handleCode = require('./code')
class handler {
    debuglog(method: string, err: any, errorCode: number) {
        logger[method].error(err)
        logger.errorCodeLogger.error(handleCode.errorMsg[errorCode.toString() || '10000'])
        throw errorCode.toString() || '10000'
    }
    log(method: string, err: any, errorCode: number) {
        logger[method].error(err)
        logger.errorCodeLogger.error(handleCode.errorMsg[errorCode.toString() || '10000'])
    }
}
export default new handler()