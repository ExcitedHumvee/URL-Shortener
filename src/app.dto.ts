import { ApiProperty } from '@nestjs/swagger';

export class ShortenUrlDto {
  @ApiProperty({ example: 'https://facebook.com', description: 'The long URL to shorten' })
  longUrl: string;
  @ApiProperty({ required: false })
  aliasURL?: string; // Optional alias URL field
  @ApiProperty({ required: false, default: 0 })
  requestLimit?: number; // Include requestLimit with default value 0
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