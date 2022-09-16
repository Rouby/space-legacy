import { planets } from './planets';

const names = { planets };

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// name_generator.js
// written and released to the public domain by drow <drow@bin.sh>
// http://creativecommons.org/publicdomain/zero/1.0/
type Chain = { [key: string]: { [key: string]: number } };

const chainCache: {
  [key: string]: { [key: string]: { [key: string]: number } };
} = {};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// generator function

export function generateName(type: keyof typeof names) {
  const chain = markovChain(type);
  if (chain) {
    return markovName(chain);
  }
  return '';
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// generate multiple

export function generateNames(type: keyof typeof names, num: number) {
  const list = [];

  for (let i = 0; i < num; i++) {
    list.push(generateName(type));
  }
  return list;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// get markov chain by type

function markovChain(type: keyof typeof names) {
  const chain = chainCache[type];
  if (chain) {
    return chain;
  } else {
    const list = names[type];
    if (list) {
      const chain = constructChain(list);
      if (chain) {
        chainCache[type] = chain;
        return chain;
      }
    }
  }
  return false;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// construct markov chain from list of names

function constructChain(list: string[]) {
  let chain: Chain = {};

  for (let i = 0; i < list.length; i++) {
    const names = list[i].split(/\s+/);
    chain = incrChain(chain, 'parts', names.length);

    for (let j = 0; j < names.length; j++) {
      const name = names[j];
      chain = incrChain(chain, 'nameLen', name.length);

      const c = name.substr(0, 1);
      chain = incrChain(chain, 'initial', c);

      let string = name.substr(1);
      let lastC = c;

      while (string.length > 0) {
        const c = string.substr(0, 1);
        chain = incrChain(chain, lastC, c);

        string = string.substr(1);
        lastC = c;
      }
    }
  }
  return scaleChain(chain);
}

function incrChain(chain: Chain, key: string, token: number | string) {
  if (chain[key]) {
    if (chain[key][token]) {
      chain[key][token]++;
    } else {
      chain[key][token] = 1;
    }
  } else {
    chain[key] = {};
    chain[key][token] = 1;
  }
  return chain;
}

function scaleChain(chain: { [key: string]: { [key: string]: number } }) {
  const tableLen: { [key: string]: number } = {};

  for (const key in chain) {
    tableLen[key] = 0;

    let token;
    for (token in chain[key]) {
      const count = chain[key][token];
      const weighted = Math.floor(Math.pow(count, 1.3));

      chain[key][token] = weighted;
      tableLen[key] += weighted;
    }
  }
  chain['tableLen'] = tableLen;
  return chain;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// construct name from markov chain

function markovName(chain: Chain) {
  const parts = +selectLink(chain, 'parts');
  const names = [];

  for (let i = 0; i < parts; i++) {
    const nameLen = +selectLink(chain, 'nameLen');
    let c = selectLink(chain, 'initial');
    let name = c;
    let lastC = c;

    while (name.length < nameLen) {
      c = selectLink(chain, lastC);
      name += c;
      lastC = c;
    }
    names.push(name);
  }
  return names.join(' ');
}

function selectLink(chain: Chain, key: string) {
  const len = chain['tableLen'][key];
  const idx = Math.floor(Math.random() * len);

  let t = 0;
  for (const token in chain[key]) {
    t += chain[key][token];
    if (idx < t) {
      return token;
    }
  }
  return '-';
}
