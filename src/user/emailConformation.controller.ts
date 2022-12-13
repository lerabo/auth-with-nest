import {
	Controller,
	ClassSerializerInterceptor,
	UseInterceptors,
	Get,
	Param,
  } from '@nestjs/common';
  import { EmailConfirmationService } from './emailConfirmation.service';
   
  @Controller('email')
  @UseInterceptors(ClassSerializerInterceptor)
  export class EmailConfirmationController {
	constructor(
	  private readonly emailConfirmationService: EmailConfirmationService
	) {}
   
	@Get('verify/:token')
	async confirm(@Param('token') token: string) {
	  const email = await this.emailConfirmationService.decodeConfirmationToken(token);
	  await this.emailConfirmationService.confirmEmail(email);
	}
  }