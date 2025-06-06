import { TransformFnParams } from 'class-transformer';

export function NumberTransform(params: TransformFnParams) {
  if (!params.value) {
    return params.value;
  }

  if (params.value === 'null' || params.value === 'undefined') {
    return undefined;
  }

  return Number(params.value);
}
