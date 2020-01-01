/*
    Test script to play around with Tello SDK 1.3.0.0
    2 Nov 2019

    TODO 1: 
    - Study how video decoding works
        - DONE, checked for ffmpeg lib, but implementation might take several time to develop, note that there are js libs like muxer.js than can decode live on frontend app
    TODO 2:
    - Implement web sockets to stream video raw data to browser interface
        - DONE for drone state, sending h264 raw stream shoulnd't be a problem, testing missing for video
    TODO 3:
    - Make an Angular Interface to display dron state data
        - DONE

    1 jan 2020
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

//creating web socket connection on port 5000 to send h264 raw data packages
const WebSocket = require('ws');

const webSocketServer = new WebSocket.Server({ port: 5000 });

//wait for socket server connection to be established
webSocketServer.on('connection', function connection(ws) {
    //stablish connection with drone via udp
    droneSDK.send('command', 0, 'command'.length, DRONE_SDK_PORT, DRONE_IP_ADDRESS, function(error, drone_message){
        if(error)
        {
            throw(error);
        }
        else
        {
            //on drone message handler
            droneSDK.on('message', message => {
                droneState.on('message', drone_state => {
                    //debug only, check for data send through socket
                    console.log('drone state : ', drone_state.toString());
                    //send readable state data trough socket to display on angular app
                    ws.send(drone_state.toString());
                });
            });
        }
    });

});

//we send h264 stream in arraybuffer form to port 11111 using command "streamon"
/*droneSDK.send('streamon', 0, 'streamon'.length, DRONE_SDK_PORT, DRONE_IP_ADDRESS, function(error, drone_message){
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

            webSocketServer.send(video_feed);
        });
    }
});*/

