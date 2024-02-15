import { Controller, Get, Post, Put, Delete, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { AppService, URLMap } from './app.service';
import { Response } from 'express';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeleteUrlDto, GetStatsResponseDto, ShortenUrlDto, ShortenedUrlResponseDto, UpdateUrlDto } from './dto';

@Controller()
@ApiTags('URL Map Controller')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get a welcome message' })
  @ApiResponse({ 
    status: 200,
    description: 'Returns the welcome message.',
    content: {
      'text/html': {
        example: 'Hello World!'
      }
    }
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('shortenUrl') 
  @ApiOperation({ summary: 'Shorten a URL' })
  @ApiBody({ 
    type: ShortenUrlDto,
    description: 'Object containing the URL to be shortened. It must have a "url" property which is a string representing the original URL. Optionally, it can have a "requestLimit" property indicating the limit on the number of requests for the shortened URL. It can also include an "aliasURL" property, which is a string representing a custom alias for the shortened URL.'
  })
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
  @ApiOperation({ summary: 'Get all shortened URLs with their statistics' })
  @ApiResponse({ 
    status: 200,
    description: 'Retrieved all URLs successfully.',
    type: [GetStatsResponseDto],
  })
  async getAllURLs(): Promise<GetStatsResponseDto[]> {
    const urls = await this.appService.getAllURLs();
    return urls.map(url => new GetStatsResponseDto(url)); // Assuming GetAllURLsResponseDto has constructor that accepts URLMap instance
}

  @Get(':shortUrl/statistics') 
  @ApiOperation({ summary: 'Get statistics for a shortened URL' })
  @ApiParam({ 
    name: 'shortUrl', 
    description: 'The short URL or alias for which statistics are requested' // Description for the shortUrl parameter
  })
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
  @ApiOperation({ summary: 'Redirect to the original URL' })
  @ApiParam({
    name: 'shortUrl',
    description: 'The short URL or alias to redirect to the original URL',
    example: 'abcd'
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to the original URL. Does not work in Swagger UI. Try link directly from browser.',
  })
  async redirectToOriginal(@Param('shortUrl') shortUrl: string, @Res() res: Response) {
    console.log("inside redirectToOriginal controller");
    const ipAddress = res.req.ip; // Access the IP address from the request object
    console.log(`Incoming IP address: ${ipAddress}`);
    const targetUrl = await this.appService.getOriginalUrl(shortUrl,ipAddress) as string;
    res.status(HttpStatus.FOUND).redirect(targetUrl);
  }
  
  @Put('urlMap')
  @ApiOperation({ summary: 'Update a URL map' })
  @ApiBody({ type: UpdateUrlDto, description: 'Object containing the updated URL map details.' })
  @ApiResponse({ status: 200, description: 'URL map updated successfully.' })
  async updateUrlMap(@Body() updateUrlDto: UpdateUrlDto): Promise<string> {
    return this.appService.updateUrlMap(updateUrlDto);
  }

  @Delete('urlMap')
  @ApiOperation({ summary: 'Delete a URL map' })
  @ApiBody({ type: DeleteUrlDto, description: 'Object containing the short URL to be deleted.' })
  @ApiResponse({ status: 200, description: 'URL map deleted successfully.' })
  async deleteUrlMap(@Body() deleteUrlDto: DeleteUrlDto): Promise<string> {
    return this.appService.deleteUrlMap(deleteUrlDto.shortURL);
  }

  @Delete('urlMaps/deleteAll')
  @ApiOperation({ summary: 'Delete all URL maps. Warning: all data in DB will be truncated.' })
  @ApiResponse({ 
    status: 200,
    description: 'All URL maps deleted successfully',
  })
  async deleteAllUrlMaps(): Promise<string> {
    return this.appService.deleteAllUrlMaps();
  }
}