import { ApiProperty } from '@nestjs/swagger';

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