import { $Enums } from '@prisma/client';

export class UserEntity {
  id: bigint;
  name: string;
  password: string;
  email: string;
  status: $Enums.UserStatus;
  userRole: $Enums.UserRole;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  operatedBy: string;
}
