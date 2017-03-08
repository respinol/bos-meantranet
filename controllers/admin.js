const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const Users = require('../models/User');
const Business = require('../models/Business');


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
 * GET /admin/data
 * Users page.
 */
exports.getBusiness = (req, res) => {
  Business.find((err, docs) => {
    res.render('admin/users', {
      title: 'Crawler Data',
      business: docs
    })
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateUsers = (req, res, next) => {
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
      if (err) { return next(err); }
      req.flash('success', { msg: 'Profile information has been updated.' });
      res.redirect('/admin/users');
    });
  });
};
