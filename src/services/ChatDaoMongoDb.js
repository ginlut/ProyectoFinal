const Chat = require("../models/mensajes.model.js");
const logger = require("../utils/logs/logger.js")
let instance;

class ContenedorMongoDbChat {
  constructor() { 
    this.collection = Chat;
}

async getAll(){
  try {
    const chats = await this.collection.find();
    return chats
  } catch (err) {
    logger.error(` ${err}`)
  }
}

async create(username, texto){
  try {
    const userMessage = new this.collection({username:username, texto:texto, timestamp:Date.now()})
    await userMessage.save()
    return userMessage
  } catch (err) {
    logger.error(` ${err}`)
  }           
}

async getByEmail(username) {
  try {
    const chats = await this.collection.find({ username: username});
    return chats
  } catch (err) {
    logger.error(` ${err}`)
  }
}

static getInstance() {
  if (!instance) instance = new ContenedorMongoDbChat();
  return instance;
}

}

module.exports = ContenedorMongoDbChat;