import { Config } from "./constrants"
import schedule from "node-schedule"
import _ from "lodash"
import BlockTx from "./events/blockTx"
import Web3 from "web3"
import { collection, order, holder, depositEvent, blockHash } from "./types"
class NextInscription {
    Db: any
    provider: any
    chainId: number
    asyncHeight: number
    blockTx: BlockTx
    sqlConfig: any
    constructor(Db: any, chainId: number) {
        this.Db = Db
        this.provider = new Web3(Config[chainId].prc)
        this.chainId = chainId
        this.blockTx = new BlockTx(this.Db, chainId)
        this.initialization()
    }
    async validateBlock(startNumber, endBlock) {
       return await this.blockTx.batchGetBlock(startNumber, endBlock, this.provider)
    }
    async initialization() {
        let find = await this.Db.find("config", [`chainId=${this.chainId}`])
        if (!find) {
            this.Db.insert("config", { chainId: this.chainId, asyncHeight: Config[this.chainId].startAsyncBlock })
            this.asyncHeight = Config[this.chainId].startAsyncBlock
        } else {
            this.asyncHeight = find.asyncHeight
            this.sqlConfig = find
        }
        this.startBlockEvent()
    }
    async insertCollection(collection: collection[]) {
        return new Promise(async (resolve) => {
            if (collection.length) {
                let result = await this.Db.insertList("collection", collection)
                resolve(result)
            } else {
                resolve(true)
            }
        })
    }
    async updateCollection(collection: collection[]) {
        return new Promise(async (resolve) => {
            if (collection.length) {
                let result = await this.Db.updateList("collection", collection)
                resolve(result)
            } else {
                resolve(true)
            }
        })
    }

    async updateHolder(holders: holder[]) {
        return new Promise(async (resolve) => {
            if (holders.length) {
                let result = await this.Db.updateList("holder", holders)
                resolve(result)
            } else {
                resolve(true)
            }
        })
    }

    async insertTransfer(orders: order[]) {
        return new Promise(async (resolve) => {
            if (orders.length) {
                let result = await this.Db.insertList("transfer", orders)
                resolve(result)
            } else {
                resolve(true)
            }
        })
    }
    async insertBlockHash(blockHashs: blockHash[]) {
        return new Promise(async (resolve) => {
            if (blockHashs.length) {
                let result = await this.Db.updateList("block", blockHashs)
                resolve(result)
            } else {
                resolve(true)
            }
        })
    }
    async updateDepositEvent(depositEvents: depositEvent[]) {
        return new Promise(async (resolve) => {
            if (depositEvents.length) {
                let hashs = depositEvents.map(item => {
                    return `'${item.orderHash}'`
                })
                let list = await this.Db.batchQuery("transfer", "transferHash", hashs)
                let updateDeposit = []
                list.forEach(item => {
                    let find = depositEvents.find(items => {
                        return items.from == item.receive && items.collectionId == item.collectionId && items.amount == item.amount
                    })
                    if (find) {
                        item.isConfirmDeposit = 1
                        updateDeposit.push(item)
                    }
                })
                if (updateDeposit.length) {
                    let result = await this.Db.updateList("transfer", updateDeposit)
                    resolve(result)
                } else {
                    resolve(true)
                }
            } else {
                resolve(true)
            }
        })
    }
    async startBlockEvent() {
        let success = true
        schedule.scheduleJob("*/10 * * * * *", async () => {
            try {
                const provieder = new Web3(Config[this.chainId].prc)
                let currentBlockNumber = await provieder.eth.getBlockNumber()
                if (currentBlockNumber > this.asyncHeight + 3 && success) {
                    success = false
                    let startBlock = this.asyncHeight + 1
                    let endBlock = startBlock + 99 > currentBlockNumber ? currentBlockNumber - 2 : startBlock + 99
                    try {
                        let result = await this.blockTx.batchGetBlock(startBlock, endBlock, provieder)
                        let deployCollection = await this.insertCollection(result.collections)
                        let updateCollection = await this.updateCollection(result.updateCollections)
                        let updateHolder = await this.updateHolder(result.holders)
                        let insertTransfer = await this.insertTransfer(result.orders)
                        let updateDeposit = await this.updateDepositEvent(result.depositEvents)
                        let insertBlockHash = await this.insertBlockHash(result.blockHashs)
                        if (deployCollection && updateCollection && updateHolder && insertTransfer && updateDeposit && insertBlockHash) {
                            this.asyncHeight = endBlock
                            let updateConfig = this.sqlConfig ? this.sqlConfig : { chainId: this.chainId, asyncHeight: 0 }
                            updateConfig.asyncHeight = endBlock
                            this.sqlConfig = updateConfig
                            await this.Db.update("config", updateConfig)
                            console.log(`sync ${endBlock},deploy ${result.collections.length},mint ${result.mints.length} ,update collection ${result.updateCollections.length},wallet ${result.holders.length},request time ${result.requestTime} ms,handler data time ${result.handleDataTime} ms,validate block ${result.blockHashs.length}`)
                        }
                        success = true
                    } catch (error) {
                        console.log(error)
                        success = true
                    }
                }
            } catch (error) {
                success = true
            }
        })
    }
}

export default NextInscription