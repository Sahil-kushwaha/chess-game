
const socket = io()
const chess = new Chess();
const boardElement = document.querySelector(".chessboard")
const Buzzer = document.getElementById('buzzer');
const Move = document.getElementById('move')

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;
let ischeckmate = false;
let checkmatedColor = null

const renderBoard = () => {
        const board = chess.board();
        boardElement.innerHTML = ""
        board.forEach((row ,rowIndex) => {
              row.forEach((square ,squareIndex) =>{
                      // create square div and add class conditionally
                     const squareElement = document.createElement("div")
                     squareElement.classList.add("square" ,
                        (rowIndex + squareIndex) % 2 ===0 ? "light" : "dark")
                        console.log(square)
                    //add color when king get checkmate  challenges :- i hadn't check square is null or not even square is null i tried to get the property square.color then code fut ja rha tha 
                      if(ischeckmate === true && square){
                             if(checkmatedColor === 'w' && square.color === 'w' && square.type ==='k'){
                                      console.log("piece.type" ,square.type ,square.color)
                                     squareElement.style.backgroundColor="red"
                                }
                             else if (checkmatedColor === 'b' && square.color === 'b' && square.type === 'k'){
                                     squareElement.classList.add("checkmate")

                               }
                        }

                     squareElement.dataset.row = rowIndex;
                     squareElement.dataset.col = squareIndex;

                    // indicate piece at board 
                     if(square) {
                          
                          const pieceElement = document.createElement("div")
                          pieceElement.classList.add("piece" ,
                                square.color === 'w' ? "white" : "black"
                        );
                        pieceElement.innerHTML= getPieceUnicode(square)
                        pieceElement.draggable = playerRole === square.color;
                        squareElement.appendChild(pieceElement)
                         
                         pieceElement.addEventListener("dragstart" , (e)=>{
                                 
                                if(pieceElement.draggable){
                                    draggedPiece = pieceElement;
                                    sourceSquare = {row: rowIndex , col: squareIndex};
                                    e.dataTransfer.setData("text/plain" , "")
                                }
                         })
                     }
                     
                     squareElement.addEventListener("dragover" , function(e){
                         // it allow to drop piece over the square (make a valid drop target) // by default browser does not allow to drop element over another element
                         e.preventDefault();
                        
                     });

                     squareElement.addEventListener("drop" , function(e){
                        e.preventDefault();
                        if(draggedPiece){
                                
                           const targetSource =  {
                                
                                        row: parseInt(squareElement.dataset.row),
                                        col: parseInt(squareElement.dataset.col)
                                }
                              
                            handleMove(sourceSquare , targetSource)    
                        }
                     });
                     boardElement.appendChild(squareElement)    
                });
        }); 
     
      if(playerRole === 'b'){
         boardElement.classList.add("flipped");
        }  
        
        else{
                boardElement.classList.remove("flipped");
         
      }
           
}

const handleMove = (sourceSquare ,targetSource) => {
        const move = {
                from:`${String.fromCharCode(97 + sourceSquare.col)}${8 - sourceSquare.row}` ,
                to: `${String.fromCharCode(97 + targetSource.col)}${8 - targetSource.row}`,
                promotion: 'q'
        }
     socket.emit("move" , move)   
};

const getPieceUnicode = (piece) => {
    const unicodepiece = {

            p: '&#9817',
            r: '&#9814',
            n: '&#9816',
            b: '&#9815',
            q: '&#9813',
            k: '&#9812',
            P: '&#9823',
            R: '&#9820',
            N: '&#9822',
            B: '&#9821',
            Q: '&#9819',
            K: '&#9818'
    }
   return unicodepiece[piece.type] || ""; 
};

socket.on("playerRole" , (role)=>{
        playerRole = role;
        renderBoard()
})

socket.on("spcectatorRole", ()=>{
        playerRole = null;
        renderBoard()
})
socket.on("boardState" , (fen)=>{
        chess.load(fen);
        renderBoard()
})

socket.on("move" , (move)=>{
        Move.play();
        chess.move(move);
        renderBoard();
})

function playBuzzer() {
        Buzzer.currentTime = 0; // Reset the audio to the start
        Buzzer.play().catch(error => {
            console.error('Error playing buzzer sound:', error);
        });
    }
socket.on("invalidMove",(move)=>{
        playBuzzer();
        Toastify({
                text: "Illegal move",
                duration: 2000,
                newWindow: true,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: "center", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {      
                  background: "linear-gradient(to right, #ee0000, #dd0000)",
                },
                onClick: function(){alert("sahi se chal bhosdike")} // Callback after click
              }).showToast();
})

socket.on("checkmate",(data)=>{
        checkmatedColor=data;
        ischeckmate=true;
        renderBoard();
})


renderBoard()