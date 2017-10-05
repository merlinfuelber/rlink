Recursive Link
==============
What is this?
-------------
This library "clones" a directory by recreating it's structure within a target directory and then linking all the files within these directories to their respective source files.

Why would you use this instead of just copying stuff?
-----------------------------------------------------
Just imagine you have a pretty large application of which you would like to run multiple instances, but you cannot or don't want to run them from the same directory. Instead of copying all the files to another directory and starting the application from there, this library allows you to link all the files, that never change during runtime anyway. By that you save lots of disk space and (most important) time when creating the clone, while files created by your running instance (e.g. log files) are kept within the cloned directory.

TL;DR, How to?
--------------
As a command line tool:

```Bash
npm install --g rlink

rlink /opt/mySource /opt/myTarget
```

As a library:

```Bash
npm install --save rlink
```


```JavaScript
const rlink = require('rlink');
rlink('/var/lib/myrepository', '/tmp/myinstance').then(() => {
    console.log('yay!');
}).catch((err) => {
    console.error('aaah, shoot!');
})
```

Filtering
------------
You can specify which files and directories you want to add to your target by either passing a **function** which returns **true** for every file, that is allowed to be linked and every directory that is allowed to be created or an **array** of files/directories you want to **exclude**.

The following example will only copy files that contain .txt in their names.
```JavaScript
const rlink = require('rlink'),
    myFilter = (fileOrDirName) => {
        return fileOrDirName.indexOf('.txt') > -1;
    };
rlink('/var/lib/myrepository', '/tmp/myinstance', myFilter);
```

Pass a **blacklist** array as an alternative (this example will not link the *stuff.txt* file within the source directory. However, files named *stuff.txt* within subdirectories will be linked. Only the files **listed** in the blacklist array will be ignored.

```JavaScript
const rlink = require('rlink'),
    blacklist = ['stuff.txt'];
rlink('/var/lib/myrepository', '/tmp/myinstance', blacklist);
```

What else?
----------
**YES**, this document is probably longer than the actual library source code.