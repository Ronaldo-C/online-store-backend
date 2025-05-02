import { registerDecorator, ValidationOptions } from 'class-validator';
import { ERROR_BAD_REQUEST_MESSAGE_CODE } from 'src/typeDefs/error-code';

function isBigInt(value: unknown): value is bigint {
  return typeof value === 'bigint';
}

export function IsBigInt(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isLongerThan',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: `$property|${ERROR_BAD_REQUEST_MESSAGE_CODE.MUST_BIGINT}`,
        ...validationOptions,
      },
      validator: {
        validate: (value): boolean => isBigInt(value),
      },
    });
  };
}
