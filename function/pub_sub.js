const redis = require('redis');

const TOPIC = 'realtime waiting customer';

function subscribe(callback) {
    const subscriber = redis.createClient();
    //대체 이건 뭘까
    subscriber.subscribe(TOPIC);

    subscriber.on('error', (error)=>{
        console.error(error)
    });
    subscriber.on('message', function(channel, message){
        console.log(`Subscriber is receiving message \nchannel: ${channel}\n
        message: ${message}`)
    });
}

function publish(data) {
    const publisher = redis.createClient();
    publisher.publish(TOPIC, data);
}

module.exports = {
    subscribe : subscribe,
    publish : publish
}