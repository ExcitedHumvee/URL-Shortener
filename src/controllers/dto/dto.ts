/**
 * This file defines Data Transfer Objects (DTOs) used for request and response payloads in URL shortening operations.
 * It includes DTOs for creating, updating, and deleting URLs, as well as DTOs for response payloads including shortened URLs and statistics.
 */
import { ApiProperty } from '@nestjs/swagger';
import { URLMap } from '../../services/app.service';
import { IsUrl, IsOptional, IsInt, Min } from 'class-validator';

export class ShortenUrlDto {
  @ApiProperty({ example: 'https://facebook.com', description: 'The long URL to shorten' })
  @IsUrl({}, { message: 'Invalid URL format' })
  longUrl: string;

  @ApiProperty({ required: false })
  @IsOptional()
  aliasURL?: string;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @IsInt({ message: 'Request limit must be an integer' })
  @Min(0, { message: 'Request limit must be greater than or equal to 0' })
  requestLimit?: number;
}

export class UpdateUrlDto {
  @ApiProperty({ description: 'Short URL to update', required: true })
  shortURL: string;

  @ApiProperty({ description: 'Request limit', required: false, default: 0 })
  @IsOptional()
  @IsInt({ message: 'Request limit must be an integer' })
  @Min(0, { message: 'Request limit must be greater than or equal to 0' })
  requestLimit?: number = 0;

  @ApiProperty({ description: 'Alias URL', required: false, default: "" })
  @IsOptional()
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

  @ApiProperty({ example: 0, description: 'The request limit of the URL' })
  requestLimit: number;

  constructor(data: URLMap) {
    this.id = data.id;
    this.shortURL = data.shortURL;
    this.longURL = data.longURL;
    this.visitorCount = data.visitorCount;
    this.aliasURL = data.aliasURL;
    this.isActive = data.isActive;
    this.requestLimit = data.requestLimit;
  }
}
