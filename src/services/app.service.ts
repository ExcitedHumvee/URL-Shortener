import { Injectable, Logger } from '@nestjs/common';
import { Sequelize, Transaction } from 'sequelize';
import { ShortenUrlDto, ShortenedUrlResponseDto, UpdateUrlDto } from '../controllers/dto/dto';
import * as Exceptions from '../exceptions';
import { URLMap, initializeURLMapModel } from '../models/url-map.model';

@Injectable()
export class AppService {
  private sequelize: Sequelize;
  private urlMap: typeof URLMap;
  private readonly logger = new Logger(AppService.name);

  constructor() {
    // Initialize Sequelize
    this.sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: 'database.sqlite', // or :memory:
      logging: false,
    });

    // Initialize URLMap model
    initializeURLMapModel(this.sequelize);

    // Synchronize the model with the database
    this.sequelize.sync();
    this.urlMap = URLMap;
  }

  async onModuleDestroy() {
    // Close the database connection when the module is destroyed
    await this.sequelize.close();
  }

  /**
   * Get a welcome message.
   * @returns A welcome message string.
   */
  getHello(): string {
    return 'Hello World!';
  }

  /**
   * Validate if a given URL is in a valid format.
   * @param url The URL to validate.
   * @returns A boolean indicating whether the URL is valid.
   */
  private isValidUrl(url: string): boolean {
    const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    return urlRegex.test(url);
  }

  /**
   * Find a URLMap entry by short URL or alias URL.
   * @param shortUrl The short URL or alias URL to search for.
   * @returns A URLMap instance if found, otherwise null.
   */
  private async findMapByShortUrlAndAlias(shortUrl: string): Promise < URLMap | null > {
    // Find in DB shortURL
    let map = await this.urlMap.findOne({
      where: {
        shortURL: shortUrl
      }
    });
    if (!map) {
      // Find in DB alias
      map = await this.urlMap.findOne({
        where: {
          aliasURL: shortUrl
        }
      });
    }
    return map;
  }

  /**
   * Shorten a URL by generating a unique short URL.
   * @param dto The DTO containing information for URL shortening.
   * @returns A DTO containing the shortened URL.
   * @throws InvalidURLException if the provided URL is invalid.
   * @throws AliasConflictException if the provided alias conflicts with an existing short URL.
   * @throws InvalidRequestLimitException if the provided request limit is invalid.
   */
  async shortenUrl(dto: ShortenUrlDto): Promise < ShortenedUrlResponseDto > {
    if (!this.isValidUrl(dto.longUrl)) {
      throw new Exceptions.InvalidURLException();
    }

    if (dto.requestLimit != null && dto.requestLimit < 0) {
      throw new Exceptions.InvalidRequestLimitException();
    }

    let transaction: Transaction;
    try {
      // Begin transaction
      transaction = await this.sequelize.transaction();

      // Check if aliasURL exists in shortURL
      const existingMap = await this.urlMap.findOne({
        where: {
          shortURL: dto.aliasURL
        },
        transaction
      });
      if (existingMap) {
        throw new Exceptions.AliasConflictException();
      }

      // Generate short URL and store mapping with requestLimit
      const shortUrl = [...Array(5)].map(() => Math.random().toString(36)[2]).join('');
      await this.urlMap.create({
        shortURL: shortUrl,
        longURL: dto.longUrl,
        visitorCount: 0,
        aliasURL: dto.aliasURL || null,
        requestLimit: dto.requestLimit,
      }, {
        transaction
      });

      // Commit transaction
      await transaction.commit();

      this.logger.log(`URL shortened: ${dto.longUrl} -> ${shortUrl}`);
      return {
        shortUrl
      };
    } catch (error) {
      // Rollback transaction on error
      if (transaction) await transaction.rollback();
      throw error;
    }
  }


  /**
   * Redirect to the original URL associated with the given short URL.
   * @param shortUrl The short URL to redirect to the original URL.
   * @param ipAddress The IP address of the user making the request.
   * @returns The original URL associated with the short URL.
   * @throws ShortUrlOrAliasNotFoundException if the provided short URL or alias is not found.
   * @throws DeletedLinkException if the URL associated with the short URL is deleted.
   * @throws RequestLimitReachedException if the request limit for the URL is reached.
   */
  async getOriginalUrl(shortUrl: string, ipAddress: string): Promise < string > {
    //Check if shortUrl is present in DB
    const map = await this.findMapByShortUrlAndAlias(shortUrl);
    if (!map) {
      throw new Exceptions.ShortUrlOrAliasNotFoundException();
    }

    // Check if the URL is active
    if (!map.isActive) {
      throw new Exceptions.DeletedLinkException();
    }

    // Check if requestLimit is set and if the visitorCount has reached the limit
    if (map.requestLimit && map.visitorCount >= map.requestLimit) {
      throw new Exceptions.RequestLimitReachedException();
    }

    // Update statistics
    await map.increment('visitorCount');
    // We can add more detailed statistics like access location, user, etc.
    this.logger.log(`Redirecting to original URL: ${shortUrl} -> ${map.longURL}`);
    return map.longURL;
  }

  /**
   * Get statistics(all data in DB) for a shortened URL.
   * @param shortUrl The short URL to retrieve statistics for.
   * @returns Statistics data for the provided short URL.
   * @throws ShortUrlOrAliasNotFoundException if the provided short URL or alias is not found.
   */
  async getStatistics(shortUrl: string): Promise < any > {
    const map = await this.findMapByShortUrlAndAlias(shortUrl);
    if (!map) {
      throw new Exceptions.ShortUrlOrAliasNotFoundException();
    }
    this.logger.log(`Retrieved statistics for URL: ${shortUrl}`);
    return map;
  }

  /**
   * Get all URLs stored in the database.
   * @returns An array of URLMap instances representing all URLs.
   */
  async getAllURLs(): Promise < URLMap[] > {
    // Retrieve all records from the URLMap table
    this.logger.log(`Retrieving all URLs`);
    return await this.urlMap.findAll();
  }

  /**
   * Update an existing URL map entry with new information.
   * @param updateUrlDto The DTO containing information for updating the URL map.
   * @returns A success message indicating the URL map is updated successfully.
   * @throws ShortUrlNotFoundException if the provided short URL is not found.
   * @throws InvalidRequestLimitException if the provided request limit is invalid.
   * @throws AliasConflictException if the provided alias conflicts with an existing short URL.
   */
  async updateUrlMap(updateUrlDto: UpdateUrlDto): Promise < string > {
    const {
      shortURL,
      requestLimit,
      alias
    } = updateUrlDto;
    let transaction: Transaction;
    try {
      transaction = await this.sequelize.transaction();

      // Try to find shortURL in DB
      const urlMapEntry = await this.urlMap.findOne({
        where: {
          shortURL
        },
        transaction
      });
      if (!urlMapEntry) {
        throw new Exceptions.ShortUrlNotFoundException();
      }

      // Update the URLMap entry
      if (requestLimit !== undefined) {
        if (requestLimit < 0) {
          throw new Exceptions.InvalidRequestLimitException();
        }
        urlMapEntry.requestLimit = requestLimit;
      }

      // Check if alias is provided and conflicts with existing shortURL
      if (alias) {
        const existingMap = await this.urlMap.findOne({
          where: {
            shortURL: alias
          },
          transaction
        });
        if (existingMap) {
          throw new Exceptions.AliasConflictException();
        }
        urlMapEntry.aliasURL = alias;
      }

      // Save changes
      await urlMapEntry.save({
        transaction
      });
      // Commit transaction
      await transaction.commit();

      this.logger.log(`URL updated: ${shortURL}`);
      return 'URL updated successfully';
    } catch (error) {
      // Rollback transaction on error
      if (transaction) await transaction.rollback();
      throw error;
    }
  }

  /**
   * Delete an existing URL map entry.
   * @param shortURL The short URL of the entry to delete.
   * @returns A success message indicating the URL map is deleted successfully.
   * @throws ShortUrlNotFoundException if the provided short URL is not found.
   */
  async deleteUrlMap(shortURL: string): Promise < string > {
    let transaction: Transaction;
    try {
      // Begin transaction
      transaction = await this.sequelize.transaction();

      //Check if shortURL present in DB
      const urlMapEntry = await this.urlMap.findOne({
        where: {
          shortURL
        },
        transaction
      });
      if (!urlMapEntry) {
        throw new Exceptions.ShortUrlNotFoundException();
      }

      // Set isActive to false
      urlMapEntry.isActive = false;

      // Save changes
      await urlMapEntry.save({
        transaction
      });

      // Commit transaction
      await transaction.commit();

      this.logger.log(`URL deleted: ${shortURL}`);
      return 'URL deleted successfully';
    } catch (error) {
      // Rollback transaction on error
      if (transaction) await transaction.rollback();
      throw error;
    }
  }

  /**
   * Delete all URL map entries. Truncates all data in DB.
   * @returns A success message indicating all URL maps are deleted successfully.
   */
  async deleteAllUrlMaps(): Promise < string > {
    let transaction: Transaction;
    try {
      // Begin transaction
      transaction = await this.sequelize.transaction();

      // Delete all records from the URLMap table
      await this.urlMap.destroy({
        truncate: true,
        transaction
      });

      // Commit transaction
      await transaction.commit();

      this.logger.log('All URL maps deleted successfully');
      return 'All URL maps deleted successfully';
    } catch (error) {
      // Rollback transaction on error
      if (transaction) await transaction.rollback();
      this.logger.error(`Error deleting URL maps: ${error.message}`);
      throw error;
    }
  }
}
export { URLMap };

