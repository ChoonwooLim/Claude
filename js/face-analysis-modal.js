// This file will contain all the logic for face detection using face-api.js

// --- DOM Elements ---
let videoEl = null;
let canvas = null;
let statusMessage = null;
let actorGallery = null;
let createShortsBtn = null;
let clipsOutput = null;

// --- State ---
let modelsLoadedPromise = null;
let detectionInterval = null;
const detectedFaces = []; // { label, descriptor, image }
const sceneTimestamps = {}; // { "Actor 1": [{ start, end }], "Actor 2": [...] }
let selectedActor = null;

/**
 * Loads all the required models for face-api.js.
 */
function loadFaceApiModels() {
    modelsLoadedPromise = new Promise(async (resolve, reject) => {
        try {
            statusMessage.style.display = 'block';
            statusMessage.className = 'status-message info';
            statusMessage.textContent = '얼굴 인식 모델을 불러오는 중입니다... (최초 1회, 약 10-20초 소요)';
            console.log('Loading face-api models...');

            await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights');
            await faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights');
            await faceapi.nets.faceRecognitionNet.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights');
            
            console.log('Face-api models loaded successfully.');
            statusMessage.className = 'status-message success';
            statusMessage.textContent = '✅ 얼굴 인식 모델 로딩 완료! 비디오를 재생하면 분석이 시작됩니다.';
            resolve(true);
        } catch (error) {
            console.error('Error loading face-api models:', error);
            statusMessage.className = 'status-message error';
            statusMessage.textContent = '❌ 오류: 얼굴 인식 모델을 불러올 수 없습니다. 페이지를 새로고침 해주세요.';
            reject(error);
        }
    });
}

/**
 * Starts detecting faces in the video stream.
 */
async function startFaceDetection() {
    if (!videoEl) return;
    if (detectionInterval) clearInterval(detectionInterval);

    try {
        await modelsLoadedPromise;
        console.log('Models confirmed loaded. Starting face detection.');
        
        const displaySize = { width: videoEl.clientWidth, height: videoEl.clientHeight };
        faceapi.matchDimensions(canvas, displaySize);

        detectionInterval = setInterval(async () => {
            if (videoEl.paused || videoEl.ended) return;
            
            const detections = await faceapi.detectAllFaces(videoEl, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);
            updateDetectedFaces(detections, videoEl.currentTime);
        }, 500);
    } catch (error) {
        console.error("Could not start face detection.", error);
    }
}

/**
 * Compares detected faces and updates the gallery and timestamps.
 * @param {Array} detections - The full detections from face-api.js.
 * @param {number} currentTime - The current time of the video playback.
 */
async function updateDetectedFaces(detections, currentTime) {
    if (detections.length === 0) return;

    const matchedLabelsInFrame = new Set();
    const faceMatcher = detectedFaces.length > 0 ? new faceapi.FaceMatcher(detectedFaces.map(f => new faceapi.LabeledFaceDescriptors(f.label, [f.descriptor]))) : null;

    for (const detection of detections) {
        let bestMatch = faceMatcher ? faceMatcher.findBestMatch(detection.descriptor) : { label: 'unknown', distance: 1 };

        if (bestMatch.label === 'unknown' || bestMatch.distance > 0.45) {
            const newActorId = `배우 ${detectedFaces.length + 1}`;
            const faceCanvas = await faceapi.extractFaces(videoEl, [detection.detection]);
            const faceDataUrl = faceCanvas[0].toDataURL();

            detectedFaces.push({ label: newActorId, descriptor: detection.descriptor, image: faceDataUrl });
            sceneTimestamps[newActorId] = [];
            addFaceToGallery(newActorId, faceDataUrl);
            faceCanvas.forEach(c => c.remove());
            bestMatch.label = newActorId;
        }

        if (bestMatch.label !== 'unknown') {
            matchedLabelsInFrame.add(bestMatch.label);
        }
    }

    for (const label of matchedLabelsInFrame) {
        recordTimestamp(label, currentTime);
    }
}

