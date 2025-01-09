import { ErrorCode } from "../enums/error-code";
import { AppError } from "./app-error";
import { HTTP_STATUS, HttpStatusCode } from "./http-status-code";

export class NotFoundException extends AppError {
  constructor(message: string = "Resource Not Found", errorCode?: ErrorCode) {
    super(
      message,
      HTTP_STATUS.NOT_FOUND,
      errorCode || ErrorCode.RESOURCE_NOT_FOUND
    );
  }
}
export class BadRequestException extends AppError {
  constructor(message: string = "Bad Request", errorCode?: ErrorCode) {
    super(message, HTTP_STATUS.BAD_REQUEST, errorCode || ErrorCode.BAD_REQUEST);
  }
}
export class UnauthorizedException extends AppError {
  constructor(message: string = "Unauthorized Access", errorCode?: ErrorCode) {
    super(
      message,
      HTTP_STATUS.UNAUTHORIZED,
      errorCode || ErrorCode.ACCESS_UNAUTHORIZED
    );
  }
}
export class InternalServerException extends AppError {
  constructor(
    message: string = "Internal Server Error",
    errorCode?: ErrorCode
  ) {
    super(
      message,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      errorCode || ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
export class HttpException extends AppError {
  constructor(
    message = "Http Exception Error",
    statusCode: HttpStatusCode,
    errorCode?: ErrorCode
  ) {
    super(message, statusCode, errorCode);
  }
}
