var mongoose  = require("mongoose")
    
// Schema setup
var commentSchema = new mongoose.Schema({
  text: String,
  createdAt: { type: Date, default: Date.now },
// En las siguientes lineas estamos diciendo que el autor del comentario
// sera un objeto asociado por referencia, notar que "User" se refiere al
// modelo de usuario.
  author: {
    id:   {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  }
});

module.exports = mongoose.model("Comment", commentSchema);