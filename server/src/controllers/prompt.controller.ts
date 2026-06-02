import { Request, Response, NextFunction } from 'express'
import { PromptService } from '@/services/prompt.service'

export const getPromptsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      type: req.query.type as 'image' | 'video' | undefined,
      search: req.query.search as string,
    }
    const result = await PromptService.getPrompts(filters)
    res.status(200).json({ status: 'success', data: result })
  } catch (error) {
    next(error)
  }
}


export const getPromptBySlugController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prompt = await PromptService.getPromptBySlug(req.params.slug as string)
    res.status(200).json({ status: 'success', data: { prompt } })
  } catch (error) {
    next(error)
  }
}

export const createPromptController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prompt = await PromptService.createPrompt(req.body)
    res.status(201).json({ status: 'success', data: { prompt } })
  } catch (error) {
    next(error)
  }
}

export const updatePromptController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prompt = await PromptService.updatePrompt(req.params.id as string, req.body)
    res.status(200).json({ status: 'success', data: { prompt } })
  } catch (error) {
    next(error)
  }
}

export const deletePromptController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await PromptService.deletePrompt(req.params.id as string)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

export const incrementCopyCountController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prompt = await PromptService.incrementCopyCount(req.params.id as string)
    res.status(200).json({ status: 'success', data: { prompt } })
  } catch (error) {
    next(error)
  }
}
