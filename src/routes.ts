import api from "./api";
const Router = require('koa-router');
const validate = require("./middleware/validate")
const router = new Router();
router.get('/getAmount', validate.create, api.getAmount);
router.get('/getCollection', validate.create, api.getCollection);
router.get('/getHolders', validate.create, api.getHolders);
router.get('/getBlock', validate.create, api.getBlock);
class useRouter {
    constructor() {
    }
    create(Routers) {
        Routers.use('/api', router.routes(), router.allowedMethods());
    }
}
export default new useRouter()