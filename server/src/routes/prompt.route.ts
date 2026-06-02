import { Router } from 'express'
import { validate } from '@/middlewares/validate'
import { verifyAuth, requireRole } from '@/middlewares/auth'
import {
  createPromptSchema,
  updatePromptSchema,
  promptIdParamSchema,
  promptSlugParamSchema,
  listPromptsQuerySchema,
} from '@/validators/prompt.validator'
import {
  getPromptsController,
  getPromptBySlugController,
  createPromptController,
  updatePromptController,
  deletePromptController,
  incrementCopyCountController,
} from '@/controllers/prompt.controller'

const router = Router()

// GET /api/v1/prompts (Public)
router.get('/', validate({ query: listPromptsQuerySchema }), getPromptsController)

// GET /api/v1/prompts/:slug (Public)
router.get('/:slug', validate({ params: promptSlugParamSchema }), getPromptBySlugController)

// POST /api/v1/prompts/:id/copy (Public)
router.post('/:id/copy', validate({ params: promptIdParamSchema }), incrementCopyCountController)

// Protected routes (Admin/Editor)
router.use(verifyAuth, requireRole('admin', 'editor'))

// POST /api/v1/prompts
router.post('/', validate({ body: createPromptSchema }), createPromptController)

// PUT /api/v1/prompts/:id
router.put(
  '/:id',
  validate({ params: promptIdParamSchema, body: updatePromptSchema }),
  updatePromptController,
)

// DELETE /api/v1/prompts/:id
router.delete('/:id', validate({ params: promptIdParamSchema }), deletePromptController)

export default router
