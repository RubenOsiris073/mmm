import React from 'react';
import Webcam from 'react-webcam';

const WebcamCapture = ({ webcamRef, showWebcam }) => {
  if (!showWebcam) return null;

  return (
    <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          facingMode: "environment",
          width: 640,
          height: 480
        }}
      />
    </div>
  );
};

export default WebcamCapture;