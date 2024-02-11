import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Res,
	HttpStatus
} from '@nestjs/common';
import {
	AppService
} from './app.service'; // Update import path
import {
	Response
} from 'express';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	getHello(): string {
		return this.appService.getHello();
	}

	@Post('shorten') // Adjust route path if necessary
	async shortenUrl(@Body('longUrl') longUrl: string): Promise < string > {
		return this.appService.shortenUrl(longUrl);
	}

	@Get('redirect-to-facebook')
	async redirectToFacebook(@Res() res: Response) {
		const targetUrl = 'http://facebook.com';
		console.log(targetUrl);
		console.log(typeof targetUrl);
		res.status(HttpStatus.FOUND).redirect(targetUrl);
	}

	@Get(':shortUrl') // Adjust route path if necessary
	async redirectToOriginal(@Param('shortUrl') shortUrl: string, @Res() res: Response) {
		console.log("inside redirectToOriginal controller");
		const targetUrl = await this.appService.getOriginalUrl(shortUrl) as string;
		res.status(HttpStatus.FOUND).redirect(targetUrl);
	}

	@Get(':shortUrl/stats') // Adjust route path if necessary
	async getStats(@Param('shortUrl') shortUrl: string) {
		return this.appService.getStats(shortUrl);
	}
}