const app = require('express').Router();
const Drugs = require('../models/Drugs');


app.get('/', (req, res)=>{
    res.redirect('/admin');
    res.render('index', {
        title: 'iDrug Authentication',
        errorToast: req.flash('errorToast')
    })
});

app.post('/auth-pin', async(req, res)=>{
    let { authPin } = req.body;
    authPin = authPin.replace(/-/ig, '').trim();

    const drug = await Drugs.findOne({ authPin });
    if(!drug) {
        req.flash('errorToast', 'Drug Not Found!!!');
        return res.redirect('/');
    };
    
    
    req.flash('successToast', 'Drug Found!!!');
    res.render('auth-pin', {
        title: drug.name,
        drug,
        successToast: req.flash('successToast')
    });
});


module.exports = app;