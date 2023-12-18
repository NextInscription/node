class routerResponse {
    handleResponse() {
        return async (ctx: any, next: any) => {
            ctx.success = (option: any = {}) => {
                ctx.body = {
                    code: option.code || '1',
                    msg: option.msg ? option.msg : "",
                    data: option.data || {}
                }
            }

            ctx.fail = (option: any = {}) => {
                ctx.type = option.type || 'json'
                ctx.body = {
                    code: option.code || '10000',
                    msg: option.msg ? option.msg : "",
                }
            }

            await next()
        }

    }
}

export default new routerResponse()