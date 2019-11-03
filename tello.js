/*
    Test script to play around with Tello SDK 1.3.0.0
    2 Nov 2019

    TODO 1: 
    - Study how video decoding works
    TODO 2:
    - Implement web sockets to stream video raw data to browser interface
    TODO 3:
    - Make an Angular Interface to display dron state data
    TODO 4:
    - Develop Angular Interface to stream "watchable" video data (flv, mpeg, mp4, whatever) with video HTML Element
*/ 

const DRONE_IP_ADDRESS = '192.168.10.1';
const DRONE_SDK_PORT = '8889';
const DRONE_STATE_PORT = '8890';
const DRONE_VIDEO_FEED_PORT = '11111';

//dgram for upd communication
var udp = require('dgram');

//drone SDK binding
var droneSDK = udp.createSocket('udp4');
droneSDK.bind(DRONE_SDK_PORT);

//drone state binding
var droneState = udp.createSocket('udp4');
droneState.bind(DRONE_STATE_PORT);

//video streaming binding
var droneVideoFeed = udp.createSocket('udp4');
droneVideoFeed.bind(DRONE_VIDEO_FEED_PORT);

//stablish connection with drone via udp
droneSDK.send('command', 0, 'command'.length, DRONE_SDK_PORT, DRONE_IP_ADDRESS, function(error, drone_message){
    if(error)
    {
        throw(error);
    }
    else
    {
        console.log('COMMAND SUCCESSFULLY SENDED TO DRONE', drone_message.toString());
    }
});

//on drone message handler
droneSDK.on('message', message => {
    //dado que la respuesta viene como buffer, utilizamos la función toString, para obtener información legible al humano
    console.log('TELLO CONNECTION STABLISHED!', message.toString());
});

//establecer conexión para poder obtener el estado actual del dron
//dado que command inicia el sdk no es necesario enviarlo nuevamente a menos que se pierda la conexión,
//por lo que podemos escuchar simplemente el puerto indicado (8890) para obtener los datos
droneState.on('message', drone_state => {
    console.log('drone state : ', drone_state.toString());
});

//iniciamos el streaming del video del dron en el puerto 11111, para poder hacer esto debemos mandar el comando 'streamon'
//enviamos el comando
droneSDK.send('streamon', 0, 'streamon'.length, DRONE_SDK_PORT, DRONE_IP_ADDRESS, function(error, drone_message){
    if(error)
    {
        throw(error);
    }
    else
    {
        console.log('VIDEO FEED WILL INITIALIZE NOW : ', drone_message.toString());
        droneVideoFeed.on('message', video_feed => {
            //video video is a h264 feed
            console.log(video_feed,toString());
        });
    }
});