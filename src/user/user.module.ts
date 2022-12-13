import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EmailConfirmationService } from './emailConfirmation.service';
import { EmailConfirmationController } from './emailConformation.controller';

@Module({
	imports: [
		JwtModule.register({
		  secret: process.env.JWT_SECRET,
		  signOptions: { expiresIn: process.env.JWT_EXPIRE_TIME },
		}),
		TypeOrmModule.forFeature([User]),
	  ],
  controllers: [UserController, EmailConfirmationController],
  providers: [UserService, EmailConfirmationService]
})
export class UserModule {}
