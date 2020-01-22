import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { resolve } from 'path';
import serve from 'rollup-plugin-serve';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import { writeTranslations } from './build/build-intl';

const dev = process.env.ROLLUP_WATCH;

const serveopts = {
  contentBase: ['./dist'],
  host: '0.0.0.0',
  port: 5000,
  allowCrossOrigin: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
};

const plugins = [
  nodeResolve({}),
  commonjs(),
  typescript(),
  replace({
    'process.env.NODE_ENV': JSON.stringify(dev ? 'development' : 'production'),
  }),
  dev && serve(serveopts),
  !dev && terser(),
];

const getConfig = async () => {
  await writeTranslations(resolve(__dirname, 'src', 'localize', 'languages'));

  return [
    {
      input: 'src/index.ts',
      output: {
        dir: 'dist',
        format: 'es',
      },
      plugins: [...plugins],
    },
  ];
};

export default getConfig;
