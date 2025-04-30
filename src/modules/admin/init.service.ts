import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { AuthService } from './auth/auth.service';
import { $Enums } from '@prisma/client';

@Injectable()
export class InitService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

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
            userRole: $Enums.UserRole.superAdmin,
            password: this.authService.signature({
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
