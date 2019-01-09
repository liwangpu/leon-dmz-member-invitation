const fs = require('fs');
const prodEnvPath = './src/environments/environment.prod.ts';

fs.readFile(prodEnvPath, function (err, buf) {
    if (!err) {
        var serverBaseKY = process.argv.filter(x => x.indexOf('serverBase') > -1)[0];
        var serverBaseArr = serverBaseKY ? serverBaseKY.split('=') : [];
        const serveBase = serverBaseArr[1];
        if (serveBase) {
            console.log('app config serverBase:', serveBase);
            var envs = buf.toString().replace('{{serveBase}}', serveBase);
            fs.writeFile(prodEnvPath, envs, function (err) {
                console.log('app config ready!');
            });
        }
        else {
            console.error('app config serverBase is null:');
        }
    }
    else {
        console.error('app config error:', err);
    }
});
