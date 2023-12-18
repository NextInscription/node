import Koa from "koa"
import cors from "koa2-cors"
import Router from "koa-router"
import bodyparser from "koa-bodyparser"
import routes from "./routes";
import NextInscription from "./NextInscription/index"
import Sqlite3 from "./NextInscription/sqlite3";
import routerResponse from "./middleware/response";
import routerRquest from "./middleware/request"
const chainId = 137
const port = 7777
const Db = new Sqlite3(chainId)
setTimeout(() => {
    new NextInscription(Db,chainId)
}, 1000);
const app = new Koa();
const router = new Router();
routes.create(router);
app.use(async (ctx: any, next: any) => {
    ctx.Db = Db
    await next()
})
app.use(cors());
app.use(bodyparser());
app.use(routerResponse.handleResponse())
app.use(routerRquest.handleRequest())
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(port);