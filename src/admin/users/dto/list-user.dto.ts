import { IsOptional, IsString } from 'class-validator';
import { ListDto } from 'src/typeDefs/list-dto';

export class ListUserDto extends ListDto {
  @IsString()
  @IsOptional()
  search?: string;
}
