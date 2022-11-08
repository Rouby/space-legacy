import { getInstance } from './getInstance';
import { Model } from './Model';

export type Promised<T extends {}> = {
  [P in keyof T]: P extends 'id'
    ? T[P]
    : P extends `${string}Id`
    ? T[P]
    : Promise<T[P]>;
} & { $resolve: Promise<T> };

export interface RegisteredModels {
  // [key: string]: Model;
}

const registeredLoader = {} as {
  [key: string]: (...ids: any[]) => Promise<Model | null>;
};

export function registerModel<
  TModel extends RegisteredModels[keyof RegisteredModels],
>(
  key: keyof RegisteredModels,
  loaderOrModel:
    | (new (...args: any[]) => TModel)
    | ((...ids: any[]) => Promise<TModel | null>),
) {
  registeredLoader[key] = isModelClass(loaderOrModel)
    ? (...ids) => getInstance(loaderOrModel, ...ids)
    : loaderOrModel;

  function isModelClass(f: any): f is new (...args: any[]) => TModel {
    return f.prototype instanceof Model;
  }
}

export function promisedInstance<
  TModelKey extends keyof RegisteredModels,
  TModel extends {} = RegisteredModels[TModelKey],
>(
  model: TModelKey,
  base: {
    [P in {
      [P in keyof TModel]: P extends 'id'
        ? P
        : P extends `${string}Id`
        ? P
        : never;
    }[keyof TModel]]: TModel[P];
  },
) {
  const modelLoader = registeredLoader[model];
  return new Proxy<Promised<TModel>>(base as any, {
    get: (target, prop: (keyof TModel & string) | '$resolve') => {
      if (prop === '$resolve') {
        return modelLoader(...Object.values(base));
      }
      if (prop in target) {
        return target[prop];
      }
      return modelLoader(...Object.values(base)).then(
        (d) => (d as any)?.[prop],
      );
    },
  });
}

declare global {
  interface Array<T> {
    $resolveAll: Promise<(T extends Promised<infer U> ? U : T)[]>;
  }
}

if (!Array.prototype.$resolveAll) {
  Object.defineProperty(Array.prototype, '$resolveAll', {
    get(this: Promised<any>[]) {
      return Promise.all(this.map((d) => d?.$resolve ?? d));
    },
    enumerable: false,
    configurable: false,
  });
}
