import { TagService } from '@/services/tag.service'
import { Tag } from '@/models/Tag'
import { Prompt } from '@/models/Prompt'
import { AppError } from '@/middlewares/errorHandler'
import { Types } from 'mongoose'

jest.mock('@/models/Tag', () => ({
  Tag: {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}))

jest.mock('@/models/Prompt', () => ({
  Prompt: {
    updateMany: jest.fn(),
  },
}))

const mockFind = Tag.find as jest.Mock
const mockFindOne = Tag.findOne as jest.Mock
const mockFindById = Tag.findById as jest.Mock
const mockCreate = Tag.create as jest.Mock
const mockFindByIdAndDelete = Tag.findByIdAndDelete as jest.Mock
const mockUpdateMany = Prompt.updateMany as jest.Mock

describe('TagService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getTags', () => {
    it('returns all tags when no type is provided', async () => {
      const chainMock = { sort: jest.fn().mockResolvedValue([{ name: 'React' }]) }
      mockFind.mockReturnValue(chainMock)

      const tags = await TagService.getTags()

      expect(mockFind).toHaveBeenCalledWith({})
      expect(chainMock.sort).toHaveBeenCalledWith({ name: 1 })
      expect(tags).toHaveLength(1)
    })

    it('filters tags by type', async () => {
      const chainMock = { sort: jest.fn().mockResolvedValue([{ name: 'React', type: 'tool' }]) }
      mockFind.mockReturnValue(chainMock)

      await TagService.getTags('tool')

      expect(mockFind).toHaveBeenCalledWith({ type: 'tool' })
    })
  })

  describe('createTag', () => {
    it('creates a new tag', async () => {
      mockFindOne.mockResolvedValue(null)
      mockCreate.mockResolvedValue({ name: 'ChatGPT', type: 'tool' })

      const result = await TagService.createTag({ name: 'ChatGPT', type: 'tool' })

      expect(mockFindOne).toHaveBeenCalledWith({ name: 'ChatGPT' })
      expect(mockCreate).toHaveBeenCalledWith({ name: 'ChatGPT', type: 'tool' })
      expect(result.name).toBe('ChatGPT')
    })

    it('throws 400 if tag with same name exists', async () => {
      mockFindOne.mockResolvedValue({ name: 'ChatGPT' })

      await expect(TagService.createTag({ name: 'ChatGPT', type: 'tool' })).rejects.toThrow(AppError)
      await expect(TagService.createTag({ name: 'ChatGPT', type: 'tool' })).rejects.toMatchObject({
        statusCode: 400,
        message: 'Tag with this name already exists',
      })
    })
  })

  describe('updateTag', () => {
    it('updates a tag successfully', async () => {
      const tagMock = { name: 'OldName', type: 'tool', save: jest.fn() } as unknown as any
      mockFindById.mockResolvedValue(tagMock)
      mockFindOne.mockResolvedValue(null) // No name collision

      const result = await TagService.updateTag('someId', { name: 'NewName', color: '#fff' })

      expect(mockFindById).toHaveBeenCalledWith('someId')
      expect(mockFindOne).toHaveBeenCalledWith({ name: 'NewName' })
      expect(tagMock.name).toBe('NewName')
      expect(tagMock.color).toBe('#fff')
      expect(tagMock.save).toHaveBeenCalled()
      expect(result).toBe(tagMock)
    })

    it('throws 404 if tag is not found', async () => {
      mockFindById.mockResolvedValue(null)

      await expect(TagService.updateTag('invalidId', { name: 'NewName' })).rejects.toThrow(AppError)
    })

    it('throws 400 if new name collides with another tag', async () => {
      const tagMock = { name: 'OldName', type: 'tool', save: jest.fn() } as unknown as any
      mockFindById.mockResolvedValue(tagMock)
      mockFindOne.mockResolvedValue({ name: 'NewName', _id: 'otherId' }) // Collision

      await expect(TagService.updateTag('someId', { name: 'NewName' })).rejects.toMatchObject({
        statusCode: 400,
        message: 'Tag with this name already exists',
      })
    })
  })

  describe('deleteTag', () => {
    it('deletes tag and removes from prompts', async () => {
      mockFindById.mockResolvedValue({ name: 'ToDelete' })
      const id = new Types.ObjectId().toString()

      await TagService.deleteTag(id)

      expect(mockFindByIdAndDelete).toHaveBeenCalledWith(id)
      expect(mockUpdateMany).toHaveBeenCalledWith({ tags: id }, { $pull: { tags: id } })
    })

    it('throws 404 if tag not found for deletion', async () => {
      mockFindById.mockResolvedValue(null)
      const id = new Types.ObjectId().toString()

      await expect(TagService.deleteTag(id)).rejects.toMatchObject({ statusCode: 404 })
      expect(mockFindByIdAndDelete).not.toHaveBeenCalled()
    })
  })
})
