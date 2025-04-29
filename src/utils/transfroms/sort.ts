import { TransformFnParams } from 'class-transformer';

export function SortTransform(params: TransformFnParams) {
  return (params.value as string)
    .split(',')
    .map((item) => {
      const [key, order] = item.split(':');
      return { key, order: order === 'asc' ? 'asc' : 'desc' };
    })
    .filter((item) => item.key && item.order)
    .map((item) => ({ [item.key]: item.order }));
}
