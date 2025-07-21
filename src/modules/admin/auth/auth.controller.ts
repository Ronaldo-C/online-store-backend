import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthGuard } from './auth.guard';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { $Enums } from '.prisma/client';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('reset')
  @UseGuards(AuthGuard)
  @Roles($Enums.UserRole.superAdmin)
  reset(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  @Post('update')
  @UseGuards(AuthGuard)
  update(@Body() body: UpdatePasswordDto) {
    return this.authService.updatePassword(body);
  }
}
