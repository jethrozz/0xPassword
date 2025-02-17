chrome.runtime.onConnect.addListener(function(port) {
    console.log('port', port);
    port.onMessage.addListener(function(msg) {
        console.log('msg', msg);
        let {username, password, url} = msg;
        //保存到数据库
        saveToDatabase(username, password, url);
      });
  });

function saveToDatabase(username, password, url) {
    console.log('saveToDatabase', username, password, url);
}