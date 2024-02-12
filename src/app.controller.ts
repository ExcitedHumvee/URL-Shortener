import { Controller, Get, Post, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { ApiBody } from '@nestjs/swagger';
import { ShortenUrlDto } from './app.dto';
import { URLMap } from './URLMap';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('shorten') 
  @ApiBody({ type: ShortenUrlDto })
  async shortenUrl(@Body() body: ShortenUrlDto): Promise < string > {
    return this.appService.shortenUrl(body.longUrl);
  }

  @Get('urls')
    async getAllURLs(): Promise<URLMap[]> {
        return this.appService.getAllURLs();
    }

  @Get(':shortUrl/stats') 
  async getStats(@Param('shortUrl') shortUrl: string) {
    return this.appService.getStats(shortUrl);
  }

  @Get(':shortUrl') // Adjust route path if necessary
  async redirectToOriginal(@Param('shortUrl') shortUrl: string, @Res() res: Response) {
    console.log("inside redirectToOriginal controller");
    const targetUrl = await this.appService.getOriginalUrl(shortUrl) as string;
    res.status(HttpStatus.FOUND).redirect(targetUrl);
  }
}