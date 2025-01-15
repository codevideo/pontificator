import typescript from "rollup-plugin-typescript2";
import dts from "rollup-plugin-dts";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import json from '@rollup/plugin-json';

export default [
    {
        input: "src/index.ts",
        output: [
            {
                file: "dist/index.cjs", // CommonJS format for Node.js
                format: "cjs",
            },
        ],
        plugins: [
            resolve(), // resolve node_modules
            commonjs(), // convert CommonJS to ES modules
            typescript(),
            json(),
        ],
    },
    // type declarations
    {
        input: "src/index.ts",
        output: [
            {
                file: "dist/index.d.ts",
                format: "es",
            },
        ],
        plugins: [dts()],
    },
];
