const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const Users = require('../models/User');


/**
 * GET /admin/users
 * Users page.
 */
exports.getUsers = (req, res) => {
  Users.find((err, docs) => {
    res.render('admin/users', {
      title: 'Admin Page',
      users: docs
    })
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateUsers = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/admin/users');
  }

  Users.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user.email = req.body.email || '';
    user.profile.name = req.body.name || '';
    user.profile.gender = req.body.gender || '';
    user.profile.userlevel = req.body.userlevel || '';
    user.profile.department = req.body.department || '';
    user.profile.jobtitle = req.body.jobtitle || '';
    user.save((err) => {
      if (err) {
        if (err.code === 11000) {
          req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
          return res.redirect('/account');
        }
        return next(err);
      }
      req.flash('success', { msg: 'Profile information has been updated.' });
      res.redirect('/admin/users');
    });
  });
};
