import { IUser } from '@/models/User'

/**
 * Augment Express's Request interface so that `req.user` is properly typed
 * as the MongoDB IUser document (attached by verifyAuth middleware).
 */
declare global {
  namespace Express {
    interface Request {
      /**
       * Populated by `verifyAuth` middleware.
       * Undefined on unauthenticated routes — always use behind verifyAuth.
       */
      user?: IUser
    }
  }
}
