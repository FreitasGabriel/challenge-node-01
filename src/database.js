import fs from 'node:fs/promises';

const databasePath = new URL('../db.json', import.meta.url)

export class Database {

    #database = {}

    constructor(){
        fs.readFile(databasePath).then((data) => {
            this.#database = JSON.parse(data)
        }).catch(() => {
            this.#persist()
        })
    }
    
    #persist(){
        fs.writeFile(databasePath, JSON.stringify(this.#database))
    }

    insert(table, data){
        if(Array.isArray(this.#database[table])){
            this.#database[table].push(data)
        }else{
            this.#database[table] = [data]
        }

        this.#persist()

        return data;
    }
    
    select(table){
        const data = this.#database[table] ?? []
        return data
    }

    update(table, id, data){
        const rowIndex = this.#database[table].findIndex((row) => row.id === id)
        const task = this.#database[table].find((task) => task.id === id)

        if(!task){
            return {code: 404, message: "Not Found!"}
        }

        const {created_at, completed_at} = this.#database[table][rowIndex]

        if(rowIndex > -1){
            this.#database[table][rowIndex] = {id, ...data, created_at, completed_at}
            this.#persist();
            return {code: 204, message: "Updated!"}
        }
    }

    done(table, id, data){
        const rowIndex = this.#database[table].findIndex((row) => row.id === id)
        const task = this.#database[table].find((task) => task.id === id)

        if(!task){
            return {code: 404, message: "Not Found!"}
        }

        const {
            title, 
            description, 
            created_at, 
            updated_at
        } = this.#database[table][rowIndex]

        if(rowIndex > -1){
            this.#database[table][rowIndex] = { id, title, description, created_at, updated_at, ...data }
            this.#persist()
            return {code: 204, message: "Done!"}
        }
    }

    delete(table, id){
        const rowIndex = this.#database[table].findIndex((row) => row.id === id);
        const task = this.#database[table].find((task) => task.id === id)

        if(!task){
            return {code: 404, message: "Not Found!"}
        }

        if(rowIndex > -1){
            this.#database[table].splice(rowIndex, 1);
            this.#persist();
            return {code: 204, message: "Deleted!"}
        }
    }


}
