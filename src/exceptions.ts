import { Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { HttpException } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.BAD_REQUEST;
        // let message = 'Internal server error';
        let message=exception.message;

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