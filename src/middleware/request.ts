class routerRequest {
    handleRequest() {
        return async (ctx: any, next: any) => {
            if (ctx.request.method == 'GET') {
                ctx.request.handleParams = ctx.request.query || {}
            }
            if (ctx.request.method == 'POST') {
                ctx.request.handleParams = ctx.request.body || {}
            }
            await next()
        }

    }
}
export default new routerRequest()