import {randomUUID} from "node:crypto"
import { Database } from "./database.js"
import { buildRoutepath } from "./utils/build-route-path.js";
import { hasValue } from "./utils/verify-string.js";

const database = new Database();

export const routes = [
    {
        method: "POST",
        path: buildRoutepath("/tasks"),
        handler: (req, res) => {
            const {title, description} = req.body
            
            if(!hasValue(title) || !hasValue(description)){
                res.writeHead(404).end("Body not Found")
            }

            const task = {
                id: randomUUID(),
                title,
                description,
                completed_at: null,
                created_at: new Date().toISOString(),
                updated_at: null
            }

            database.insert('tasks', task)
            
            return res.writeHead(201).end()
        }
    },
    {
        method: "GET",
        path: buildRoutepath("/tasks"),
        handler: (req, res) => {
            const tasks = database.select('tasks')
            return res.writeHead(201).end(JSON.stringify(tasks))
        }
    },
    {
        method: "PUT",
        path: buildRoutepath("/tasks/:id"),
        handler: (req, res) => {
            const {id} = req.params
            const {title, description} = req.body
            
            if(!hasValue(title) || !hasValue(description)){
                res.writeHead(404).end("Body not Found")
            }

            const {code, message} = database.update('tasks', id, {
                title, 
                description, 
                updated_at: new Date().toISOString()})

            res.writeHead(code).end(message)
        }
    },
    {
        method: "DELETE",
        path: buildRoutepath("/tasks/:id"),
        handler: (req, res) => {
            const {id} = req.params
            const {code, message} = database.delete('tasks', id)

            res.writeHead(code).end(message)
        }
    },
    {
        method: "PATCH",
        path: buildRoutepath("/tasks/:id/complete"),
        handler: (req, res) => {
            const {id} = req.params
            
            const {code, message} = database.done('tasks', id, {completed_at: new Date().toISOString()})

            res.writeHead(code).end(message)
        }
    },
]
