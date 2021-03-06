const express = require("express");
const User = require("../models/User");
const bcrypt = require('bcrypt');
const bcryptSalt = 10;
const path = require('path');
const passport = require("passport");
const usersController = express.Router();


usersController.get("/employees", checkRoles('Boss'), (req, res) => {
  User.find({$or: [ {role: 'Developer'}, {role: 'TA'} ]})
    .then((data) => {
      res.render("employees/index", {data: data, user: req.user});
    })
    .catch((err) => {
      next(err);
      //res.render("error", {error: err});
    });
});

usersController.post("/employees/create", checkRoles('Boss'), (req, res) => {
  const pass = req.body.password;
  let salt = bcrypt.genSaltSync(bcryptSalt);
  const employeeInfo = {
    username: req.body.username,
    name: req.body.name,
    familyName: req.body.familyName,
    password: bcrypt.hashSync(pass, salt),
    role: req.body.role
  };
  const newEmployee = new User(employeeInfo);
  newEmployee.save()
    .then(() => {
      return res.redirect("/employees");
    })
    .catch((err) => {
      next(err);
    });
});

usersController.post("/employees/:id/delete", checkRoles('Boss'), (req, res) => {
  const employeeId = req.params.id;
  User.findByIdAndRemove(employeeId)
    .then(() => {
      return res.redirect("/employees");
    })
    .catch((err) => {
      next(err);
    });
});

usersController.get("/users", ensureAuthenticated, (req, res) => {
  let userRole = req.user.role,
      queryRole;
  if( userRole == 'Student') {
    let queryRole = {role: 'Student'};
  } else {
    queryRole = {};
  }
  User.find(queryRole)
    .then((data) => {
      res.render("users/index", {data: data, user: req.user});
    })
    .catch((err) => {
      next(err);
    });
});

usersController.get("/users/:id", ensureAuthenticated, (req, res) => {
  const id = req.params.id;
  User.findById(id)
    .then((data) => {
      res.render("users/profile", {data: data, user: req.user});
    })
    .catch((err) => {
      next(err);
    });
});

usersController.get("/users/edit/:id", ensureAuthenticated, (req, res) => {
  const id = req.params.id;
  User.findById(id)
    .then((data) => {
      res.render("users/edit", {data: data, user: req.user});
    })
    .catch((err) => {
      next(err);
    });
});

usersController.post("/users/edit/:id", ensureAuthenticated, (req, res) => {
  const id = req.params.id;
  const pass = req.body.password;
  let salt = bcrypt.genSaltSync(bcryptSalt);
  const userInfo = {
    username: req.body.username,
    name: req.body.name,
    familyName: req.body.familyName,
    password: bcrypt.hashSync(pass, salt)
  };
  User.findByIdAndUpdate(id,
    { $set:
      {
        username: userInfo.username,
        name: userInfo.name,
        familyName : userInfo.familyName,
        password: userInfo.password
      }
    }, { new: true })
    .then((data) => {
      res.render("users/profile", {data: data, user: req.user});
    })
    .catch((err) => {
      next(err);
    });
});

function checkRoles(role) {
  return function(req, res, next) {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    } else {
      res.redirect('/error');
      //res.render("error", {message: 'You don\'t have enough privileges to see that page, sorry'});
    }
  };
};

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login');
  };
}

module.exports = usersController;
