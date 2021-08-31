const app = require('express').Router();
const passport = require('passport');
const { ensureAuthenticated: ensureAuth } = require('../config/auth');
const Drugs = require('../models/Drugs');
const Alerts = require('../models/Alerts');
const genIDs = require('../utils/genIDs');
const Admins = require('../models/Admins');
const bcrypt = require('bcryptjs');
const cron = require('node-cron');
const msgb = require('messagebird')(process.env.MESSAGEBIRD_API_KEY);

const sendMsg = (msg) => {
    // console.log('whining');
    msgb.messages.create({
          originator : 'Pharmatify',
          recipients : [ '2348105399478' ],
          body : msg
      },
      function (err, response) {
        if (err) {
          console.log(err);
          sendMsg(msg);
        } else {
          console.log(response);
        }
    });
}

const cronjob = (drugID, expiryDate, name) => {
    let day = new Date(expiryDate).getDate();
    let month = parseInt(new Date(expiryDate).getMonth()) + 1;
    let year = new Date(expiryDate).getFullYear();

    let msg;
    let timeLeft;
    function alertDB(){
        Alerts.create({
            alertID: genIDs(['genUpperCase', 'genNumber'], 7),
            drugID,
            name,
            expiryDate,
            timeLeft,
            msg,
            time: new Date().setHours(new Date().getHours() + 1)
        })
    }

    global[drugID] = [];
    
    global[drugID][0] = cron.schedule(`00 00 12 ${day} ${month - 3} *`, ()=>{
        if(new Date().getFullYear() === year){
            msg = `Expiry Alert!!!\n\nDrugID: ${drugID}\nDrug: ${name}\n\nThis drug will expire in 3 MONTHS`;
            timeLeft = '3 months';
            sendMsg(msg);
            alertDB();
            global[drugID][0].destroy();
        }
    });
    
    global[drugID][1] = cron.schedule(`00 00 12 ${day} ${month - 1} *`, ()=>{
        if(new Date().getFullYear() === year){
            msg = `Expiry Alert!!!\n\nDrugID: ${drugID}\nDrug: ${name}\n\nThis drug will expire in 1 MONTH`;
            timeLeft = '1 month';
            sendMsg(msg);
            alertDB();
            global[drugID][1].destroy();
        }
    });
    
    global[drugID][2] = cron.schedule(`00 00 12 ${day - 7} ${month} *`, ()=>{
        if(new Date().getFullYear() === year){
            msg = `Expiry Alert!!!\n\nDrugID: ${drugID}\nDrug: ${name}\n\nThis drug will expire in 7 DAYS`;
            timeLeft = '7 days';
            sendMsg(msg);
            alertDB();
            global[drugID][2].destroy();
        }
    });
    
    global[drugID][3] = cron.schedule(`00 00 12 ${day} ${month} *`, ()=>{
        if(new Date().getFullYear() === year){
            msg = `Expiry Alert!!!\n\nDrugID: ${drugID}\nDrug: ${name}\n\nThis drug expires TODAY`;
            timeLeft = '0 days';
            sendMsg(msg);
            alertDB();
            global[drugID][3].destroy();
            delete global[drugID];
        }
    });

    for(let task of global[drugID]){
        task.start();
    }
}

app.get('/', (req, res)=>{
//     const salt = bcrypt.genSaltSync(10);
//     const hash = bcrypt.hashSync('pharmatify2021', salt);

//     Admins.create({
//         adminID: 'admin',
//         password: hash
//     })
    
    // console.log(req.flash('successToast'));
    res.render('admin/login', {
        title: 'Admin Login',
        bodyClass: 'admin-login',
        successToast: req.flash('successToast'),
        errorToast: req.flash('errorToast')
    })
});

app.post('/', (req, res, next)=>{
    passport.authenticate('local', {
        successRedirect: '/admin/dashboard',
        failureRedirect: '/admin/',
        failureFlash: true
    })(req, res, next);
});

