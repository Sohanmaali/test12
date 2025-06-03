import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsMongoId()
  @IsNotEmpty()
  sender: string;

  @IsMongoId()
  @IsOptional()
  receiver?: string;

  @IsMongoId()
  @IsOptional()
  group?: string;
}
