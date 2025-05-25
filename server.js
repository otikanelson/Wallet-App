const app = require('./app');
const { PORT } = require('./src/config/env');
const http = require("http").createServer(app);






http.listen(PORT,()=>{
    console.log(`server start ${PORT}`);
    
})
