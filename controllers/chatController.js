const DaoChat = require("../src/services/ChatDaoMongoDb.js")
const Chat = DaoChat.getInstance();
const path = require("path")

class MessagesController {

    getChatsByMail = async (req, res) => {
        try {
            const username = req.params.username
            const verChats = await Chat.getByEmail(username)
            if(verChats.length === 0){
                return res.status(404).json({error: "No existen chats"})}
            res.status(200).json(verChats)
        } catch (error) {
            res.status(error.errorCode).send(error.message); 
        }
    }
    getChat = async (req, res) => {
        res.render("chats.hbs")
    }
}

module.exports =  MessagesController