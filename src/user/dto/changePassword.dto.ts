import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class ChangePasswordDto {
  @IsEmail()
  @IsString()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly oldPassword: string;

  @IsString()
  @IsNotEmpty()
  readonly newPassword: string;
}
