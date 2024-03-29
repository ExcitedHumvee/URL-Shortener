import { Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { HttpException } from '@nestjs/common';

/**
 * This file defines custom exception filters and exception classes for handling various error scenarios in the application.
 */
@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch (exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse < Response > ();

    //generic status and message being set, not good practice
    let status = HttpStatus.BAD_REQUEST;
    let message = exception.message;


    if (exception.response && exception.response.message) {
      message = exception.response.message;
    } else if (exception.errors && exception.errors.length >= 1) {
      message = exception.errors.map((error: any) => error.message).join(' ');
    }

    // if (exception.response && exception.response.message) {
    //   message = exception.response.message;
    // }else if(exception.errors && exception.errors.length>=1){
    //   message="";
    //   exception.errors.forEach(element => {
    //     message=message+element.message+" ";
    //   });
    // }
    //need exception.response.message

    // let message = 'Internal server error';
    // if (exception instanceof AliasConflictException) {
    //     status = HttpStatus.BAD_REQUEST;
    //     message = exception.message;
    // }

    // if (exception instanceof AliasConflictException) {
    //     status = HttpStatus.BAD_REQUEST;
    //     message = exception.message;
    // }

    // if (exception instanceof AliasConflictException) {
    //     status = HttpStatus.BAD_REQUEST;
    //     message = exception.message;
    // }

    response.status(status).json({
      statusCode: status,
      message: message,
    });
  }
}

/**
 * Custom exception classes
 */
export class InvalidURLException extends HttpException {
  constructor() {
    super('Invalid URL format', HttpStatus.BAD_REQUEST);
  }
}

export class AliasConflictException extends HttpException {
  constructor() {
    super('Alias URL cannot be the same as an existing short URL', HttpStatus.BAD_REQUEST);
  }
}

export class InvalidRequestLimitException extends HttpException {
  constructor() {
    super('Request limit must be greater than or equal to 0.', HttpStatus.BAD_REQUEST);
  }
}

export class EmptyShortUrlException extends HttpException {
  constructor() {
    super('Short URL cannot be empty or null', HttpStatus.BAD_REQUEST);
  }
}

export class ShortUrlNotFoundException extends HttpException {
  constructor() {
    super('Short URL cannot be found', HttpStatus.BAD_REQUEST);
  }
}

export class ShortUrlOrAliasNotFoundException extends HttpException {
  constructor() {
    super('Short URL or alias not found', HttpStatus.BAD_REQUEST);
  }
}

export class RequestLimitReachedException extends HttpException {
  constructor() {
    super('Request limit reached for this URL', HttpStatus.BAD_REQUEST);
  }
}
export class DeletedLinkException extends HttpException {
  constructor() {
    super('This link has been deleted', HttpStatus.BAD_REQUEST);
  }
}