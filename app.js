// Esta linea de codigo es necesaria para que dontenv funcione, y debe
// estar hasta aqui arriba para que funcione correctamente.
require('dotenv').config();

var express           = require("express"),
    app               = express(),
    bodyParser        = require("body-parser"),
    mongoose          = require("mongoose"),
    Campground        = require("./models/campground"),
    Comment           = require("./models/comment"),
    seedDB            = require("./seeds"),
    flash             = require("connect-flash"),
    passport          = require("passport"),
    LocalStrategy     = require("passport-local"),
    methodOverride    = require("method-override"),
    User              = require("./models/user");
    
    
//  De esta forma importamos los archivos de rutas.  
var commentRoutes     = require("./routes/comments"),
    campgroundRoutes  = require("./routes/campgrounds"),
    indexRoutes       = require("./routes/index");
    
// Seediamos la base de datos al inicio.
// seedDB();
// Conectamos nuestra aplicacion a la BD de Mongo
mongoose.connect("mongodb://localhost/yelp_camp");
// Le indicamos a Express donde buscar el CSS.
app.use(express.static("public"));
// Usamos esta linea para evitar escribir .ejs en cada render.
app.set("view engine", "ejs");
// Esta linea es parte de la configuracion de body-parser.
app.use(bodyParser.urlencoded({extended: true}));
// __dirname hace referencia a la ubicacion exacta de este archivo
app.use(express.static(__dirname + "/public"));
// Linea obligatoria de configuracion de method-override
app.use(methodOverride("_method"));
// Linea de codigo necesaria para el uso del paquete connect-flash.
// Es necesario que esta linea de codigo este antes de la configuracion
// de passport.
app.use(flash());
// Esta linea de codigo es requerida para el funcionamiento de moment js
app.locals.moment = require('moment');

// Passport Configuration
app.use(require("express-session")({
  // Este secret, puede ser cualquier cosa, por lo general es una oracion.
  secret: "Luca is the best and cutest dog in the world.",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.error     = req.flash("error");
  res.locals.success   = req.flash("success");
  next();
});

// Ver Seccion 34, clase 308 alrededor de la mitad del video para recordar
// la funcionalidad de añadir estas rutas a estas 3 lineas.
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);

// Start the server.
app.listen(process.env.PORT, process.env.IP, function(){
  console.log("Server has started.");
});

