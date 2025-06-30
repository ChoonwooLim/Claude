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

function displayGroupedFaceResults(faceGroups) {
    DOM.faceResults.innerHTML = '';

    const title = document.createElement('h3');
    title.innerHTML = `✅ <span style="color: var(--accent-color);">${faceGroups.length}</span>명의 실제 배우 얼굴을 정밀 분석했습니다!`;
    title.style.textAlign = 'center';
    title.style.marginBottom = '2rem';
    DOM.faceResults.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'face-card-grid';

    faceGroups.forEach((group, index) => {
        // Find the best detection in the group (e.g., largest, highest confidence)
        const representativeFace = group.sort((a, b) => (b.detection.box.width * b.detection.box.height) - (a.detection.box.width * a.detection.box.height))[0];
        const { detection, expressions, age, gender, image } = representativeFace;

        const card = document.createElement('div');
        card.className = 'face-card';

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            const { x, y, width, height } = detection.box;
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
            card.querySelector('.face-image-container').style.backgroundImage = `url(${canvas.toDataURL()})`;
        };
        img.src = image;

        const mainExpression = Object.entries(expressions).reduce((a, b) => a[1] > b[1] ? a : b)[0];

        card.innerHTML = `
            <div class="face-image-container"></div>
            <div class="face-info">
                <h4>배우 ${index + 1}</h4>
                <p><strong>신뢰도:</strong> ${Math.round(detection.score * 100)}%</p>
                <p><strong>나이:</strong> 약 ${Math.round(age)}세</p>
                <p><strong>성별:</strong> ${gender === 'male' ? '남성' : '여성'}</p>
                <p><strong>주요 표정:</strong> ${mainExpression}</p>
            </div>
            <div class="face-actions">
                <button class="btn-edit">수정</button>
                <button class="btn-upload">이미지 업로드</button>
                <button class="btn-delete">삭제</button>
            </div>
        `;
        grid.appendChild(card);
    });

    DOM.faceResults.appendChild(grid);
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

    const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.7 });
    const videoDuration = videoElement.duration;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const faceGroups = [];
    const distanceThreshold = 0.5;

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

        for (const detection of detections) {
            let bestMatchingGroup = null;
            let minDistance = Infinity;

            for (const group of faceGroups) {
                const representative = group[0];
                const distance = faceapi.euclideanDistance(detection.descriptor, representative.descriptor);
                
                if (distance < distanceThreshold && distance < minDistance) {
                    minDistance = distance;
                    bestMatchingGroup = group;
                }
            }
            
            const detectionWithImage = { ...detection, image: canvas.toDataURL() };

            if (bestMatchingGroup) {
                bestMatchingGroup.push(detectionWithImage);
            } else {
                faceGroups.push([detectionWithImage]);
            }
        }
        
        const progress = (i / videoDuration) * 100;
        DOM.faceProgressFill.style.width = `${progress}%`;
        DOM.faceProgressText.textContent = `${Math.round(progress)}%`;
    }

    console.log("얼굴 분석 완료. 총 그룹 수:", faceGroups.length);
    DOM.analysisProgress.style.display = 'none';
    DOM.analyzeFacesBtn.disabled = false;
    DOM.analyzeFacesBtn.textContent = "얼굴 분석 시작";
    
    if (faceGroups.length > 0) {
        displayGroupedFaceResults(faceGroups);
    } else {
        DOM.faceResults.innerHTML = '<p style="text-align: center;">영상에서 얼굴을 찾지 못했습니다.</p>';
    }

    return faceGroups;
} 