app.get('/dashboard', ensureAuth, async(req, res)=>{
    const drugs = await Drugs.find({ }).sort({'time': -1}).limit(5);
    const alerts = await Alerts.find({ }).sort({'time': -1}).limit(5);
    let pharmaciesArray = await Drugs.find({ }).distinct('pharmacy');
    let pharmacies = [];
    
    pharmaciesArray = pharmaciesArray.reverse().slice(0,6);
    for(let i=0; i<pharmaciesArray.length; i++){
        pharmacies.push(await Drugs.findOne({ pharmacy: pharmaciesArray[i] }).sort({'time': -1}));
    }
    
    const totalPharmacies = (await Drugs.distinct('pharmacy', { })).length;
    const totalDrugs = await Drugs.find({ }).count();
    const totalAlerts = await Alerts.find({ }).count();

    res.render('admin/dashboard', {
       title: 'Dashboard',
       drugs,
       pharmacies,
       alerts,
       totalDrugs,
       totalAlerts,
       totalPharmacies,
       successToast: req.flash('successToast'),
       errorToast: req.flash('errorToast')
    });
});

app.get('/pharmacies', ensureAuth, (req, res)=>{
    res.render('admin/pharmacies', {
       title: 'Pharmacies',
       logo2: true,
    });
});

app.get('/alerts', ensureAuth, async(req, res)=>{
    const drugs = await Drugs.find({ }).sort({'time': -1}).limit(20);
    res.render('admin/drugs', {
       title: 'Drugs',
       logo2: true,
       drugs
    });
});

app.get('/alerts/new', ensureAuth, (req, res)=>{
    res.render('admin/new-drug', {
        title: 'Add Drugs',
        logo2: true,
        filepond: true
    })
});

app.post('/alerts/new', ensureAuth, (req, res)=>{
    const {
        name,
        pharmacy,
        batchNo,
        nafdacNo,
        productionDate,
        expiryDate
    } = req.body;

    
    async function genDrugID(){

        let drugID = genIDs();
        
        const matchDrugID = await Drugs.findOne({ drugID });
        if(matchDrugID){
            return genDrugID();
        }
    
        Drugs.create({
            drugID,
            name,
            pharmacy,
            batchNo,
            nafdacNo,
            productionDate,
            expiryDate,
            time: new Date().setHours(new Date().getHours() + 1)
        });


        cronjob(drugID, expiryDate, name);


        req.flash('successToast', `Adding Drug Successful`);
        res.redirect(301, '/admin/dashboard');

    }

    genDrugID();

});

app.get('/alerts/delete/:drugID', ensureAuth, async(req, res)=>{
    const drugID = req.params.drugID;

    var drug = await Drugs.findOneAndDelete({ drugID })
    // fs.unlinkSync(path.resolve(__dirname,'../public/img/drugs/'+drug.image));

    for(let task of global[drugID]){
        task.destroy();
    }
    delete global[drugID];

    req.flash('successToast', 'Drug Deleted!!!')
    res.redirect(301, '/admin/dashboard');

});

app.post('/alerts/edit/:drugID', ensureAuth, async(req, res)=>{
    const drugID = req.params.drugID;
    const {
        name,
        pharmacy,
        batchNo,
        nafdacNo,
        productionDate,
        expiryDate
    } = req.body;

    await Drugs.findOneAndUpdate({ drugID }, {$set: {
            name,
            pharmacy,
            batchNo,
            nafdacNo,
            productionDate,
            expiryDate,
        }
    });


    for(let task of global[drugID]){
        task.destroy();
    }
    delete global[drugID];

    cronjob(drugID, expiryDate, name);

    req.flash('successToast', 'Edited Succesfully');
    res.redirect(301, '/admin/dashboard');

});

app.get('/alerts/:drugID', ensureAuth, async(req, res)=>{
    const drugID = req.params.drugID;
    const drug = await Drugs.findOne({ drugID });

    if(!drug) {
        req.flash('errorToast','Drug Not Found');
        return res.redirect('/admin/dashboard')
    };

    res.render('admin/drug', {
        title: drug.name,
        logo2: true,
        filepond: true,
        drug
    });
});

module.exports = app;
