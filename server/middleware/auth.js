const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {

  // check for sesion cookie
  //if !exists -> new session
  //otherwise, attempt to load session from database
  //if !exists -> make new session
  //otherwise, set session on req object
    //thing loading from db is legit put on req obj so middleware later has access to this data
  
  Promise.resolve(req.cookies.shortlyid)
    .then((hash) => {
      if (!hash) {
        //make a session
        throw hash;

      }
      //attempt to load session from database
      return models.Sessions.get({hash})
      //returns promise -- continue work if fails
        //returns either promise or value
    })
    .then((session) => {
      //if !exists -> make new session
      if(!session) {
        //make a sesion
        throw session;
      }
      return session;
    })
    .catch(() => {
      //make a session
      return models.Sessions.create()
        .then(results => {
          return models.Sessions.get({id: results.insertId});
        })
        .then(session => {
          res.cookie('shortlyid', session.hash);
          return session;
        })
    })
    .then((session) => {
      req.session = session;
      next();
    })

};
//if you catch an error and handle correctly will continue!
//tap is like a then, but doesn't expect a return value, and just passes to next instead

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

