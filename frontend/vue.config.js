const fs = require('fs');
'use strict';

var os = require('os');
var ifaces = os.networkInterfaces();
var address = '';
Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      console.log(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
      console.log(ifname, iface.address);
      address = iface.address;
    }
    ++alias;
  });
});
module.exports = {
  // 여기에 옵션을 작성해준다.

  devServer: {
    host: address,
    https: true,
        https: {
            key: fs.readFileSync('private.pem'),
            cert: fs.readFileSync('public.pem')
        },
  }
}
