import { validateOrder } from "./filters"
import { collection, responseEvents, txFormater, eventFormater, depositEvent, order } from "../types"
import { Config } from "../constrants"
import _ from "lodash"
import Web3 from "web3"
class BlockTx {
    web3: any
    Db: any
    agreement: string
    chainId: number
    constructor(Db: any, chainId: number) {
        this.web3 = new Web3()
        this.Db = Db
        this.chainId = chainId
        this.agreement = Config[chainId].agreement
    }
    formatTx(transactions: any[], blockNumber: number) {
        let NextInscriptionTxs = []
        transactions.forEach(item => {
            let agreementLength = this.agreement.length
            let sliceInput = item.input.slice(0, agreementLength)
            if (sliceInput == this.agreement) NextInscriptionTxs.push(item)
        })
        NextInscriptionTxs = this.formatInputData(NextInscriptionTxs)
        let txFormater: txFormater = {
            deploy: this.formatDeploy(NextInscriptionTxs),
            transfer: this.formatTransfer(NextInscriptionTxs),
            mint: this.formatMint(NextInscriptionTxs),
            blockNumber
        }
        return txFormater
    }
    validateDeploy(decodeInput: any) {
        return decodeInput.a == "NextInscription" && decodeInput.op == "deploy" && decodeInput.p && decodeInput.p.length <= 10 && decodeInput.tick && decodeInput.tick.length <= 18 && Number(decodeInput.max) % 1 === 0 && Number(decodeInput.max) > 0 && decodeInput.max.length <= 18 && Number(decodeInput.max) % Number(decodeInput.lim) === 0 && Number(decodeInput.lim) % 1 === 0 && Number(decodeInput.lim) > 0
    }
    validateTransfer(decodeInput: any) {
        return decodeInput.a == "NextInscription" && decodeInput.p && decodeInput.op == "transfer" && decodeInput.tick && Number(decodeInput.amt) % 1 === 0 && Number(decodeInput.amt) > 0
    }
    validateDeposit(decodeInput: any) {
        return decodeInput.a == "NextInscription" && decodeInput.p && decodeInput.op == "deposit" && decodeInput.tick && Number(decodeInput.amt) % 1 === 0 && Number(decodeInput.amt) > 0 && decodeInput.to
    }
    validateMint(decodeInput: any, item: any) {
        return decodeInput.a == "NextInscription" && decodeInput.p && decodeInput.op == "mint" && decodeInput.tick && Number(decodeInput.amt) % 1 === 0 && Number(decodeInput.amt) > 0 && item.from == item.to
    }
    formatDeploy(NextInscriptionTxs: any[]) {
        let deploy: collection[] = []
        NextInscriptionTxs.forEach(item => {
            let decodeInput = item.decodeInput
            if (this.validateDeploy(decodeInput)) {
                let interItem = {
                    decodeCollectionId: `${this.chainId},${decodeInput.p},${decodeInput.tick}`,
                    collectionId: "",
                    chainId: this.chainId,
                    a: decodeInput.a,
                    p: decodeInput.p,
                    op: decodeInput.op,
                    tick: decodeInput.tick,
                    max: Number(decodeInput.max),
                    lim: Number(decodeInput.lim),
                    blockNumber: item.blockNumber,
                    transferIndex: item.transactionIndex,
                    lastTransferIndex: item.transactionIndex,
                    lastBlock: item.blockNumber,
                    totalSupply: 0,
                }
                deploy.push(interItem)
            }
        })
        return deploy
    }
    formatTransfer(NextInscriptionTxs: any[]) {
        let transfer: order[] = []
        NextInscriptionTxs.forEach(item => {
            let decodeInput = item.decodeInput
            if (this.validateTransfer(decodeInput)) {
                let interItem = {
                    transferHash: item.hash,
                    chainId: this.chainId,
                    collectionId: `${this.chainId},${decodeInput.p},${decodeInput.tick}`,
                    callData: item.input,
                    sender: item.from,
                    receive: item.to,
                    type: 2,
                    blockNumber: item.blockNumber,
                    transferIndex: item.transactionIndex,
                    status: 1,
                    isConfirmDeposit: 0,
                    remark: "",
                    amount: Number(decodeInput.amt),
                }
                transfer.push(interItem)
            }
            if (this.validateDeposit(decodeInput)) {
                let interItem = {
                    transferHash: item.hash,
                    chainId: this.chainId,
                    collectionId: `${this.chainId},${decodeInput.p},${decodeInput.tick}`,
                    callData: item.input,
                    sender: item.from,
                    receive: decodeInput.to,
                    type: 3,
                    blockNumber: item.blockNumber,
                    transferIndex: item.transactionIndex,
                    status: 1,
                    isConfirmDeposit: 0,
                    remark: "",
                    amount: Number(decodeInput.amt),
                }
                transfer.push(interItem)
            }
        })
        return transfer
    }
    formatMint(NextInscriptionTxs: any[]) {
        let mint: order[] = []
        NextInscriptionTxs.forEach(item => {
            let decodeInput = item.decodeInput
            if (this.validateMint(decodeInput, item)) {
                let interItem = {
                    transferHash: item.hash,
                    chainId: this.chainId,
                    collectionId: `${this.chainId},${decodeInput.p},${decodeInput.tick}`,
                    callData: item.input,
                    sender: item.from,
                    receive: item.to,
                    type: 1,
                    blockNumber: item.blockNumber,
                    transferIndex: item.transactionIndex,
                    status: 1,
                    isConfirmDeposit: 0,
                    remark: "",
                    amount: Number(decodeInput.amt),
                }
                mint.push(interItem)
            }
        })
        return mint
    }
    formatInputData(list: any[]) {
        let NextInscriptionTxs = []
        list.forEach(item => {
            try {
                let utf8Data = this.web3.utils.hexToUtf8(item.input)
                utf8Data = utf8Data.replace("data:,", "")
                item.decodeInput = JSON.parse(utf8Data)
                NextInscriptionTxs.push(item)
            } catch (error) {

            }
        })
        return NextInscriptionTxs
    }
    formatEvents(eventList: any[]) {
        let depositEvent: depositEvent[] = [];
        let transferEvent: order[] = [];
        eventList.forEach(item => {
            switch (item.topics[0]) {
                case "0x63cf329406773eabf98591f59e4bfff7723532004b4781db0567ad28833d12a4":
                    depositEvent.push({
                        orderHash: item.topics[1],
                        collectionId: item.topics[2],
                        from: item.address,
                        amount: this.web3.utils.hexToNumber(item.topics[3]),
                        blockNumber: item.blockNumber,
                        transactionIndex: item.transactionIndex,
                    })
                    break;
                case "0x5519fd05a33c69546cba464ec85166b9b405b0b78c67c35082c4dc0d7366487f":
                    let receive = this.web3.eth.abi.decodeParameter("address", item.topics[2])
                    if (this.web3.utils.isAddress(receive)) {
                        transferEvent.push({
                            transferHash: item.transactionHash,
                            chainId: this.chainId,
                            collectionId: item.topics[1],
                            callData: "0x",
                            sender: item.address,
                            receive: this.web3.utils.toChecksumAddress(receive),
                            blockNumber: item.blockNumber,
                            transferIndex: item.transactionIndex,
                            amount: this.web3.utils.hexToNumber(item.topics[3]),
                            type: 4,
                            status: 1,
                            isConfirmDeposit: 0,
                            remark: "",
                        })
                    }
                    break;
            }
        })
        let formarter: eventFormater = {
            depositEvent,
            transferEvent
        }
        return formarter
    }
    batchGetBlock(startNumber: number, endNumber: number, provider: any) {
        return new Promise<responseEvents>(async (resolve, reject) => {
            let requestStartTime = new Date().getTime()
            let p = []
            let blockNumbers = {}
            let batch = new provider.eth.BatchRequest();
            for (let i = startNumber; i <= endNumber; i++) {
                let transferTxPromise = new Promise<{ type: number, formater: txFormater }>((resolve, reject) => {
                    batch.add(provider.eth.getBlock.request(i, true, (err, res) => {
                        if (err) {
                            reject(err)
                            return
                        }
                        if (res && res.timestamp) {
                            try {
                                blockNumbers[i] = res.timestamp
                                let formater: any = this.formatTx(res.transactions, res.number)
                                resolve({ type: 1, formater })
                            } catch (error) {
                                reject(error)
                            }
                        } else {
                            reject("data null")
                        }
                    }))
                })
                p.push(transferTxPromise)
            }
            let eventPromise = new Promise((resolve, reject) => {
                batch.add(provider.eth.getPastLogs.request({
                    fromBlock: startNumber,
                    toBlock: endNumber,
                    topics: [["0x63cf329406773eabf98591f59e4bfff7723532004b4781db0567ad28833d12a4", "0x5519fd05a33c69546cba464ec85166b9b405b0b78c67c35082c4dc0d7366487f"]]
                }, async (err, res) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    try {
                        let formater = this.formatEvents(res)
                        resolve({ type: 2, formater })
                    } catch (error) {
                        reject(error)
                    }
                }))
            })
            p.push(eventPromise)
            batch.execute()
            try {
                let result = await Promise.all(p)
                let requestTime = new Date().getTime() - requestStartTime
                let handleDataStartTime = new Date().getTime()
                let data = await this.handlerAllIndex(result, blockNumbers)
                let handleDataTime = new Date().getTime() - handleDataStartTime
                data.requestTime = requestTime
                data.handleDataTime = handleDataTime
                resolve(data)
            } catch (error) {
                reject(error)
            }
        })
    }
    async handlerAllIndex(transactions: any[], blockNumbers: Object) {
        let txList = transactions.filter(item => {
            return item.type == 1
        })
        let eventList = transactions.filter(item => {
            return item.type == 2
        })
        let handleAllTransfer = this.blockHash(txList, eventList, blockNumbers)
        let { collections, deploy } = await this.getAllcollections(handleAllTransfer.mint.concat(handleAllTransfer.transfer), handleAllTransfer.deploy)
        let { mint, transfer } = this.fitlerAllTransaction(handleAllTransfer.mint.concat(handleAllTransfer.transfer), collections)
        let holders: Object = await this.getAllHolders(mint.concat(transfer))
        let { successList, updateHolders, updateCollections } = validateOrder(mint.concat(transfer), collections, holders)
        let response: responseEvents = {
            collections: deploy,
            mints: successList.filter(item => {
                return item.type == 1
            }),
            orders: successList.filter(item => {
                return item.type != 1
            }),
            holders: updateHolders,
            depositEvents: handleAllTransfer.depositSuccess,
            updateCollections: updateCollections,
            blockHashs: handleAllTransfer.blockHashs,
            requestTime: 0,
            handleDataTime: 0
        }
        return response
    }
    fitlerAllTransaction(list: order[], collections: collection[]) {
        let mint = []
        let transfer = []
        list.forEach(item => {
            let find = collections.find(items => {
                return item.type == 4 ? items.collectionId == item.collectionId : items.decodeCollectionId == item.collectionId
            })
            if (find) {
                if (item.type == 1) {
                    item.collectionId = find.collectionId
                    mint.push(item)
                } else {
                    item.collectionId = find.collectionId
                    transfer.push(item)
                }
            }
        })
        return { mint, transfer }
    }
    getAllHolders(orders: order[]) {
        return new Promise(async (resolve) => {
            let addresses = []
            let saltDecodes = []
            orders.forEach(item => {
                if (item.type == 1) {
                    saltDecodes.push(`${item.collectionId}${item.receive}`)
                } else {
                    saltDecodes.push(`${item.collectionId}${item.sender}`)
                    saltDecodes.push(`${item.collectionId}${item.receive}`)
                }
            })
            saltDecodes = Array.from(new Set(saltDecodes))
            addresses = saltDecodes.map(item => {
                return `'${this.web3.utils.keccak256(item)}'`
            })
            let holders = {}
            if (addresses.length) {
                let list = await this.Db.batchQuery("holder", "addressSalt", addresses)
                list.forEach(item => {
                    holders[item.addressSalt] = item
                })
            }
            resolve(holders)
        })
    }
    getAllcollections(orders: order[], deploy: collection[]) {
        return new Promise<{ collections: collection[], deploy: collection[] }>(async (resolve) => {
            let collectionIds = []
            let whitdrawCollectionId = []
            orders.forEach(item => {
                if (item.type == 4) {
                    whitdrawCollectionId.push(`'${item.collectionId}'`)
                } else {
                    collectionIds.push(item.collectionId)
                }
            })
            deploy.forEach(item => {
                collectionIds.push(item.decodeCollectionId)
            })
            collectionIds = Array.from(new Set(collectionIds))
            let collections = []
            let hashCollectionIds = []
            if (collectionIds.length || whitdrawCollectionId.length) {
                let searchKeys = []
                hashCollectionIds = collectionIds.map(item => {
                    let split = item.split(",")
                    let hash = this.encodeCollectionId(Number(split[0]), split[1], split[2])
                    searchKeys.push(`'${hash}'`)
                    return {
                        decode: item,
                        hash
                    }
                })
                whitdrawCollectionId.forEach(item => {
                    if (searchKeys.indexOf(item) == -1) {
                        searchKeys.push(item)
                    }
                })
                collections = await this.Db.batchQuery("collection", "collectionId", searchKeys)
            }
            let undefinedcollections = hashCollectionIds.filter(item => {
                let find = collections.find(items => {
                    return items.collectionId == item.hash
                })
                return !find
            })
            let currentDeploy = []
            if (deploy.length && undefinedcollections.length) {
                undefinedcollections.forEach(item => {
                    let find = deploy.find(items => {
                        return items.decodeCollectionId == item.decode
                    })
                    if (find) {
                        find.decodeCollectionId = item.decode
                        find.collectionId = item.hash
                        currentDeploy.push(find)
                    }
                })
            }
            resolve({ collections: collections.concat(currentDeploy), deploy: currentDeploy })
        })
    }
    blockHash(txList: any[], eventList: any[], blockNumbers: any) {
        let allTransferEvent = []
        let allDepositEvent = []
        let allTransfer = []
        let allDeploy = []
        let allMint = []
        let blockHashs = []
        eventList.forEach(item => {
            allTransfer = allTransfer.concat(item.formater.transferEvent)
            allTransferEvent = allTransferEvent.concat(item.formater.transferEvent)
            allDepositEvent = allDepositEvent.concat(item.formater.depositEvent)
        })
        txList.forEach(item => {
            let transfer = item.formater.mint.concat(item.formater.transfer).concat(item.formater.deploy)
            let filterTransferEvent = allTransferEvent.filter(event => {
                return event.blockNumber == item.formater.blockNumber
            })
            let fitlerDepositEvent = allDepositEvent.filter(event => {
                return event.blockNumber == item.formater.blockNumber
            })
            transfer = transfer.concat(filterTransferEvent)
            allTransfer = allTransfer.concat(item.formater.transfer)
            allDeploy = allDeploy.concat(item.formater.deploy)
            allMint = allMint.concat(item.formater.mint)
            let blockHash = this.getHash(item.formater.blockNumber, _.sortBy(transfer, ["transferIndex"]), _.sortBy(fitlerDepositEvent, ["transferIndex"]))
            blockHashs.push({ chainId: this.chainId, blockNumber: item.formater.blockNumber, blockHash })
        })
        allTransfer.forEach(item => {
            item.createTime = blockNumbers[item.blockNumber]
        })
        allMint.forEach(item => {
            item.createTime = blockNumbers[item.blockNumber]
        })
        allDeploy.forEach(item => {
            item.createTime = blockNumbers[item.blockNumber]
        })
        allDepositEvent.forEach(item => {
            item.createTime = blockNumbers[item.blockNumber]
        })
        return { blockHashs, mint: _.sortBy(allMint, ["blockNumber", "transferIndex"]), deploy: _.sortBy(allDeploy, ["blockNumber", "transferIndex"]), transfer: _.sortBy(allTransfer, ["blockNumber", "transferIndex"]), depositSuccess: _.sortBy(allDepositEvent, ["blockNumber", "transferIndex"]) }
    }
    getHash(blockNumber: number, transfer: order[], deposit: depositEvent[]) {
        let transferStr = ""
        let depositStr = ""
        transfer.forEach(item => {
            transferStr += item.transferHash
        })
        deposit.forEach(item => {
            depositStr += item.orderHash
        })
        return this.web3.utils.keccak256(`${blockNumber}${transferStr}${depositStr}`)
    }
    encodeCollectionId(chainId: number, p: string, tick: string) {
        return this.web3.utils.soliditySha3(this.web3.utils.encodePacked({ value: chainId, type: "uint" }, { value: p, type: "string" }, { value: tick, type: "string" }))
    }
}

export default BlockTx