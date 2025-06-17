import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';

export class UserEntity {
  @ApiProperty({
    description: 'ID',
  })
  id: bigint;

  @ApiProperty({
    description: '用户名称',
  })
  name: string;

  @ApiProperty({
    description: '用户密码',
  })
  password: string;

  @ApiProperty({
    description: '用户邮箱',
  })
  email: string;

  @ApiProperty({
    enum: $Enums.UserStatus,
    description: '用户状态',
  })
  status: $Enums.UserStatus;

  @ApiProperty({
    enum: $Enums.UserRole,
    description: '用户角色',
  })
  userRole: $Enums.UserRole;

  @ApiProperty({
    description: '创建时间',
  })
  createdAt: Date;

  @ApiProperty({
    description: '更新时间',
  })
  updatedAt: Date;

  @ApiProperty({
    description: '删除时间',
  })
  deletedAt: Date;

  @ApiProperty({
    description: '操作人ID',
  })
  operatedBy: string;
}
