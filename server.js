var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var morgan = require('morgan');
var session = require('express-session');
var mongoose = require('mongoose');
var mongoStore = require('connect-mongo')(session);
var busboy = require('connect-busboy'); //middleware for form/file upload
var fs = require('fs-extra');
var path = require('path');
mongoose.connect("mongodb://localhost/insta");
var db = mongoose.connection;
var expressValidator = require('express-validator');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: './static/upload/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const storage2 = multer.diskStorage({
    destination: './static/imgProfile/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
db.on('error', function () {
    console.log("oh oh");
});
db.once('connected', function () {
    console.log('mongo omad :D');
});

var imageSchema = new mongoose.Schema({
    name: String,
    user: String,
    liked_users: String,
    like_count: Number,
    comment: Array
});
var userSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    profile: String
});


var userModel = mongoose.model("user", userSchema);
var imageModel = mongoose.model("image", imageSchema);

app.use(busboy());
app.use(express.static(__dirname + "/static"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: "secret",
    cookie: {path: '/', httpOnly: true, maxAge: 2629746000},
    resave: false,
    saveUninitialized: true,
    store: new mongoStore({mongooseConnection: db})}
    ));

function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('fileUploaded');
const imgProfile = multer({
    storage: storage2,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('fileUploaded');

app.get("/", function (req, resp, next) {
    if (req.session.auth === undefined) {
        console.log(req.session);
        resp.sendFile(__dirname + "/static/home.html");
    }
    else {
        resp.redirect('/official')
    }

});
app.get("/official", function (req, resp, next) {
    console.log(req.session);
    if (req.session.auth != undefined) {
        resp.sendFile(__dirname + "/static/official.html");
    }
    else {
        resp.redirect('/')
    }
});
app.get("/profile", function (req, resp, next) {
    resp.sendFile(__dirname + "/static/profile.html");
});
app.get("/account/edit", function (req, resp, next) {
        resp.sendFile(__dirname + "/static/editProfile.html");

});

app.get("/sign", function (req, resp, next) {
    if (req.session.auth === undefined) {
        resp.sendFile(__dirname + "/static/signup.html");
    }
    else {
        resp.redirect('/official')
    }
});


app.post("/getInfo", function (req, resp, next) {
    if (req.session.auth) {
        userModel.findOne({'username': req.session.auth.username}, function (err, user) {
            if (user.profile) {
                resp.json({profile: user.profile, status: req.session.auth.username});
            }
            else {
                resp.json({status: req.session.auth.username});
            }


        });
    }
    else {
        resp.json({status: false})
    }
});


app.post("/login", function (req, resp, next) {
    if (req.session.auth != undefined) {
        resp.json({status: false, msg: "to ke login budi !"});
    }
    else {
        userModel.findOne({username: req.body.username}, function (err, user) {
            if (err) {
                throw err
            }
            if (user) {
                if (user.password == req.body.password) {
                    req.session.auth = {username: req.body['username']};
                    // resp.end();
                    resp.json({status: true, msg: "login shodi !"});
                    console.log(req.session);
                    // resp.redirect('/');
                }
                else {
                    resp.json({status: false, msg: "password qalat"});
                }
            }
            else {
                resp.json({status: false, msg: "user yaft nashod"});
            }
        })
    }

});
app.post("/logout", function (req, resp, next) {
    delete req.session.auth;
    resp.redirect('/')
});

// app.post("/checkID", function (req, resp, next) {
//     userModel.findOne({'username': req.body.usernameNew}, function (err, users) {
//
//         if (err) {
//             throw err
//         }
//         ;
//         if (req.body.usernameNew.length >= 4) {
//             if (users) {
//                 resp.json({status: false, msg: 'username Unavailabled'});
//             }
//             else {
//                 resp.json({msg: 'username availabled', status: true});
//             }
//         }
//         else {
//             resp.json({msg: 'At least four digits', status: false});
//         }
//
//     })
// });
// app.post("/changeID", function (req, resp, next) {
//     userModel.findOne({username: req.body.username}, function (err, user) {
//         userModel.update({'username': req.session.auth.username}, {
//             $set:
//                 {
//                     'username': req.body.usernameNew
//                 }
//         }, function (err, user) {
//             if (err) {
//                 throw err
//             }
//             else {
//                 console.log(user);
//                 req.session.auth = {username: req.body.usernameNew};
//                 resp.json({status: true, res: req.body.usernameNew});
//             }
//         });
//     });
//
// });
app.post("/checkPass", function (req, resp, next) {
    if (req.body.passNew.length >= 4) {
        resp.json({status: true});
    }
    else {
        resp.json({msg: 'At least four digits', status: false});
    }

});
app.post("/changePass", function (req, resp, next) {
    userModel.update({'username': req.session.auth.username}, {
        $set:
            {
                'password': req.body.passNew
            }
    }, function (err, user) {
        if (err) {
            throw err
        }
        else {
            resp.json({status: true});
        }
    });
});
app.post("/signup", function (req, resp, next) {
    var formData = req.body;

    if (formData.username.length && formData.password.length) {
        if (formData.password.length >= 4) {
            userModel.find({username: formData.username}, function (err, users) {
                if (err) {
                    throw err
                }
                ;
                if (users.length) {
                    resp.json({status: false, msg: "user tekrari"});
                }
                else {
                    var newUser = userModel({
                        username: formData.username,
                        password: formData.password,
                        email: formData.email,
                    });
                    console.log(newUser);
                    newUser.save();
                    req.session.auth = {username: req.body['username']};
                    resp.json({status: true, msg: "afrin"});
                }
            })

        }
        else {
            resp.json({status: false, msg: "pass nabayad zire 4 bashe "});
        }
    }
    else {
        resp.json({status: false, msg: "username or pasword nadri ke"});
    }
});

app.post('/upload', function (req, res) {
    upload(req, res, (err) => {
        if (err) {
            throw err
        } else {
            if (req.file === undefined) {
                res.redirect('/official');
                console.log("khali")
            } else {
                var newUser = imageModel({
                    like_count: 0,
                    name: req.file.filename,
                    user: req.session.auth.username,
                });
                console.log(newUser);
                newUser.save();
                console.log("uploaded");
                res.redirect('/official');
            }
        }
    });
});
app.post("/upload3", function (req, res, next) {
    imageModel.find({}, function (err, img) {
        if (err) {
            throw err
        }
        else {
            res.json({msg: img, status: req.session.auth.username})
        }
    })

});
app.post("/postProfile", function (req, res, next) {
    userModel.find({"username": req.body.user}, function (err, username) {
        if (err) {
            throw err
        }
        else {
            username.forEach(function (user, index) {
                res.json(user.profile);
            });
        }
    })

});
app.post("/profile", function (req, res, next) {
    imgProfile(req, res, (err) => {
        if (err) {
            throw err
        } else {
            if (req.file === undefined) {
                res.redirect('/official');
                console.log("khali")
            } else {

                userModel.update({'username': req.session.auth.username}, {
                    $set:
                        {
                            'profile': req.file.filename
                        }
                }, function (err, img) {
                    if (err) {
                        throw err
                    }
                    else {
                        console.log(img);
                        console.log("uploaded");
                        res.redirect('/official');
                    }
                });
            }
        }
    });

});


app.post('/like', function (req, res, next) {
    imageModel.findOne({"_id": req.body.ides}, function (err, img) {
        var count = img.like_count;
        if (err) {
            throw err
        }
        if (img.liked_users) {
            var liked = img.liked_users;
            liked = img.liked_users.split(',');
            if (img.liked_users.includes(req.session.auth.username)) {
                console.log('like karde');
                var liked2 = liked.indexOf(req.session.auth.username);
                console.log(count - 1);
                delete liked[liked2];
                liked = liked.filter(Boolean);
                console.log(liked);
                imageModel.update({_id: req.body.ides}, {
                    $set:
                        {
                            'liked_users': liked,
                            'like_count': --count
                        }
                }, function (err, img) {
                    if (err) {
                        throw err
                    }
                    else {
                        console.log(img)
                    }
                });
                res.json({msg: count, status: false})
            }
            else {
                console.log('like nkrde');
                console.log(liked);
                liked.push(req.session.auth.username);
                console.log(count + 1);
                console.log(liked);
                imageModel.update({_id: req.body.ides}, {
                    $set:
                        {
                            'liked_users': liked,
                            'like_count': ++count
                        }
                }, function (err, img) {
                    if (err) {
                        throw err
                    }
                    else {
                        console.log(img)
                    }
                });
                res.json({msg: count, status: true})
            }
        }
        else {
            imageModel.update({_id: req.body.ides}, {
                $set:
                    {
                        'liked_users': req.session.auth.username,
                        'like_count': ++count
                    }
            }, function (err, img) {
                if (err) {
                    throw err
                }
                else {
                    console.log(img)
                }
            });
            res.json({msg: count, status: true})
        }

    });
});

app.post("/comment", function (req, resp, next) {
    imageModel.findOne({"_id": req.body.id}, function (err, img) {
        var obj = {'name': req.session.auth.username, 'comment': req.body.cm};
        var my_obj_str = JSON.stringify(obj);
        if (img.comment) {
            var cm = img.comment;
            console.log(cm);
            cm.push(my_obj_str);
            imageModel.update({"_id": req.body.id}, {
                $set:
                    {
                        'comment': cm
                    }
            }, function (err, comment) {
                if (err) {
                    throw err
                }
                else {
                    console.log(comment);
                    console.log(img.comment);
                    resp.json({status: true, msg: "msg sabte shod", name: req.session.auth.username});
                }
            });
        }
        else {
            imageModel.update({"_id": req.body.id}, {
                $set:
                    {
                        'comment': {my_obj_str}
                    }
            }, function (err, comment) {
                if (err) {
                    throw err
                }
                else {
                    console.log(comment);
                    console.log(img.comment);
                    resp.json({status: true, msg: "msg sabte shod", name: req.session.auth.username});
                }
            });
        }
    });

});

app.listen(9000);
console.log("app running on port 9000");

