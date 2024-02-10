import { Controller, Get, Post, Body, Param, Redirect } from '@nestjs/common';
import { AppService } from './app.service'; // Update import path

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('shorten') // Adjust route path if necessary
  async shortenUrl(@Body() longUrl: string): Promise<string> {
    return this.appService.shortenUrl(longUrl);
  }

  //Not working
  @Get(':shortUrl') // Adjust route path if necessary
  @Redirect()
  async redirectToOriginal(@Param('shortUrl') shortUrl: string) {
    console.log("inside redirectToOriginal controller");
    const originalUrl = await this.appService.getOriginalUrl(shortUrl);
    return { url: originalUrl };
  }

  @Get(':shortUrl/stats') // Adjust route path if necessary
  async getStats(@Param('shortUrl') shortUrl: string) {
    return this.appService.getStats(shortUrl);
  }
}
