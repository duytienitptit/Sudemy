/**
 * Unit tests for UserService
 * ──────────────────────────
 * Strategy: Mock User model and logger. No real MongoDB connection needed.
 */

import { listUsers, updateUserRole } from '@/services/user.service'
import { AppError } from '@/middlewares/errorHandler'
import { User } from '@/models/User'
import { Types } from 'mongoose'
import { IUser } from '@/models/User'

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@/models/User', () => ({
  User: {
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
  },
}))

jest.mock('@/config/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}))

// ─── Typed mock helpers ───────────────────────────────────────────────────────

const mockFind = User.find as jest.Mock
const mockFindById = User.findById as jest.Mock
const mockCountDocuments = User.countDocuments as jest.Mock

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const ADMIN_ID = new Types.ObjectId().toString()
const USER_ID_1 = new Types.ObjectId()
const USER_ID_2 = new Types.ObjectId()

function fakeUser(overrides: Partial<IUser> = {}): IUser & { save: jest.Mock } {
  return {
    _id: USER_ID_1,
    firebaseUid: 'fb-uid-1',
    fullName: 'Nguyễn Văn A',
    email: 'user@example.com',
    role: 'user',
    purchasedCourses: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as IUser & { save: jest.Mock }
}

// ─── listUsers ────────────────────────────────────────────────────────────────

describe('UserService.listUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns paginated users without filters', async () => {
    const users = [
      fakeUser({ _id: USER_ID_1 } as Partial<IUser>),
      fakeUser({ _id: USER_ID_2, fullName: 'Trần Thị B', email: 'b@example.com' } as Partial<IUser>),
    ]

    // Simulate mongoose chained query: find().sort().skip().limit().lean()
    const chainMock = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(users),
    }
    mockFind.mockReturnValue(chainMock)
    mockCountDocuments.mockResolvedValue(2)

    const result = await listUsers({ page: 1, limit: 20, search: undefined, role: undefined })

    expect(mockFind).toHaveBeenCalledWith({})
    expect(chainMock.sort).toHaveBeenCalledWith({ createdAt: -1 })
    expect(chainMock.skip).toHaveBeenCalledWith(0)
    expect(chainMock.limit).toHaveBeenCalledWith(20)
    expect(result.users).toHaveLength(2)
    expect(result.pagination).toEqual({ page: 1, limit: 20, total: 2, totalPages: 1 })
  })

  it('applies search filter (regex on fullName and email)', async () => {
    const chainMock = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    }
    mockFind.mockReturnValue(chainMock)
    mockCountDocuments.mockResolvedValue(0)

    await listUsers({ page: 1, limit: 20, search: 'nguyen', role: undefined })

    const filter = mockFind.mock.calls[0][0]
    expect(filter.$or).toBeDefined()
    expect(filter.$or[0].fullName).toBeInstanceOf(RegExp)
    expect(filter.$or[0].fullName.flags).toContain('i')
    expect(filter.$or[1].email).toBeInstanceOf(RegExp)
  })

  it('applies role filter', async () => {
    const chainMock = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    }
    mockFind.mockReturnValue(chainMock)
    mockCountDocuments.mockResolvedValue(0)

    await listUsers({ page: 1, limit: 10, search: undefined, role: 'editor' })

    const filter = mockFind.mock.calls[0][0]
    expect(filter.role).toBe('editor')
  })

  it('calculates pagination correctly for page 2', async () => {
    const chainMock = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    }
    mockFind.mockReturnValue(chainMock)
    mockCountDocuments.mockResolvedValue(45)

    const result = await listUsers({ page: 2, limit: 20, search: undefined, role: undefined })

    expect(chainMock.skip).toHaveBeenCalledWith(20)
    expect(result.pagination.totalPages).toBe(3)
  })
})

// ─── updateUserRole ───────────────────────────────────────────────────────────

describe('UserService.updateUserRole', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('updates the user role successfully', async () => {
    const user = fakeUser()
    mockFindById.mockResolvedValue(user)

    const targetId = String(USER_ID_1)
    const result = await updateUserRole(targetId, { role: 'editor' }, ADMIN_ID)

    expect(mockFindById).toHaveBeenCalledWith(targetId)
    expect(user.save).toHaveBeenCalled()
    expect(result.user.role).toBe('editor')
    expect(result.user._id).toBe(String(USER_ID_1))
  })

  it('throws 400 INVALID_ID for a non-ObjectId string', async () => {
    await expect(
      updateUserRole('not-a-valid-id', { role: 'editor' }, ADMIN_ID),
    ).rejects.toMatchObject({ statusCode: 400, code: 'INVALID_ID' })
  })

  it('throws 400 SELF_ROLE_CHANGE when requester tries to change their own role', async () => {
    const selfId = USER_ID_1.toString()
    await expect(
      updateUserRole(selfId, { role: 'editor' }, selfId),
    ).rejects.toMatchObject({ statusCode: 400, code: 'SELF_ROLE_CHANGE' })
  })

  it('throws 403 ROLE_ESCALATION when trying to set role to admin', async () => {
    const targetId = USER_ID_1.toString()
    await expect(
      updateUserRole(targetId, { role: 'admin' }, ADMIN_ID),
    ).rejects.toMatchObject({ statusCode: 403, code: 'ROLE_ESCALATION' })
  })

  it('throws 404 USER_NOT_FOUND when target user does not exist in DB', async () => {
    mockFindById.mockResolvedValue(null)
    const targetId = new Types.ObjectId().toString()

    await expect(
      updateUserRole(targetId, { role: 'editor' }, ADMIN_ID),
    ).rejects.toMatchObject({ statusCode: 404, code: 'USER_NOT_FOUND' })
  })

  it('throws AppError instances (not plain errors) so errorHandler can format them', async () => {
    mockFindById.mockResolvedValue(null)
    const targetId = new Types.ObjectId().toString()

    const err = await updateUserRole(targetId, { role: 'moderator' }, ADMIN_ID).catch((e) => e)
    expect(err).toBeInstanceOf(AppError)
  })
})
