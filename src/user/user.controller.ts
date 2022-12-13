import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signUp')
  signUp(@Body() userDto: UserDto) {
    return this.userService.signUp(userDto);
  }

  @Post('signIn')
  signIn(@Body() userDto: UserDto) {
    return this.userService.signIn(userDto);
  }

  @Get()
  findAllUsers() {
    return this.userService.findAllUsers();
  }

  @Get(':id')
  findOneUser(@Param('id') id: number) {
    return this.userService.findOneUser(Number(id));
  }

  @Patch('changeInfo')
  changeInfo(@Body() userDto: Partial<UserDto>) {
    return this.userService.changeInfo(userDto);
  }

  @Patch('changePassword')
  changePassword(@Body() passwordDto: ChangePasswordDto) {
    return this.userService.changePassword(passwordDto);
  }

  @Patch('upload/:id')
  uploadAvatar(@Body() userDto: Partial<UserDto>, @Param('id') id: number) {
    return this.userService.uploadAvatar(id, userDto);
  }
}
