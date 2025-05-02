import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateSelfDto extends PartialType(
  OmitType(CreateUserDto, ['userRole']),
) {}
