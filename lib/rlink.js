const async = require('async'),
    fs = require('fs-extra'),
    path = require('path'),
    walk = require('walk');

module.exports = function (source, target, filter) {
    const absSource = path.resolve(source),
        absTarget = path.resolve(target);
    var myFilter, blacklist;
    return new Promise((resolve, reject) => {
        async.waterfall([(callback) => {
            //can we read the source path?
            fs.access(absSource, fs.constants.R_OK, callback);
        }, (callback) => {
            if (typeof filter === 'function') {
                myFilter = filter;
                callback();
                return;
            }
            if (Array.isArray(filter)) {
                blacklist = {};
                filter.forEach((file) => {
                    var absPath = path.resolve(absSource, file);
                    blacklist[absPath] = 1;
                });
                myFilter = (file) => {
                    return !blacklist.hasOwnProperty(file);
                };
                callback();
                return;
            }
            myFilter = () => { return true; };
            callback();
        }, (callback) => {
            //let's walk through the source path
            var walker = walk.walk(absSource, { followLinks: false }),
                errors = undefined,
                files = [],
                directories = [];
            //files
            walker.on('file', (root, stat, next) => {
                var fullFilePath = path.join(root, stat.name);
                if (myFilter(fullFilePath) && myFilter(root)) {
                    files.push(fullFilePath);
                }
                next();
            });
            //directories
            walker.on('directory', (root, stat, next) => {
                var fullPath = path.join(root, stat.name);
                if (myFilter(fullPath)) {
                    directories.push(fullPath);
                }
                next();
            });
            //hopefully not!
            walker.on('errors', (root, nodeStatsArray, next) => {
                errors = nodeStatsArray;
            });

            walker.on('end', () => {
                if (errors) {
                    callback(errors);
                    return;
                }
                callback(null, directories, files);
            });
        }, (directories, files, callback) => {
            //map source directories to target directories...
            async.map(directories, (dir, callback) => {
                callback(null, dir.replace(absSource, absTarget));
            }, (err, targetDirs) => {
                callback(err, targetDirs, files);
            });
        }, (directories, files, callback) => {
            //...and create them
            async.each(directories, fs.ensureDir, (err) => {
                callback(err, files);
            });
        }, (files, callback) => {
            //link all the files!
            async.each(files, (file, callback) => {
                const target = file.replace(absSource, absTarget);
                fs.link(file, target, callback);
            }, callback);
        }], (err) => {
            if (err) {
                //what a pity!
                reject(err);
                return
            }
            //made it!
            resolve();
        });
    });
};