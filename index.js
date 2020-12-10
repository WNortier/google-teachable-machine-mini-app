document.addEventListener(
  'DOMContentLoaded',
  async () => {
    // More API functions here:
    // https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

    // the link to your model provided by Teachable Machine export panel
    const label = document.querySelector('#label-container');
    const reply = document.querySelector('#reply');
    const btn = document.querySelector('#btn');
    const mugCount = document.querySelector('#mug-count');
    const feed = document.querySelector('#feed');
    const myVideo = document.querySelector('#video1');
    mugCount.innerHTML = localStorage.getItem('mugs-eaten') || 0;
    const URL = './my_model/';

    let model, webcam, labelContainer, maxPredictions;

    btn.addEventListener('click', async () => {
      await init();
      btn.style.display = 'none';
    });

    // Load the image model and setup the webcam
    async function init() {
      const modelURL = URL + 'model.json';
      const metadataURL = URL + 'metadata.json';

      // load the model and metadata
      // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
      // or files from your local hard drive
      // Note: the pose library adds "tmImage" object to your window (window.tmImage)
      model = await tmImage.load(modelURL, metadataURL);
      maxPredictions = model.getTotalClasses();

      // Convenience function to setup a webcam
      const flip = true; // whether to flip the webcam
      webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
      await webcam.setup(); // request access to the webcam
      await webcam.play();
      window.requestAnimationFrame(loop);

      // append elements to the DOM
      myVideo.style.display = 'block';
      feed.innerHTML = 'Grrrrrr!!! Feed me your mugs, human!';
      let mugsEaten = localStorage.getItem('mugs-eaten') || 0;

      labelContainer = document.getElementById('label-container');
      document.getElementById('webcam-container').appendChild(webcam.canvas);
      for (let i = 0; i < maxPredictions; i++) {
        // and class labels
        labelContainer.appendChild(document.createElement('div'));
      }
      labelContainer.innerHTML += `mugs-eaten: ${mugsEaten}`;
    }

    async function loop() {
      webcam.update(); // update the webcam frame
      await predict();
      window.requestAnimationFrame(loop);
    }

    // run the webcam image through the image model
    async function predict() {
      // predict can take in an image, video or canvas html element
      const prediction = await model.predict(webcam.canvas);
      for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
          prediction[i].className + ': ' + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
      }

      if (label.innerHTML.includes('1.0')) {
        feed.innerHTML = '';
        document.getElementById('webcam-container').innerHTML = '';

        let chance = Math.ceil(Math.random(Math.max(3)));
        switch (chance) {
          case 1: {
            reply.innerHTML = 'Thank you for that delicious mug!';
          }
          case 2: {
            reply.innerHTML = 'Omnomnom!';
          }
          case 3: {
            reply.innerHTML = 'Hmmmm, mugs are my favorite!';
          }
        }
        btn.style.display = 'none';
        label.style.display = 'none';

        myVideo.play();
        setTimeout(async () => {
          if (localStorage['mugs-eaten'] === undefined) {
            localStorage.setItem('mugs-eaten', 1);
          } else {
            let mugsEaten = parseFloat(localStorage.getItem('mugs-eaten'));
            mugsEaten++;
            localStorage.setItem('mugs-eaten', mugsEaten);
          }
          location.reload();
        }, 5000);
      }
    }
  },
  false
);
