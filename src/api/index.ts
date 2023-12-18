class Api {
    async getCollection(ctx: any, next: any) {
        let error = await ctx.check({
            collectionId: [{
                required: true,
                message: "collectionId cant not be null",
            }],
        })
        if (error) {
            ctx.fail({ code: 10000, msg: error });
            return
        }
        let params = ctx.request.handleParams;
        let result = await ctx.Db.find("collection",[`collectionId='${params.collectionId}'`])
        ctx.success({ code: 1, data: result });
    }
    async getAmount(ctx: any, next: any) {
        let error = await ctx.check({
            address: [{
                required: true,
                message: "user address cant not be null",
            }],
            collectionId: [{
                required: true,
                message: "collectionId cant not be null",
            }],
        })
        if (error) {
            ctx.fail({ code: 10000, msg: error });
            return
        }
        let params = ctx.request.handleParams;
        let result = await ctx.Db.select("holder",[`address='${params.address}'`,`collectionId='${params.collectionId}'`])
        ctx.success({ code: 1, data: result });
    }
    async getHolders(ctx: any, next: any) {
        let error = await ctx.check({
            collectionId: [{
                required: true,
                message: "collectionId cant not be null",
            }],
        })
        if (error) {
            ctx.fail({ code: 10000, msg: error });
            return
        }
        let params = ctx.request.handleParams;
        let result = await ctx.Db.select("holder",[`collectionId='${params.collectionId}'`],["amount desc"])
        ctx.success({ code: 1, data: result });
    }
    async getBlock(ctx: any, next: any) {
        let error = await ctx.check({
            chainId: [{
                required: true,
                message: "chainId cant not be null",
            }],
            blockNumber: [{
                required: true,
                message: "blockNumber cant not be null",
            }],
        })
        if (error) {
            ctx.fail({ code: 10000, msg: error });
            return
        }
        let params = ctx.request.handleParams;
        let result = await ctx.Db.select("blockNumber",[`chainId=${params.chainId}`,`blockNumber=${params.blockNumber}`],["amount desc"])
        ctx.success({ code: 1, data: result });
    }
}
export default new Api()