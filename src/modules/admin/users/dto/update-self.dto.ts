import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateSelfDto extends PartialType(
  OmitType(CreateUserDto, ['userRole', 'name']),
) {}
