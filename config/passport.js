const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const Admins = require('../models/Admins');

module.exports = (passport) => {
    /**
     * This passport authentication is for User
     */
    passport.use(
        new LocalStrategy(
            { usernameField: 'adminID', passwordField:'password', passReqToCallback: true }, 
            (req, adminID, password, done) => {
            //Check if user already exists
            Admins.findOne({ adminID })
                .then(admin => {
                    //if there is no member, return error
                    if(!admin){
                        req.flash('errorToast', 'AdminID does not exist');
                        return done(null, false, 'AdminID does not exist');
                    }
                    //if member exist, compare password
                    bcrypt.compare(password, admin.password)
                        .then(async(isMatch) => {
                            //if the password entered matches with what is
                            // in the database, return the member details
                            if(isMatch){
                                req.flash('successToast','Login Successful');
                                return done(null, admin)
                            }
                            //if the password entered does not matches with what is
                            // in the database, return error
                            req.flash('errorToast','Password Incorrect');
                            return done(null, false, 'Password Incorrect');
                        })
                        .catch(err => console.error(err));
                })
                .catch(err => console.error(err));

        })
    );


    passport.serializeUser((admin, done)=>{
        return done(null, admin._id);
    });

    passport.deserializeUser((id, done)=>{
        Admins.findById({ _id: id }, (err, admin)=>{
            return done(err, admin);
        })
    });
}