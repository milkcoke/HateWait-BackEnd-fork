
// {
//     CRUD: null,
//     customer : null
// }

//These function follows the standard of SSE
function readAllCustomer(storeId) {

}

function addNewCustomer(storeId, newCustomer) {
    console.log("I'm in new customer function I got this\n", storeId, newCustomer);
    storeMap.get(storeId).forEach(session=>{
        session.response.write(`event: create\n`);
        session.response.write(`data: ${JSON.stringify({customer : newCustomer})}\n\n`);
    });
}

function callCustomer(storeId, callCustomer) {
    storeMap.get(storeId).forEach(session=>{
        session.response.write(`event: update\n`);
        session.response.write(`data: ${JSON.stringify({customer : callCustomer})}\n\n`);
    });
}

// {
//     phone: 전화번호
// }
function removeCustomer(storeId, targetCustomer) {
    // storeMap.get(storeId).forEach(session=>{
    //     session.response.write(JSON.stringify({CRUD : 'delete', customer: targetCustomer}));
    // });
    storeMap.get(storeId).forEach(session=>{
        session.response.write(`event: delete\n`);
        session.response.write(`data: ${JSON.stringify({customer : targetCustomer})}\n\n`);
    });
}

module.exports = {
    add : addNewCustomer,
    call : callCustomer,
    delete : removeCustomer
}