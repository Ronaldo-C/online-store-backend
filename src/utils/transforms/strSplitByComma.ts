import { TransformFnParams } from 'class-transformer';

export function StrSplitByCommaTransform(params: TransformFnParams) {
  if (typeof params.value === 'string') {
    if (params.value) {
      return params.value.split(',');
    }
    return undefined;
  }

  return params.value;
}
