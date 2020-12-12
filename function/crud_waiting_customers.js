
// {
//     CRUD: null,
//     customer : null
// }

function addNewCustomer(storeId, newCustomer) {
    console.log("I'm in new customer function I got this\n", storeId, newCustomer);
    storeMap.get(storeId).forEach(session=>{
        session.response.write(JSON.stringify({CRUD : 'create', customer : newCustomer}));
    });
}

function callCustomer(storeId, callCustomer) {
    storeMap.get(storeId).forEach(session=>{
        session.response.write(JSON.stringify({CRUD : 'update', customer: callCustomer}));
    });
}

// {
//     phone: 전화번호
// }
function removeCustomer(storeId, targetCustomer) {
    storeMap.get(storeId).forEach(session=>{
        session.response.write(JSON.stringify({CRUD : 'delete', customer: targetCustomer}));
    });
}

module.exports = {
    add : addNewCustomer,
    call : callCustomer,
    delete : removeCustomer
}