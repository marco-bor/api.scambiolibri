import * as passport from 'passport'
import { UserModel } from './models'
var crypto = require('crypto');
var passport_local = require('passport-local');

export function configure(passport: passport.Passport, User: UserModel) {
  passport.serializeUser((user: any, done) => done(null, user.id))
  passport.deserializeUser((id: number, done) => {
    User.findById(id).then(foundUser => {
      if (!foundUser) { return done(new Error('user not found'), false) }
      return done(null, foundUser)
    })
  })
  passport.use("local-signup", new passport_local.LocalStrategy({
    usernameField: 'phone',
    passwordField: 'password',
    passReqToCallback: true
  }, function (req: any, phone: string, password: string, done: any) {
    User.findByPrimary(phone).then(function (foundUser) {
      if (!foundUser) { // User not found
        crypto.randomBytes(32, function (err: any, generatedSalt: any) {
          if (err) {
            return done(err);
          }
          crypto.pbkdf2(password, generatedSalt, 4096, 512, 'sha256', function (err: any, generatedHash: any) {
            User.create({
              name: req.body.name,
              phone: phone,
              passwordHash: generatedHash,
              passwordHashSalt: generatedSalt,
              city: req.body.city
            }).then(function (createdUser) {
              return done(null, createdUser);
            }, function (err) {
              return done(null, false);
            });
          });
        });
      } else { // User already registered
        return done(null, false);
      }
    }, function (err) {
      return done(err);
    });
  }))
}
