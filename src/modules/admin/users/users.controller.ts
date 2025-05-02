import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUserDto } from './dto/list-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ParseBigIntPipe } from 'src/utils/parse-pipes/parse-bigint-pipe';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { $Enums } from '@prisma/client';
import { UpdateSelfDto } from './dto/update-self.dto';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles($Enums.UserRole.superAdmin)
  list(@Query() listUserDto: ListUserDto) {
    return this.usersService.list(listUserDto);
  }

  @Post()
  @Roles($Enums.UserRole.superAdmin)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get(':id')
  @Roles($Enums.UserRole.superAdmin)
  detail(@Param('id') id: bigint) {
    return this.usersService.detail(id);
  }

  // 获取用户自身信息
  @Get('info')
  info() {
    return this.usersService.info();
  }

  // 编辑用户自身信息
  @Patch('info')
  updateInfo(@Body() updateSelfDto: UpdateSelfDto) {
    return this.usersService.updateInfo(updateSelfDto);
  }

  @Patch(':id')
  @Roles($Enums.UserRole.superAdmin)
  update(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles($Enums.UserRole.superAdmin)
  remove(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.usersService.remove(id);
  }

  //账号锁定
  @Patch(':id/lock')
  @Roles($Enums.UserRole.superAdmin)
  lock(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.usersService.lock(id);
  }

  //账号解锁
  @Patch(':id/unlock')
  @Roles($Enums.UserRole.superAdmin)
  unlock(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.usersService.unlock(id);
  }
}
