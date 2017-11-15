const express             = require("express");
const User                = require("../models/User");
const Course              = require("../models/Course");
const path                = require('path');
const passport            = require("passport");
const coursesController   = express.Router();

coursesController.get("/courses", ensureAuthenticated, (req, res) => {
  let parameters = {available: true};
  if (req.user.role == 'TA') parameters = {};
  Course.find(parameters)
        .then((data) => {
          res.render("courses/index", {data: data, user: req.user});
        }, (err) => {
          next(err);
        });
});

coursesController.post("/courses/create", checkRoles('TA'), (req, res) => {
  const courseInfo = {
    name: req.body.name,
    startingDate: req.body.startingDate,
    endDate: req.body.endDate,
    level: req.body.level,
    available: req.body.available
  };
  const newCourse = new Course(courseInfo);
  newCourse.save()
             .then(() => {
               return res.redirect("/courses");
             }, (err) => {
               next(err);
             });
});

coursesController.get("/courses/edit/:id", checkRoles('TA'), (req, res) => {
  const courseId = req.params.id;
  Course.findById(courseId)
      .then(() => {
        res.render("courses/edit", {data: data, user: req.user});
      }, (err) => {
        next(err);
      });
});

coursesController.post("/courses/edit/:id", checkRoles('TA'), (req, res) => {
  const id = req.params.id;
  const courseInfo = {
    name: req.body.name,
    startingDate: req.body.startingDate,
    endDate: req.body.endDate,
    level: req.body.level,
    available: req.body.available
  };
  Curse.findByIdAndUpdate(id, { $set:
      {
      name: courseInfo.name,
      startingDate: courseInfo.startingDate,
      endDate: courseInfo.endDate,
      level: courseInfo.level,
      available: courseInfo.available
    }}, { new: true })
       .then((data) => {
         return res.redirect("/courses");
       }, (err) => {
         next(err);
       });
});

coursesController.get("/courses/delete/:id", checkRoles('TA'),
(req, res) => {
  const courseId = req.params.id;
  Course.findByIdAndRemove(courseId)
      .then(() => {
        return res.redirect("/courses");
      }, (err) => {
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

module.exports = coursesController;
