import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
const sgMail = require('@sendgrid/mail');

@Injectable()
export class EmailConfirmationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async sendVerificationLink(email: string) {
    const payload = { email };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRE_TIME,
    });
    const url = `${process.env.CONFIRM_EMAIL}/${token}`;
    const text = `Welcome to the application. To confirm the email address, click here: ${url}`;
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: email,
      from: process.env.SENDER_EMAIL,
      subject: 'Email confirmation',
      text,
    };

    try {
      await sgMail.send(msg);
      console.log('Email sent');
    } catch (error) {
      console.log(error);
    }
  }

  async confirmEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (user.isEmailConfirmed) {
      throw new BadRequestException('Email already confirmed');
    }
    try {
      await this.userRepository.update(
        { email },
        {
          isEmailConfirmed: true,
        },
      );
      console.log('Email is confirmed!');
    } catch (error) {
      console.log(error);
    }
  }

  async decodeConfirmationToken(token: string) {
    try {
      const payload = await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
      throw new BadRequestException();
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Email confirmation token expired');
      }
      throw new BadRequestException('Bad confirmation token');
    }
  }
}