/**
 * Records the appearance time for a given actor.
 * @param {string} label - The label of the actor.
 * @param {number} currentTime - The current time in the video.
 */
function recordTimestamp(label, currentTime) {
    const timestamps = sceneTimestamps[label];
    const lastScene = timestamps.length > 0 ? timestamps[timestamps.length - 1] : null;

    if (lastScene && (currentTime - lastScene.end) < 2.0) {
        lastScene.end = currentTime;
    } else {
        timestamps.push({ start: currentTime, end: currentTime });
    }
}

/**
 * Adds a new face to the actor gallery UI.
 * @param {string} label - The label for the new actor.
 * @param {string} imageSrc - The base64 data URL for the actor's face image.
 */
function addFaceToGallery(label, imageSrc) {
    const actorCard = document.createElement('div');
    actorCard.className = 'actor-card';
    const img = document.createElement('img');
    img.src = imageSrc;
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'actor-name-input';
    nameInput.value = label;
    actorCard.append(img, nameInput);

    actorCard.addEventListener('click', () => {
        document.querySelectorAll('#face-actor-gallery .actor-card').forEach(c => c.classList.remove('selected'));
        actorCard.classList.add('selected');
        selectedActor = label;
        createShortsBtn.disabled = false;
        createShortsBtn.textContent = `'${label}'(으)로 숏츠 만들기`;
    });
    actorGallery.appendChild(actorCard);
}

// --- Modal Initialization ---
function initializeModal() {
    console.log("Initializing Face Analysis Modal...");
    
    videoEl = document.getElementById('face-video');
    canvas = document.getElementById('face-overlay-canvas');
    statusMessage = document.getElementById('face-status-message');
    actorGallery = document.getElementById('face-actor-gallery');
    createShortsBtn = document.getElementById('face-create-shorts-btn');
    clipsOutput = document.getElementById('face-clips-output');
    
    if (!videoEl || !canvas || !statusMessage || !actorGallery || !createShortsBtn || !clipsOutput) {
        console.error('Modal elements not found!');
        return;
    }

    if (!modelsLoadedPromise) loadFaceApiModels();

    videoEl.addEventListener('play', startFaceDetection);

    if(actorGallery) actorGallery.innerHTML = '';
    detectedFaces.length = 0;
    Object.keys(sceneTimestamps).forEach(key => delete sceneTimestamps[key]);
    selectedActor = null;
    createShortsBtn.disabled = true;
    createShortsBtn.textContent = '선택한 배우로 숏츠 만들기';
    clipsOutput.innerHTML = '';

    createShortsBtn.addEventListener('click', () => {
        if (!selectedActor) return;
        const clips = sceneTimestamps[selectedActor];
        if (!clips || clips.length === 0) {
            clipsOutput.innerHTML = `<p>출연 장면을 찾을 수 없습니다.</p>`;
            return;
        }

        clipsOutput.innerHTML = `<h4>"${selectedActor}" 출연 숏츠 클립</h4>`;
        clips.forEach((clip, index) => {
            if (clip.end - clip.start < 1.0) return;
            const clipDiv = document.createElement('div');
            clipDiv.className = 'clip-item';
            const startTime = new Date(clip.start * 1000).toISOString().substr(14, 5);
            const endTime = new Date(clip.end * 1000).toISOString().substr(14, 5);
            clipDiv.textContent = `클립 ${index + 1}: ${startTime} ~ ${endTime} (${(clip.end - clip.start).toFixed(1)}초)`;
            clipsOutput.appendChild(clipDiv);
        });
    });
}

// Listen for the custom event to initialize
const modalVideoElement = document.getElementById('face-video');
if (modalVideoElement) {
    modalVideoElement.addEventListener('modalopened', initializeModal);
} else {
    // Fallback for when script loads before DOM is fully parsed
    document.addEventListener('DOMContentLoaded', () => {
         document.getElementById('face-video').addEventListener('modalopened', initializeModal);
    });
}

function openFaceAnalysisModal() {
    console.log("Face Analysis Modal opened.");
} 