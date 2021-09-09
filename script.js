(()=> {
    const dotBox = document.querySelector('.dot-box');

    const actx = new AudioContext();
    const num = 256;

    // const analyser = actx.createAnalyser();
    const analyser = new AnalyserNode(actx, {
        fftSize: num,
        minDecibels: -90,
        maxDecibels: -25,
        smoothingTimeConstant: 0.85,
    });

    // analyser.fftSize = num;
    // analyser.minDecibels = -90;
    // analyser.maxDecibels = 0;
    // let bufferLength = analyser.fftSize;
    let bufferLength = analyser.frequencyBinCount;
    let array = new Uint8Array(bufferLength);

    async function setupContext() {
        const input = await getInput()
        if(actx.state === 'suspended'){
            await actx.resume()
        }
        // console.log(actx.state)
        const src = actx.createMediaStreamSource(input)
        src.connect(analyser)
    }
    setupContext();

    function getInput() {
        return navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancelation: false,
                autoGainControl: false,
                noiseSuppresion: false,
                latency: 0
            }
        })
    }

    const cnv = document.querySelector('canvas');
    const ctx = cnv.getContext('2d');

    const ringsNmbr = 2;
    const ringRadius = 100;

    let centerX = cnv.width  / 2;
    let centerY = cnv.height / 2;

    function init() {
        cnv.width = innerWidth;
        cnv.height = innerHeight;
        centerX = cnv.width  / 2;
        centerY = cnv.height / 2;
        // ctx.scale(1/1.2, 1/1.2);
        // ctx.translate(cnv.width  / 6, cnv.height / 6);
    }
    init();

    function drawCircles(circleRadius) {
        for (let i = 0; i < 20; i++) {
            let cRadOffset = circleRadius * i*2;
            // console.log(cRadOffset);

            let grd = ctx.createRadialGradient(cnv.width/2, cnv.height/2, 5, cnv.width/2, cnv.height/2, 20);
            grd.addColorStop(0, `hsl(${circleRadius * 100}, 80%, 75%, ${0.6 - cRadOffset*0.01})`);
            grd.addColorStop(1, `hsl(${circleRadius * 170}, 75%, 70%, ${0.6 - cRadOffset*0.01})`);

            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.ellipse(cnv.width/2, cnv.height/2, circleRadius + cRadOffset, circleRadius + cRadOffset, 0, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
    }

    function draw(radiusOffset, angleOffset) {
        analyser.getByteFrequencyData(array);

        let circleRadius = array[0]/20;
        if (circleRadius < 0.5) {
            circleRadius = 0.5;
        }
        drawCircles(circleRadius);

        let segments = array.length;
        let radius = (cnv.width + array[0]*8) / 45 + radiusOffset;
        let angle = (Math.PI * 5) / segments;

        for (let i = 0; i < segments; i++) {
            let barHeight = array[i] > 0 ? array[i]/1.5 + (cnv.width*0.005) : 1;

            // console.log(barHeight);
            // if (barHeight > ) {}
            ctx.strokeStyle = `hsl(${360 - (barHeight*3.63)}, 69%, 74%, ${barHeight*0.0045})`;
            ctx.lineWidth = barHeight/10;

            let x1 = cnv.width / 2 + Math.cos(angle * i) * radius;
            let x2 = cnv.width / 2 + Math.cos(angle * i + angleOffset) * (radius + barHeight);

            let y1 = cnv.height / 2 + Math.sin(angle * i) * radius;
            let y2 = cnv.height / 2 + Math.sin(angle * i + angleOffset) * (radius + barHeight);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.closePath();
            ctx.stroke();
        }
    }

    function update() {
        for (let i = 0; i < ringsNmbr; i++) {
            let radiusOffset = i * 6;
            let angleOffset = (i * Math.PI / 180) * 6;
            draw(radiusOffset, angleOffset);
        }
    }

    function render() {
        ctx.clearRect(0, 0, cnv.width, cnv.height);
        update()

        requestAnimationFrame(render);
    }
    render();

    window.addEventListener('resize', init);
})()