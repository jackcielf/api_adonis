import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Remember from 'App/Models/Remember'
import Application from '@ioc:Adonis/Core/Application'

import { v4 as uuidv4 } from 'uuid'

export default class RemembersController {
  private validationOptions = {
    types: ['image'],
    size: '2mb',
  }

  public async store({ request, response }: HttpContextContract) {
    const body = request.body()

    const image = request.file('image', this.validationOptions)

    if (image) {
      const imageName = `${uuidv4()}.${image!.extname}`

      await image.move(Application.tmpPath('uploads'), {
        name: imageName,
      })

      body.image = imageName
    }

    const remember = await Remember.create(body)

    response.status(201)

    return {
      message: 'remembero criado com sucesso!',
      data: remember,
    }
  }

  public async index() {
    const remember = await Remember.query().preload('comments')

    return {
      data: remember,
    }
  }

  public async show({ params }: HttpContextContract) {
    const remember = await Remember.findOrFail(params.id)

    await remember.load('comments')

    return {
      data: remember,
    }
  }

  public async destroy({ params }: HttpContextContract) {
    const remember = await Remember.findOrFail(params.id)

    await remember.delete()

    return {
      message: 'remembero excluído com sucesso!',
      data: remember,
    }
  }

  public async update({ params, request }: HttpContextContract) {
    const body = request.body()

    const remember = await Remember.findOrFail(params.id)

    remember.title = body.title
    remember.description = body.description

    if (remember.image != body.image || !remember.image) {
      const image = request.file('image', this.validationOptions)

      if (image) {
        const imageName = `${uuidv4()}.${image!.extname}`

        await image.move(Application.tmpPath('uploads'), {
          name: imageName,
        })

        remember.image = imageName
      }
    }

    await remember.save()

    return {
      message: 'remembero atualizado com sucesso!',
      data: remember,
    }
  }
}
