import { TransformFnParams } from 'class-transformer';

// add bigint support
BigInt.prototype['toJSON'] = function () {
  return this.toString();
};

export function BigIntTransform(params: TransformFnParams) {
  try {
    if (typeof params.value === 'number' || typeof params.value === 'string') {
      return BigInt(params.value);
    } else if (params.value instanceof Array) {
      return params.value.map((value) => BigInt(value));
    }
    return params.value;
  } catch (e) {
    return params.value;
  }
}
