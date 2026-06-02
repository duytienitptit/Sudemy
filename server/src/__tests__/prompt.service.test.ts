import { PromptService } from '@/services/prompt.service'
import { Prompt } from '@/models/Prompt'
import { AppError } from '@/middlewares/errorHandler'

jest.mock('@/models/Prompt', () => {
  return {
    Prompt: {
      find: jest.fn(),
      findOne: jest.fn(),
      countDocuments: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      findByIdAndDelete: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    },
  }
})

const mockFind = Prompt.find as jest.Mock
const mockFindOne = Prompt.findOne as jest.Mock
const mockCountDocuments = Prompt.countDocuments as jest.Mock
const mockFindById = Prompt.findById as jest.Mock
const mockCreate = Prompt.create as jest.Mock
const mockFindByIdAndDelete = Prompt.findByIdAndDelete as jest.Mock
const mockFindByIdAndUpdate = Prompt.findByIdAndUpdate as jest.Mock

describe('PromptService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getPrompts', () => {
    it('returns paginated prompts with default filters', async () => {
      const chainMock = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ title: 'Prompt 1' }, { title: 'Prompt 2' }]),
      }
      mockFind.mockReturnValue(chainMock)
      mockCountDocuments.mockResolvedValue(2)

      const result = await PromptService.getPrompts({})

      expect(mockFind).toHaveBeenCalledWith({})
      expect(chainMock.skip).toHaveBeenCalledWith(0)
      expect(chainMock.limit).toHaveBeenCalledWith(12)
      expect(result.prompts).toHaveLength(2)
      expect(result.pagination.total).toBe(2)
      expect(result.pagination.page).toBe(1)
    })

    it('applies type filters correctly', async () => {
      const chainMock = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      }
      mockFind.mockReturnValue(chainMock)
      mockCountDocuments.mockResolvedValue(0)

      await PromptService.getPrompts({ type: 'image' })

      expect(mockFind).toHaveBeenCalledWith({
        type: 'image',
      })
    })

    it('applies text search filter correctly', async () => {
      const chainMock = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      }
      mockFind.mockReturnValue(chainMock)
      mockCountDocuments.mockResolvedValue(0)

      await PromptService.getPrompts({ search: 'hello' })

      expect(mockFind).toHaveBeenCalledWith({
        title: { $regex: new RegExp('hello', 'i') }
      })
      expect(chainMock.sort).toHaveBeenCalledWith({ createdAt: -1 })
    })
  })

  describe('getPromptBySlug', () => {
    it('returns a prompt if found', async () => {
      mockFindOne.mockResolvedValue({ title: 'Prompt 1', slug: 'prompt-1' })

      const prompt = await PromptService.getPromptBySlug('prompt-1')

      expect(mockFindOne).toHaveBeenCalledWith({ slug: 'prompt-1' })
      expect(prompt.slug).toBe('prompt-1')
    })

    it('throws 404 if prompt not found', async () => {
      mockFindOne.mockResolvedValue(null)

      await expect(PromptService.getPromptBySlug('not-found')).rejects.toThrow(AppError)
    })
  })

  describe('createPrompt', () => {
    it('creates and returns a new prompt', async () => {
      const mockPrompt: any = { title: 'New Prompt' }
      mockCreate.mockResolvedValue(mockPrompt)

      const result = await PromptService.createPrompt({ title: 'New Prompt' })

      expect(mockCreate).toHaveBeenCalledWith({ title: 'New Prompt' })
      expect(result).toBe(mockPrompt)
    })
  })

  describe('updatePrompt', () => {
    it('updates a prompt successfully', async () => {
      const mockPrompt: any = { title: 'Old Title', save: jest.fn() }
      mockFindById.mockResolvedValue(mockPrompt)

      const result = await PromptService.updatePrompt('someId', { title: 'New Title' })

      expect(mockFindById).toHaveBeenCalledWith('someId')
      expect(mockPrompt.title).toBe('New Title')
      expect(mockPrompt.save).toHaveBeenCalled()
      expect(result).toBe(mockPrompt)
    })

    it('throws 404 if prompt not found', async () => {
      mockFindById.mockResolvedValue(null)

      await expect(PromptService.updatePrompt('invalidId', {})).rejects.toThrow(AppError)
    })
  })

  describe('deletePrompt', () => {
    it('deletes a prompt successfully', async () => {
      mockFindByIdAndDelete.mockResolvedValue({ title: 'Deleted Prompt' })

      await PromptService.deletePrompt('someId')

      expect(mockFindByIdAndDelete).toHaveBeenCalledWith('someId')
    })

    it('throws 404 if prompt not found for deletion', async () => {
      mockFindByIdAndDelete.mockResolvedValue(null)

      await expect(PromptService.deletePrompt('invalidId')).rejects.toThrow(AppError)
    })
  })

  describe('incrementCopyCount', () => {
    it('increments copyCount successfully', async () => {
      mockFindByIdAndUpdate.mockResolvedValue({ title: 'Prompt', copyCount: 1 })

      const result = await PromptService.incrementCopyCount('someId')

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith('someId', { $inc: { copyCount: 1 } }, { new: true })
      expect(result.copyCount).toBe(1)
    })

    it('throws 404 if prompt not found for incrementing copy count', async () => {
      mockFindByIdAndUpdate.mockResolvedValue(null)

      await expect(PromptService.incrementCopyCount('invalidId')).rejects.toThrow(AppError)
    })
  })
})
