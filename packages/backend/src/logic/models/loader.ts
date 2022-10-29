import { logger } from '../../logger';
import { Base } from './Base';

const cache = new Map<string, Promise<Base>>();

export function get<TIds extends string[], TModel extends Base>(
  model: new (...ids: TIds) => TModel,
  ...ids: TIds
) {
  const key = model.name + ':' + ids.join(':');

  if (!cache.has(key)) {
    logger.info('Cache miss on %s', key);
    cache.set(key, Promise.resolve(new model(...ids)));
  }

  const promisedInstance = cache.get(key)!.then(async (instance) => {
    await Base.applyEvents(instance);
    return instance;
  });
  cache.set(key, promisedInstance);

  return promisedInstance as Promise<TModel>;
}
