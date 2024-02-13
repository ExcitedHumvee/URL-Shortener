import { Controller, Get, Post, Put, Delete, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { AppService, URLMap } from './app.service';
import { Response } from 'express';
import { ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { DeleteUrlDto, GetAllURLsResponseDto, GetStatsResponseDto, ShortenUrlDto, ShortenedUrlResponseDto, UpdateUrlDto } from './dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('shortenUrl') 
  @ApiBody({ type: ShortenUrlDto })
  @ApiResponse({ 
    status: 201,
    description: 'The URL has been successfully shortened.',
    type: ShortenedUrlResponseDto,
  })
  async shortenUrl(@Body() body: ShortenUrlDto): Promise<ShortenedUrlResponseDto> {
    const shortUrl = await this.appService.shortenUrl(body); // Default requestLimit to 0 if not provided
    return shortUrl;
  }

  @Get('urlMaps')
  @ApiResponse({ 
    status: 200,
    description: 'Retrieved all URLs successfully.',
    type: [GetAllURLsResponseDto],
  })
  async getAllURLs(): Promise<GetAllURLsResponseDto[]> {
    const urls = await this.appService.getAllURLs();
    return urls.map(url => new GetAllURLsResponseDto(url)); // Assuming GetAllURLsResponseDto has constructor that accepts URLMap instance
}

  @Get(':shortUrl/statistics') 
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: GetStatsResponseDto,
  })
  async getStats(@Param('shortUrl') shortUrl: string): Promise<GetStatsResponseDto> {
    const stats = await this.appService.getStatistics(shortUrl);
    return new GetStatsResponseDto(stats); // Assuming GetStatsResponseDto has constructor that accepts URLMap instance
  }

  @Get(':shortUrl')
  @ApiParam({
    name: 'shortUrl',
    description: 'The short URL to redirect to the original URL',
    example: 'abcd' // Example short URL
  })
  async redirectToOriginal(@Param('shortUrl') shortUrl: string, @Res() res: Response) {
    console.log("inside redirectToOriginal controller");
    const ipAddress = res.req.ip; // Access the IP address from the request object
    console.log(`Incoming IP address: ${ipAddress}`);
    const targetUrl = await this.appService.getOriginalUrl(shortUrl,ipAddress) as string;
    res.status(HttpStatus.FOUND).redirect(targetUrl);
  }
  
  @Put('urlMap')
  @ApiBody({ type: UpdateUrlDto })
  async updateUrlMap(@Body() updateUrlDto: UpdateUrlDto): Promise<string> {
    return this.appService.updateUrlMap(updateUrlDto);
  }

  @Delete('urlMap')
  @ApiBody({ type: DeleteUrlDto })
  async deleteUrlMap(@Body() deleteUrlDto: DeleteUrlDto): Promise<string> {
    return this.appService.deleteUrlMap(deleteUrlDto.shortURL);
  }
}