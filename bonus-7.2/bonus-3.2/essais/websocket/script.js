const IMAGE_INTERVAL_MS = 42;
// pour 24 images par seconde

const drawFaceRectangles = (video, canvas, faces) => {
  const ctx = canvas.getContext('2d');

  ctx.width = video.videoWidth;
  ctx.height = video.videoHeight;

  ctx.beginPath();
  ctx.clearRect(0, 0, ctx.width, ctx.height);
  for (const [x, y, width, height] of faces.faces) {
    ctx.strokeStyle = "#49fb35";
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.stroke();
  }
};

const startFaceDetection = (video, canvas, deviceId) => {
  const socket = new WebSocket('ws://localhost:8000/face-detection');
  let intervalId;

  // La connexion est ouverte
  socket.addEventListener('open', function () {

    // Lecture de la vidéo depuis la webcam
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        deviceId,
        width: { max: 640 },
        height: { max: 480 },
      },
    }).then(function (stream) {
      video.srcObject = stream;
      video.play().then(() => {
        // Adaptation des dimensions canvas <-> vidéo
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Envoi d'une image dans la socket Web toutes les 42 ms (soit 24 images par seconde)
        intervalId = setInterval(() => {

          // Création d'un canvas virtuel pour l'image vidéo capturée
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);

          // Conversion en JPEG et envoi dans la WebSocket
          canvas.toBlob((blob) => socket.send(blob), 'image/jpeg');
        }, IMAGE_INTERVAL_MS);
      });
    });
  });

  // En écoute d'un message
  socket.addEventListener('message', function (event) {
    drawFaceRectangles(video, canvas, JSON.parse(event.data));
  });

  // On ferme tout
  socket.addEventListener('close', function () {
    window.clearInterval(intervalId);
    video.pause();
  });

  return socket;
};

window.addEventListener('DOMContentLoaded', (event) => {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const cameraSelect = document.getElementById('camera-select');
  let socket;

  // Recherche des webcams disponibles
  navigator.mediaDevices.enumerateDevices().then((devices) => {
    for (const device of devices) {
      if (device.kind === 'videoinput' && device.deviceId) {
        const deviceOption = document.createElement('option');
        deviceOption.value = device.deviceId;
        deviceOption.innerText = device.label;
        cameraSelect.appendChild(deviceOption);
      }
    }
  });

  // Si 'submit', commencement de la reconnaissance de visages
  document.getElementById('form-connect').addEventListener('submit', (event) => {
    event.preventDefault();

    // Fermeture de la socket précédente si c'est le cas
    if (socket) {
      socket.close();
    }

    const deviceId = cameraSelect.selectedOptions[0].value;
    socket = startFaceDetection(video, canvas, deviceId);
  });

});
