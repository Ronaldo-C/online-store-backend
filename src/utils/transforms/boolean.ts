import { TransformFnParams } from 'class-transformer';

export function BooleanTransform(params: TransformFnParams) {
  if (params.value) {
    if (typeof params.value === 'string') {
      if (!params.value) return false;
      if (params.value === '0' || params.value === 'false') {
        return false;
      } else {
        return true;
      }
    }
    if (typeof params.value === 'number') {
      return Boolean(params.value);
    }
  }
  if (params.value === '') {
    return undefined;
  }

  return params.value;
}
