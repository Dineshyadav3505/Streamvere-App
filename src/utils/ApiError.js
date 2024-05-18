class ApiError extends Error {
    constructor(
        statusCode, 
        message ="Kuch to gabdab hai ri baba ",
        errors=[],
        stack = ""
        ) {
            super(message)
            this.statusCode = statusCode
            this.data =null
            this.message = message
            thid.success = false
            thid.error = errors

            if (stack) {
                this.stack = stack
            }
             else{
                Error.captureStackTrace(this, this.constructor)
             }
    }
};

export {ApiError};