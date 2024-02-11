import {
	Injectable
} from '@nestjs/common';

interface URLInfo {
	longURL: string;
	statistic: number;
}

class URLMap {
	private map: Map < string, URLInfo > ;

	constructor() {
		this.map = new Map < string, URLInfo > ();
	}

	set(key: string, value: URLInfo): void {
		this.map.set(key, value);
	}

	get(key: string): URLInfo | undefined {
		return this.map.get(key);
	}

	has(key: string): boolean {
		return this.map.has(key);
	}

	delete(key: string): boolean {
		return this.map.delete(key);
	}

	clear(): void {
		this.map.clear();
	}

	get size(): number {
		return this.map.size;
	}

	entries(): IterableIterator < [string, URLInfo] > {
		return this.map.entries();
	}

	keys(): IterableIterator < string > {
		return this.map.keys();
	}

	values(): IterableIterator < URLInfo > {
		return this.map.values();
	}

	forEach(callbackfn: (value: URLInfo, key: string, map: URLMap) => void): void {
		this.map.forEach((value, key) => {
			callbackfn(value, key, this);
		});
	}
}

@Injectable()
export class AppService {
	private urlMap = new URLMap();

	getHello(): string {
		return 'Hello World!';
	}

	async shortenUrl(input: string): Promise < string > {
		// Generate short URL and store mapping
		const shortUrl = "generated_short_url";
		this.urlMap.set(shortUrl, {
			longURL: input,
			statistic: 0
		});
		const record = this.urlMap.get("generated_short_url");
		return shortUrl;
	}

	async getOriginalUrl(shortUrl: string): Promise < string > {
		// Retrieve original URL from mapping
		console.log("inside getOriginalUrl service");
		const map = this.urlMap.get(shortUrl);
		if (!map) {
			throw new Error('Short URL not found');
		}
		// Update statistics
		map.statistic = map.statistic + 1;
		// You can add more detailed statistics like access location, user, etc.
		return map.longURL;
	}

	async getStats(shortUrl: string): Promise < any > {
		// Retrieve statistics for a short URL
		const map = this.urlMap.get(shortUrl);
		if (!map) {
			throw new Error('Short URL not found');
		}
		return map.statistic;
	}
}