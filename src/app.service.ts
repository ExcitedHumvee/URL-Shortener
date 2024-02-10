import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private urlMappings = new Map<string, { originalUrl: string, stats: any }>();

  getHello(): string {
    return 'Hello World!';
  }

  async shortenUrl(longUrl: string): Promise<string> {
    // Generate short URL and store mapping
    const shortUrl = 'generated_short_url';
    this.urlMappings.set(shortUrl, { originalUrl: longUrl, stats: {} });
    return shortUrl;
  }

  async getOriginalUrl(shortUrl: string): Promise<string> {
    // Retrieve original URL from mapping
    console.log("inside getOriginalUrl service");
    console.log("shortUrl input supplied:"+shortUrl);
    console.log(this.urlMappings);
    const mapping = this.urlMappings.get(shortUrl);
    if (!mapping) {
      throw new Error('Short URL not found');
    }
    // Update statistics
    mapping.stats.accessCount = (mapping.stats.accessCount || 0) + 1;
    // You can add more detailed statistics like access location, user, etc.
    return mapping.originalUrl;
  }

  async getStats(shortUrl: string): Promise<any> {
    // Retrieve statistics for a short URL
    const mapping = this.urlMappings.get(shortUrl);
    if (!mapping) {
      throw new Error('Short URL not found');
    }
    return mapping.stats;
  }

}
