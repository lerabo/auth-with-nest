import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { TokenTypes, UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { EmailConfirmationService } from './emailConfirmation.service';

const SALT_NUMBER = 8;

@Injectable()
export class UserService {
  httpService: any;
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly jwtService: JwtService,
    private readonly emailConfirmationService: EmailConfirmationService,
	) {}

	async signUp(userDto: UserDto): Promise<User> {
		const { firstName, lastName, password, email } = userDto;
		const alreadyExist = await this.userRepository.findOneBy({ email });
		if (alreadyExist) {
			throw new HttpException(
				{
					status: HttpStatus.BAD_REQUEST,
					error: 'This email already exist.',
				},
				HttpStatus.BAD_REQUEST,
			);
		}
		const hashedPassword = await bcrypt.hash(password, SALT_NUMBER);
    await this.emailConfirmationService.sendVerificationLink(email);
    return await this.userRepository.save({ firstName, lastName, email, password: hashedPassword });
  }

  async signIn(userDto: UserDto): Promise<TokenTypes> {
    const { email, password } = userDto;
    const user: User = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: "There isn't such account",
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Incorrect password',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const access_token = this.jwtService.sign(
      { id: user.id, email: user.email },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRE_TIME,
      },
    );
    return { access_token, id: user.id };
  }

  async findAllUsers() {
	const users = await this.userRepository
		.createQueryBuilder('user')
		.getMany();
	return users;
  }

  async findOneUser(id: number) {
    const user = await this.userRepository
		.createQueryBuilder('user')
		.where('user.id LIKE :id', { id })
		.getOne();
	return user;
  }

  async changeInfo(userDto: Partial<UserDto>) {
    const { firstName, lastName, email } = userDto;
    const user = await this.userRepository.findOneBy({ email });
    user.firstName = firstName;
    user.lastName = lastName;
    return await this.userRepository.save(user);
  }

  async changePassword(passwordDto: ChangePasswordDto) {
    const { email, oldPassword, newPassword } = passwordDto;
    const user = await this.userRepository.findOneBy({ email: email });
    const isCorrect = bcrypt.compareSync(oldPassword, user.password);
    if (!isCorrect) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Incorrect old password',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (oldPassword === newPassword) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Old and new password the same',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const password = bcrypt.hashSync(newPassword, SALT_NUMBER);
    await this.userRepository.update({ email: email }, { password: password });
    return {email, password};
  }

  async uploadAvatar(id, userDto: Partial<UserDto>){
    const user = await this.userRepository.findOneBy({id});
    if (!user) {
      throw 'User not found';
    }
    user.avatar = userDto.avatar;
    return await this.userRepository.save(user);
  }
}
