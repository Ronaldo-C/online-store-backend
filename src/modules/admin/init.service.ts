import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import * as crypto from 'crypto';
import { $Enums } from '@prisma/client';

@Injectable()
export class InitService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  private signature(dto: { identifier: string; password: string }) {
    const hash = crypto.createHash('sha256');
    return hash.update(`${dto.identifier}_${dto.password}`).digest('hex');
  }

  async onModuleInit() {
    console.info('onModuleInit');
    const exist = await this.prisma.user.findFirst({
      where: {
        name: 'admin',
      },
    });

    if (!exist) {
      await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: 'admin',
            username: 'admin',
            userRole: $Enums.UserRole.superAdmin,
            password: this.signature({
              identifier: 'admin',
              password: '123456',
            }),
          },
        });
        const userId = user.id;
        await tx.user.update({
          where: {
            id: userId,
          },
          data: {
            operatedBy: userId,
          },
        });
        return user;
      });
    }
  }
}
