import { ApiProperty } from '@nestjs/swagger';
import { URLMap } from './app.service';

export class ShortenUrlDto {
  @ApiProperty({ example: 'https://facebook.com', description: 'The long URL to shorten' })
  longUrl: string;

  @ApiProperty({ required: false })
  aliasURL?: string;

  @ApiProperty({ required: false, default: 0 })
  requestLimit?: number;
}

export class UpdateUrlDto {
  @ApiProperty({ description: 'Short URL to update', required: true })
  shortURL: string;

  @ApiProperty({ description: 'Request limit', required: false, default: 0 })
  requestLimit?: number = 0;

  @ApiProperty({ description: 'Alias URL', required: false, default: null })
  alias?: string = null;
}

export class DeleteUrlDto {
  @ApiProperty({ description: 'Short URL to delete', required: true })
  shortURL: string;
}

export class ShortenedUrlResponseDto {
  @ApiProperty({ example: 'abcd', description: 'The shortened URL' })
  shortUrl: string;
}

export class GetAllURLsResponseDto {
  @ApiProperty({ example: 1, description: 'The ID of the URL' })
  id: number;

  @ApiProperty({ example: 'abc', description: 'The short URL' })
  shortURL: string;

  @ApiProperty({ example: 'https://www.example.com/long-url', description: 'The long URL' })
  longURL: string;

  @ApiProperty({ example: 0, description: 'The visitor count of the URL' })
  visitorCount: number;

  @ApiProperty({ example: 'alias', description: 'The alias URL' })
  aliasURL: string | null;

  @ApiProperty({ example: true, description: 'Indicates whether the URL is active' })
  isActive: boolean;

  constructor(data: URLMap) {
    this.id = data.id;
    this.shortURL = data.shortURL;
    this.longURL = data.longURL;
    this.visitorCount = data.visitorCount;
    this.aliasURL = data.aliasURL;
    this.isActive = data.isActive;
  }
}

export class GetStatsResponseDto {
  @ApiProperty({ example: 1, description: 'The ID of the URL' })
  id: number;

  @ApiProperty({ example: 'abc', description: 'The short URL' })
  shortURL: string;

  @ApiProperty({ example: 'https://www.example.com/long-url', description: 'The long URL' })
  longURL: string;

  @ApiProperty({ example: 0, description: 'The visitor count of the URL' })
  visitorCount: number;

  @ApiProperty({ example: 'alias', description: 'The alias URL' })
  aliasURL: string | null;

  @ApiProperty({ example: true, description: 'Indicates whether the URL is active' })
  isActive: boolean;

  constructor(data: URLMap) {
    this.id = data.id;
    this.shortURL = data.shortURL;
    this.longURL = data.longURL;
    this.visitorCount = data.visitorCount;
    this.aliasURL = data.aliasURL;
    this.isActive = data.isActive;
  }
}