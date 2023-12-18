import fs from "fs"
import Database from "better-sqlite3"
import handleLog from "../handleLog"
import path from "path"
class Sqlite3 {
    db: any
    constructor(chainId: number) {
        fs.exists(path.resolve("./db"), (exists) => {
            if (!exists) {
                fs.mkdir(path.resolve("./db"), (err) => {
                    if (!err) {
                        this.db = new Database(path.resolve(`./db/${chainId}_chain_data.db`));
                        this.initialization()
                    } else {
                        console.log(`创建数据库失败，失败原因:${err}`)
                    }
                })
            } else {
                this.db = new Database(path.resolve(`./db/${chainId}_chain_data.db`));
                this.initialization()
            }
        });
    }
    initialization() {
        this.createTransfer()
        this.createBlock()
        this.createCollection()
        this.createHolder()
        this.createConfig()
    }
    createConfig() {
        this.db.prepare(`
        CREATE TABLE IF NOT EXISTS config (
            chainId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            asyncHeight INTEGER NOT NULL DEFAULT 0
          ); 
        `).run()
    }
    createHolder() {
        this.db.prepare(`
        CREATE TABLE IF NOT EXISTS holder (
            addressSalt CHAR(66) NOT NULL PRIMARY KEY,
            chainId INTEGER NOT NULL DEFAULT 0, 
            collectionId CHAR(66) NULL,
            tick TEXT NOT NULL,
            address CHAR(42) NOT NULL,
            lastBlock INTEGER NOT NULL DEFAULT 0, 
            lastTransferIndex INTEGER NOT NULL DEFAULT 0, 
            amount INTEGER NOT NULL DEFAULT 0
          ); 
        `).run()
        this.db.prepare(`CREATE INDEX IF NOT EXISTS address ON holder (address);`).run()
        this.db.prepare(`CREATE INDEX IF NOT EXISTS collectionId ON holder (collectionId);`).run()
        this.db.prepare(`CREATE INDEX IF NOT EXISTS chainId ON holder (chainId);`).run()
    }
    createCollection() {
        this.db.prepare(`
        CREATE TABLE IF NOT EXISTS collection (
            collectionId CHAR(66) NOT NULL PRIMARY KEY,
            decodeCollectionId TEXT NOT NULL,
            chainId INTEGER NOT NULL DEFAULT 0, 
            a CHAR(30) NOT NULL,
            p CHAR(100) NOT NULL,
            op CHAR(100) NOT NULL,
            tick TEXT NOT NULL,
            max INTEGER NOT NULL DEFAULT 0,
            lim INTEGER NOT NULL DEFAULT 0, 
            blockNumber INTEGER NOT NULL DEFAULT 0, 
            transferIndex INTEGER NOT NULL DEFAULT 0,
            totalSupply INTEGER NOT NULL DEFAULT 0,
            lastBlock INTEGER NOT NULL DEFAULT 0, 
            lastTransferIndex INTEGER NOT NULL DEFAULT 0,
            createTime INTEGER NOT NULL DEFAULT 0
          ); 
        `).run()
        this.db.prepare(`CREATE INDEX IF NOT EXISTS tick ON collection (tick);`).run()
        this.db.prepare(`CREATE INDEX IF NOT EXISTS blockNumber ON collection (blockNumber);`).run()
    }
    createBlock() {
        this.db.prepare(`
        CREATE TABLE IF NOT EXISTS block (
            blockHash CHAR(66) NOT NULL PRIMARY KEY,
            chainId INTEGER NOT NULL DEFAULT 0,
            blockNumber INTEGER NOT NULL DEFAULT 0
          );
        `).run()
    }
    createTransfer() {
        this.db.prepare(`
        CREATE TABLE IF NOT EXISTS transfer (
            transferHash CHAR(66) NOT NULL PRIMARY KEY,
            chainId INTEGER NOT NULL DEFAULT 0,
            collectionId CHAR(66) NULL,
            callData TEXT NOT NULL,
            sender CHAR(42) NOT NULL,
            receive CHAR(42) NOT NULL,
            type INTEGER NOT NULL DEFAULT 0,
            blockNumber INTEGER NOT NULL DEFAULT 0,
            transferIndex INTEGER NOT NULL DEFAULT 0,
            amount INTEGER NOT NULL DEFAULT 0,
            status INTEGER NOT NULL DEFAULT 0, 
            isConfirmDeposit INTEGER NOT NULL DEFAULT 0, 
            remark TEXT NULL,
            createTime INTEGER NOT NULL DEFAULT 0
          );
        `).run()
        this.db.prepare(`CREATE INDEX IF NOT EXISTS collectionId ON transfer (collectionId);`).run()
        this.db.prepare(`CREATE INDEX IF NOT EXISTS chainId ON transfer (chainId);`).run()
        this.db.prepare(`CREATE INDEX IF NOT EXISTS sender ON transfer (sender);`).run()
        this.db.prepare(`CREATE INDEX IF NOT EXISTS receive ON transfer (receive);`).run()
        this.db.prepare(`CREATE INDEX IF NOT EXISTS blockNumber ON transfer (blockNumber);`).run()
    }
    getKeys(item: any) {
        if (item) {
            let keys = []
            for (let key in item) {
                keys.push(key)
            }
            return keys.join(",")
        } else {
            return ""
        }
    }
    getValues(item: any) {
        if (item) {
            let keys = []
            for (let key in item) {
                keys.push(`@${key}`)
            }
            return keys.join(",")
        } else {
            return ""
        }
    }
    insert(table: string, item: any) {
        let sql = `INSERT INTO ${table} (${this.getKeys(item)}) VALUES (${this.getValues(item)})`
        let insert = this.db.prepare(sql);
        try {
            insert.run(item)
            return true
        } catch (error) {
            handleLog.log('SqlLogger', error, 10000)
            return false
        }
    }
    update(table: string, item: any) {
        let sql = `REPLACE INTO ${table} (${this.getKeys(item)}) VALUES (${this.getValues(item)})`
        let insert = this.db.prepare(sql);
        try {
            insert.run(item)
            return true
        } catch (error) {
            handleLog.log('SqlLogger', error, 10000)
            return false
        }
    }
    insertList(table: string, list: any[]) {
        return new Promise((resolve) => {
            let sql = `INSERT OR IGNORE INTO ${table} (${this.getKeys(list[0])}) VALUES (${this.getValues(list[0])})`
            let insert = this.db.prepare(sql);
            const insertMany = this.db.transaction((insertList) => {
                for (const item of insertList) insert.run(item);
            });
            try {
                insertMany(list)
                resolve(true)
            } catch (error) {
                handleLog.log('SqlLogger', error, 10000)
                resolve(false)
            }
        })
    }
    updateList(table: string, list: any[]) {
        return new Promise((resolve) => {
            let sql = `REPLACE INTO ${table} (${this.getKeys(list[0])}) VALUES (${this.getValues(list[0])})`;
            let insert = this.db.prepare(sql);
            const insertMany = this.db.transaction((insertList) => {
                for (const item of insertList) insert.run(item);
            });
            try {
                insertMany(list)
                resolve(true)
            } catch (error) {
                handleLog.log('SqlLogger', error, 10000)
                resolve(false)
            }
        })
    }
    select(table: string, where: any[], keys?: string[], order?: string[], limit?: number) {
        return new Promise((resolve) => {
            let whereStr = ''
            let findKey = '*'
            let limitStr = ''
            let orderBy = ''
            if (where.length) {
                whereStr = 'where ' + where.join(" and ")
            }
            if (keys && keys.length) {
                findKey = keys.join(",")
            }
            if (limit) {
                limitStr = `limit 0,${limit}`
            }
            if (order && order.length) {
                orderBy = 'order by ' + order.join(" and ")
            }
            const sql = this.db.prepare(`select ${findKey} from ${table} ${whereStr} ${orderBy} ${limitStr}`);
            const rows = sql.all()
            resolve(rows)
        })
    }
    find(table: string, where: any[], keys?: string[]) {
        return new Promise((resolve) => {
            let whereStr = ''
            let findKey = '*'
            if (where.length) {
                whereStr = 'where ' + where.join(" and ")
            }
            if (keys) {
                findKey = keys.join(",")
            }
            const sql = this.db.prepare(`select ${findKey} from ${table} ${whereStr}`);
            const row = sql.get()
            resolve(row)
        })
    }
    batchQuery(table: string, key: string, list: any[], field: string[] = []) {
        return new Promise((resolve) => {
            let sql = `select ${field.length ? field.join(",") : '*'} from ${table} where ${key} in (${list.join(",")})`
            let batchQuery = this.db.prepare(sql);
            try {
                const row = batchQuery.all()
                resolve(row)
            } catch (error) {
                handleLog.log('SqlLogger', error, 10000)
                resolve([])
            }
        })
    }
}

export default Sqlite3