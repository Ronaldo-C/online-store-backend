import { User } from '.prisma/client';
import { Request } from 'express';

/**
 * admin的request
 */
export type TRequest = Request & {
  user: User;
};
