
//These function follows the standard of SSE
function readAllCustomer(storeId) {

}

function addNewCustomer(storeId, newCustomer) {
    // if(storeMap.has(storeId)) {
    //
    // }
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

function removeCustomer(storeId, targetCustomer) {
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