import { logger } from '../../logger';
import { Base } from './Base';

const cache = new Map<string, Base>();

export async function get<TIds extends string[], TModel extends Base>(
  model: new (...ids: TIds) => TModel,
  ...ids: TIds
) {
  let instance = new model(...ids);
  const key = instance.kind + ':' + ids.join(':');

  if (!cache.has(key)) {
    logger.info('Cache miss %s', key);
    cache.set(key, instance);
  }

  instance = cache.get(key) as TModel;

  await Base.applyEvents(instance);

  return instance;
}
