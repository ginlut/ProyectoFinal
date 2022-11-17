const express = require("express");
const { Server: HttpServer } = require("http");
const app = express();
const httpServer = new HttpServer(app);
const handlebars = require('express-handlebars')
require("dotenv").config();
const os = require("os");
const cluster = require("cluster");
const cpus = os.cpus();
const isCluster = process.argv[3] == "cluster";
const passport = require("passport");
const initPassport = require( './src/passport/init')
const routes = require('./routes/routes')
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const mongoose = require( "mongoose")
const { fork } = require("child_process");
const logger = require("./src/utils/logs/logger")
const path = require("path")


mongoose.connect(process.env.MONGO_URL, ()=> {console.log("Base de datos conectada")});

app.use(cookieParser());

app.use(
  session({
    store: MongoStore.create({
      mongoUrl:
        process.env.MONGO_URL}),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true, 
    cookie: {
      maxAge: 500000,
      httpOnly: false,
      secure: false
    },
  })
);

/*------------- SERVIDOR APP-----------------------*/

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// PASSPORT
app.use(passport.initialize());

app.use(passport.session());
app.use(passport.authenticate('session'));
initPassport(passport);


/*if (isCluster && cluster.isPrimary) {
  cpus.map(() => {
    cluster.fork()
 });

 cluster.on("exit", (worker) => {
  console.log(`worker ${worker.process.pid} died`)
  cluster.fork();

 });
} else{
*/
  const connectedServer = httpServer.listen(process.env.PORT || 8080, () => {
    logger.info(`Servidor http escuchando en el puerto ${connectedServer.address().port} - PID ${process.pid}`)
    app.use('/', routes) 
    app.use(express.static(__dirname + "/public"));

app.engine(
  "hbs",
  handlebars({
      extname: ".hbs",
      defaultLayout: path.join(__dirname, '/public/views/layout/main.hbs'),
  })
);
app.set('views', path.join(__dirname, './public/views'))
app.set('view engine', 'hbs')

})

const chats = require("./src/services/ChatDaoMongoDb.js")
const chatService = chats.getInstance();
console.log("Hola")
const {Server: IOServer} = require('socket.io')
const io = new IOServer(connectedServer)

io.on('connection', async socket => {
  console.log(`Se conecto un usuario ${socket.id}`)
  const messages = await chatService.getAll()

  io.emit('server:message', messages)

  socket.on('client:message', async messageInfo => {
    const { username, texto } = messageInfo;
    console.log(username)
    console.log(texto)
    await chatService.create(username, texto)
    const messages = await chatService.getAll()
    io.emit('server:message', messages)
  })
})