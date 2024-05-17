class ApiError extends Error {
    constructor(
        statusCode, 
        message ="Kuch to gabdab hai ri baba ",
        errors=[],
        statck = ""
        ) {
            super(message)
            this.statusCode = statusCode
            this.data =null
            this.message = message
            thid.success = false
            thid.error = errors

            if (statck) {
                this.stack = statck
            }
             else{
                Error.captureStackTrace(this, this.constructor)
             }
    }
};

export {ApiError};