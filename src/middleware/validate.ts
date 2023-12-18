var validator = require('validator');
var errorList:any[] = []
const validate:any = {}
validate.required = (validateValue: any, item: any)=>{
    if(item.required) {
        try{
            if(validator.isEmpty(validateValue.toString())){
                errorList.push(item.message || '')
            }
        }catch(e){
            errorList.push(item.message || '')
        }
    } 
};
async function create(ctx, next) {
    let params = ctx.request.handleParams;
    errorList = []
    ctx.check = (validateData: any) => {
        for (let key in validateData) {
            let value = params[key]
            for (let items of validateData[key]) {
                for (let itemss in items) {
                    if (itemss) {
                        try{
                            validate[itemss](value, items)
                        }catch(e){

                        }
                    }
                }
            }
        }
        return errorList.length ? errorList[0] : ''
    }
    await next();
};
module.exports = {
    create:create,
};