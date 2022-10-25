import { logger } from '../../logger';
import { Base } from './Base';

const cache = new Map<string, Base>();

export async function get<TIds extends string[], TModel extends Base>(
  model: new (...ids: TIds) => TModel,
  ...ids: TIds
) {
  const key = model.name + ':' + ids.join(':');

  if (!cache.has(key)) {
    logger.info('Cache miss on %s', key);
    cache.set(key, new model(...ids));
  }

  const instance = cache.get(key) as TModel;

  await Base.applyEvents(instance);

  return instance;
}
