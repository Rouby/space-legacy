import { loadFilesSync } from '@graphql-tools/load-files';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { resolve } from 'path';
import { context } from './context';

export { context };

export const schema = makeExecutableSchema({
  resolvers: loadFilesSync(resolve(__dirname, './schema/**/*.{ts,js}'), {
    extractExports: (fileExport) => fileExport.resolvers,
  }) as any,
  typeDefs: loadFilesSync(resolve(__dirname, './schema/**/*.{ts,js}'), {
    extractExports: (fileExport) => fileExport.typeDefs,
  }),
});
