module.exports = {
    /**
     * Protecting links to non-logged in users
     */
    ensureAuthenticated: function(req, res, next){
        if(req.user){
            if(req.isAuthenticated()){
                return next();
            }
        }
        req.flash('errorToast', 'You must be logged in');
        res.redirect(301, '/admin/');
    }
}