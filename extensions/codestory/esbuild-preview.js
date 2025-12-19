/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const path = require('path');

const srcDir = path.join(__dirname, 'src', 'mcp', 'ui');
const outDir = path.join(__dirname, 'dist');
const copyStaticFiles = require('esbuild-copy-static-files');

require('../esbuild-webview-common').run({
	entryPoints: {
		'server-management': path.join(srcDir, 'server-management.js'),
	},
	srcDir,
	outdir: outDir,
	additionalOptions: {
		loader: {
			'.ttf': 'dataurl',
		},
        plugins: [
            copyStaticFiles({
                src: srcDir,
                dest: outDir,
                filter: (src, dest) => {
                    return src.endsWith('.css');
                }
            })
        ]
	},
}, process.argv);
