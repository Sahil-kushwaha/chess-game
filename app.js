import express from 'express'
import {Server} from 'socket.io'
import http from 'http'
import {Chess} from 'chess.js'

const port = 8080;
const hostname = '172.20.21.66';

const app = express();

app.use(express.static("public"))
app.use(express.urlencoded({extended:true , limit:"16kb"}))
app.use(express.json({limit:"16kb"}))

const httpServer= http.createServer(app)
const io = new Server(httpServer)

const chess = new Chess();
let players = {}
let currentPlayer = "w";

app.set("view engine" , "ejs" )

app.get("/" , (req , res)=>{
        res.render("index",{title: "chess game"})
       
})
io.on("connection" , (uniquesocket)=>{
        console.log("connected " ,uniquesocket.id)

 // creating player       
        if(!players.white){
           players.white = uniquesocket.id;
           uniquesocket.emit("playerRole" ,"w" )
        }
        else if(!players.black){
           players.black = uniquesocket.id;
           uniquesocket.emit("playerRole" ,"b" )
        }
        else{
              uniquesocket.emit("spectatorRole")
        }

// player disconnect
        uniquesocket.on("disconnect" , function(){
                if(uniquesocket.id === players.white){
                        delete players.white; 
                }
                else if(uniquesocket.id === players.black){
                        delete players.black; 
                }
                 io.emit("playerDisconnet")  
        })
// agar move ho koi bhi piece to fir check karo kya valid move hai
  uniquesocket.on("move" ,(move)=>{
        try {
                if(chess.turn() === 'w' && uniquesocket.id !==players.white) return;
                if(chess.turn() === 'b' && uniquesocket.id !==players.black) return;

                const result = chess.move(move);
                console.log("move :" ,move)
                console.log("result :" ,result)
                if(result){
                     currentPlayer = chess.turn();
                     io.emit("move" ,move);
                     io.emit("boardState" , chess.fen());
                     if(chess.isCheckmate()){
                         console.log(chess.turn())
                        io.emit("checkmate",chess.turn())
                        io.emit("gameover")
                        }
                }
                else {
                        console.log("Invalide move" ,move);
                        uniquesocket.emit("invalidMove" ,move)
                }
                
        } catch (error) {
                console.log("Illegal move :" ,error);
                uniquesocket.emit("invalidMove" ,move)
        }
  })

});




httpServer.listen(port , ()=>console.log(`Server started at port  ${port}`))