// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  serveBase: 'http://localhost:1882',
  webtoolServer: 'http://192.168.1.6:8990',
  secretKey: 'damaozhu-app',
  dialogMin: {
    width: '450px',
    height: '600px'
  },
  dialogMed: {
    width: '600px',
    height: '750px'
  }
};

/*
 * In development mode, for easier debugging, you can ignore zone related error
 * stack frames such as `zone.run`/`zoneDelegate.invokeTask` by importing the
 * below file. Don't forget to comment it out in production mode
 * because it will have a performance impact when errors are thrown
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
