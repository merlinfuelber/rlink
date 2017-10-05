#!/usr/bin/env node
const rlink = require('.');
if (process.argv.length < 4) {
    console.error('Example usage: rlink /opt/source /opt/target');
    process.exit(1);
}

rlink(process.argv[process.argv.length - 2], process.argv[process.argv.length - 1]);