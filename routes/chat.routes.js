const { Router, express } = require('express');
const router = Router()
const { auth} = require("../src/middlewares")
const MessagesController =require("../controllers/chatController")
const compression = require('compression')
router.use(compression())

class RouterChat{
  constructor() {
    this.controller = new MessagesController();
  }
  start() {
    router.get("/", auth, this.controller.getChat);
    router.get("/:username", this.controller.getChatsByMail);
    
    return router;
  }
}

  module.exports = RouterChat;
  