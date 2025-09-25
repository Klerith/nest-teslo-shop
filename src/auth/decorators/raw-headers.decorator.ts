import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const getRawHeaders = (data: string, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return req.rawHeaders;
};

export const RawHeaders = createParamDecorator(getRawHeaders);
