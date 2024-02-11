import { ApiProperty } from '@nestjs/swagger';

export class ShortenUrlDto {
  @ApiProperty({ example: 'https://facebook.com', description: 'The long URL to shorten' })
  longUrl: string;
}