const server = require('./server');
require('./database');

server.listen(server.get('port'), () => {
  console.log('Server listening on port: ', server.get('port'));
})