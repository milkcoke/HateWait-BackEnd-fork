
const models = require('../models');
const storeModel = models.store;
const memberModel = models.member;

function store(id){
    storeModel.findOne({
        where : {id: id}
    })
        .then(store=>{
            return store;
        })
        .catch(error=>{
            throw error;
        })
}

function member(id){
    memberModel.findOne({
        where : {id: id}
    })
        .then(member=>{
            return member;
        })
        .catch(error=>{
            throw error;
        })
}

module.exports={
    store: store,
    member: member
}
