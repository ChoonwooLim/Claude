import * as DOM from './dom-elements.js';

const MODEL_URL = './models';

let modelsLoaded = false;

export async function loadModels() {
    if (modelsLoaded) return;
    try {
        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
            faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)
        ]);
        modelsLoaded = true;
        console.log("FaceAPI 모델 로딩 완료");
    } catch (error) {
        console.error("FaceAPI 모델 로딩 실패:", error);
    }
}

async function waitForSeek(videoElement) {
    return new Promise(resolve => {
        videoElement.addEventListener('seeked', () => resolve(), { once: true });
    });
}

function drawFaceResult(face) {
    const { detection, expressions, age, gender, descriptor } = face;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const { x, y, width, height } = detection.box;

    const faceImage = document.createElement('img');
    faceImage.src = face.image;

    faceImage.onload = () => {
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(faceImage, x, y, width, height, 0, 0, width, height);

        const container = document.createElement('div');
        container.classList.add('face-result-item');

        const imgElement = document.createElement('img');
        imgElement.src = canvas.toDataURL();
        imgElement.title = `표정: ${Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b)}
성별: ${gender === 'male' ? '남성' : '여성'}
나이: ${Math.round(age)}세`;

        container.appendChild(imgElement);
        DOM.faceResults.appendChild(container);
    };
}

export async function analyzeFaces(videoElement) {
    if (!modelsLoaded) {
        console.error("모델이 로드되지 않았습니다.");
        return null;
    }

    console.log("얼굴 분석 시작...");
    DOM.analyzeFacesBtn.disabled = true;
    DOM.analyzeFacesBtn.textContent = "분석 중...";
    DOM.analysisProgress.style.display = 'block';
    DOM.faceResults.innerHTML = '';

    const foundFaces = [];
    let faceMatcher = null;
    const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });
    const videoDuration = videoElement.duration;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    videoElement.pause();

    for (let i = 0; i < videoDuration; i++) {
        videoElement.currentTime = i;
        await waitForSeek(videoElement);

        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        const detections = await faceapi.detectAllFaces(canvas, options)
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender()
            .withFaceDescriptors();

        if (detections.length > 0) {
            if (!faceMatcher) {
                // First found faces
                detections.forEach(det => {
                    const faceData = {
                        ...det,
                        image: canvas.toDataURL()
                    };
                    foundFaces.push(faceData);
                    drawFaceResult(faceData);
                });
                const labeledDescriptors = foundFaces.map((f, idx) => new faceapi.LabeledFaceDescriptors(`person${idx}`, [f.descriptor]));
                faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
            } else {
                for (const det of detections) {
                    const bestMatch = faceMatcher.findBestMatch(det.descriptor);
                    if (bestMatch.label === 'unknown') {
                        const faceData = {
                            ...det,
                            image: canvas.toDataURL()
                        };
                        foundFaces.push(faceData);
                        drawFaceResult(faceData);
                        
                        const labeledDescriptors = foundFaces.map((f, idx) => new faceapi.LabeledFaceDescriptors(`person${idx}`, [f.descriptor]));
                        faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
                    }
                }
            }
        }
        
        const progress = (i / videoDuration) * 100;
        DOM.faceProgressFill.style.width = `${progress}%`;
        DOM.faceProgressText.textContent = `${Math.round(progress)}%`;
    }

    console.log("얼굴 분석 완료:", foundFaces);
    DOM.analysisProgress.style.display = 'none';
    DOM.analyzeFacesBtn.disabled = false;
    DOM.analyzeFacesBtn.textContent = "얼굴 분석 시작";
    
    return foundFaces;
} 