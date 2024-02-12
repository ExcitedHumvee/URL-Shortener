import { Controller, Get, Post, Put, Delete, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { AppService, URLMap } from './app.service';
import { Response } from 'express';
import { ApiBody } from '@nestjs/swagger';
import { DeleteUrlDto, ShortenUrlDto, UpdateUrlDto } from './app.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('shortenUrl') 
  @ApiBody({ type: ShortenUrlDto })
  async shortenUrl(@Body() body: ShortenUrlDto): Promise<string> {
    return this.appService.shortenUrl(body.longUrl, body.aliasURL, body.requestLimit || 0); // Default requestLimit to 0 if not provided
  }

  @Get('urlMaps')
    async getAllURLs(): Promise<URLMap[]> {
        return this.appService.getAllURLs();
    }

  @Get(':shortUrl/visitorCount') 
  async getStats(@Param('shortUrl') shortUrl: string): Promise<URLMap> {
    return this.appService.getVisitorCount(shortUrl);
  }

  @Get(':shortUrl') // Adjust route path if necessary
  async redirectToOriginal(@Param('shortUrl') shortUrl: string, @Res() res: Response) {
    console.log("inside redirectToOriginal controller");
    const ipAddress = res.req.ip; // Access the IP address from the request object
    console.log(`Incoming IP address: ${ipAddress}`);
    const targetUrl = await this.appService.getOriginalUrl(shortUrl,ipAddress) as string;
    res.status(HttpStatus.FOUND).redirect(targetUrl);
  }

  @Put('urlMap')
  async updateUrlMap(@Body() updateUrlDto: UpdateUrlDto): Promise<string> {
    return this.appService.updateUrlMap(updateUrlDto);
  }

  @Delete('urlMap')
  async deleteUrlMap(@Body() deleteUrlDto: DeleteUrlDto): Promise<string> {
    return this.appService.deleteUrlMap(deleteUrlDto.shortURL);
  }
}