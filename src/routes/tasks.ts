import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import z from 'zod'
import { knex } from '../database'

interface Task {
  id: string
  title: string
  description: string
  completed_at: string
  created_at: string
  updated_at: string
}

export async function tasksRoutes(app: FastifyInstance) {
  app.get('/', async (_, reply) => {
    const tasks = await knex('tasks').select()
    return reply.status(201).send({
      tasks,
    })
  })

  app.post('/', async (request, reply) => {
    const taskBodySchema = z.object({
      title: z.string(),
      description: z.string(),
    })

    const { title, description } = taskBodySchema.parse(request.body)

    await knex('tasks').insert({
      id: randomUUID(),
      title,
      description,
      created_at: new Date().toISOString(),
      updated_at: null,
      completed_at: null,
    })

    return reply.status(201).send()
  })

  app.put('/:id', async (request, reply) => {
    const taskBodySchema = z.object({
      title: z.string().nullish(),
      description: z.string().nullish(),
    })

    const taskIdSchema = z.object({
      id: z.string(),
    })

    const { title, description } = taskBodySchema.parse(request.body)
    const { id } = taskIdSchema.parse(request.params)

    const taskExist = await knex<Task>('tasks').select().where('id', '=', id)

    if (taskExist.length === 0) {
      return reply.status(404).send({
        message: 'Task not found!',
      })
    }

    if (taskExist[0].completed_at !== null) {
      return reply.status(400).send({
        message: 'Task already done!',
      })
    }

    await knex('tasks').where('id', '=', id).update({
      title,
      description,
      updated_at: new Date().toISOString(),
    })

    return reply.status(201).send({
      message: 'Task updated with success',
    })
  })

  app.patch('/:id/complete', async (request, reply) => {
    const taskIdSchema = z.object({
      id: z.string(),
    })

    const { id } = taskIdSchema.parse(request.params)

    const taskExist = await knex<Task>('tasks').select().where('id', '=', id)

    if (taskExist.length === 0) {
      return reply.status(404).send({
        message: 'Task not found!',
      })
    }

    if (taskExist[0].completed_at !== null) {
      return reply.status(400).send({
        message: 'Task already done!',
      })
    }

    await knex('tasks').where('id', '=', id).update({
      completed_at: new Date().toISOString(),
    })

    reply.status(201).send({
      message: 'Task completed with success',
    })
  })

  app.delete('/:id', async (request, reply) => {
    const taskIdSchema = z.object({
      id: z.string(),
    })

    const { id } = taskIdSchema.parse(request.params)

    const existTask = await knex('tasks').select().where('id', '=', id)

    if (existTask.length === 0) {
      return reply.status(404).send({
        message: 'Task not found!',
      })
    }

    await knex('tasks').delete().where('id', '=', id)

    return reply.status(201).send({
      message: 'Task deleted with success!',
    })
  })
}
