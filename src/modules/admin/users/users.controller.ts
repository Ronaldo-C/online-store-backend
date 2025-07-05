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
import { AuthGuard } from '../auth/auth.guard';
import { ParseBigIntPipe } from 'src/utils/parse-pipes/parse-bigint-pipe';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { $Enums } from '@prisma/client';
import { UpdateSelfDto } from './dto/update-self.dto';
import { ListWithSearchDto, PaginatedResponseDto } from 'src/typeDefs/list-dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { SWAGGER_AUTH_USERS } from 'src/constants/swagger';
import { UserEntity } from './entities/user.entity';

@ApiTags('后台管理/用户')
@ApiBearerAuth(SWAGGER_AUTH_USERS.ADMIN_USER)
@UseGuards(AuthGuard)
@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: '用户列表' })
  @ApiOkResponse({
    description: '成功',
    type: PaginatedResponseDto<UserEntity>,
  })
  @Get()
  @Roles($Enums.UserRole.superAdmin)
  list(@Query() listUserDto: ListWithSearchDto) {
    return this.usersService.list(listUserDto);
  }

  @ApiOperation({ summary: '创建用户' })
  @ApiOkResponse({
    description: '成功',
    type: UserEntity,
  })
  @Post()
  @Roles($Enums.UserRole.superAdmin)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // 获取用户自身信息
  @ApiOperation({ summary: '获取用户自身信息' })
  @ApiOkResponse({
    description: '成功',
    type: UserEntity,
  })
  @Get('info')
  info() {
    return this.usersService.info();
  }

  @ApiOperation({ summary: '获取用户详情' })
  @ApiOkResponse({
    description: '成功',
    type: UserEntity,
  })
  @Get(':id')
  @Roles($Enums.UserRole.superAdmin)
  detail(@Param('id') id: bigint) {
    return this.usersService.detail(id);
  }

  // 编辑用户自身信息
  @ApiOperation({ summary: '编辑用户自身信息' })
  @ApiOkResponse({
    description: '成功',
    type: UserEntity,
  })
  @Patch('info')
  updateInfo(@Body() updateSelfDto: UpdateSelfDto) {
    return this.usersService.updateInfo(updateSelfDto);
  }

  @ApiOperation({ summary: '编辑用户' })
  @ApiOkResponse({
    description: '成功',
    type: UserEntity,
  })
  @Patch(':id')
  @Roles($Enums.UserRole.superAdmin)
  update(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: '删除用户' })
  @ApiOkResponse({
    description: '成功',
    type: UserEntity,
  })
  @Delete(':id')
  @Roles($Enums.UserRole.superAdmin)
  remove(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.usersService.remove(id);
  }

  //账号锁定
  @ApiOperation({ summary: '账号锁定' })
  @ApiOkResponse({
    description: '成功',
    type: UserEntity,
  })
  @Patch(':id/lock')
  @Roles($Enums.UserRole.superAdmin)
  lock(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.usersService.lock(id);
  }

  //账号解锁
  @ApiOperation({ summary: '账号解锁' })
  @ApiOkResponse({
    description: '成功',
    type: UserEntity,
  })
  @Patch(':id/unlock')
  @Roles($Enums.UserRole.superAdmin)
  unlock(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.usersService.unlock(id);
  }
}
