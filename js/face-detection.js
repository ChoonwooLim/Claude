// This file will contain all the logic for face detection using face-api.js

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights';

// --- DOM Elements ---
let videoEl = null;
let canvas = null;
let statusMessage = null;
let actorGallery = null;

// --- State ---
let modelsLoadedPromise = null;
let detectionInterval = null;
const faceMatcher = null;
const detectedFaces = []; // { label, descriptor, image }
const sceneTimestamps = {}; // { "Actor 1": [{ start, end }], "Actor 2": [...] }
let selectedActor = null;

/**
 * Loads all the required models for face-api.js.
 * Displays the loading status to the user.
 */
function loadFaceApiModels() {
    modelsLoadedPromise = new Promise(async (resolve, reject) => {
        try {
            statusMessage.style.display = 'block';
            statusMessage.className = 'status-message info';
            statusMessage.textContent = '얼굴 인식 모델을 불러오는 중입니다... (최초 1회, 약 10-20초 소요)';
            console.log('Loading face-api models...');

            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
            await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
            await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
            
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
 * Starts detecting faces in the video stream and draws rectangles on the canvas.
 * Also performs face recognition to identify unique individuals and log their appearance times.
 */
async function startFaceDetection() {
    if (!videoEl) {
        return;
    }

    // Clear previous interval if it exists
    if (detectionInterval) {
        clearInterval(detectionInterval);
        detectionInterval = null;
    }

    try {
        await modelsLoadedPromise;
        console.log('Models confirmed loaded. Starting face detection and recognition...');
        
        const displaySize = { width: videoEl.clientWidth, height: videoEl.clientHeight };
        faceapi.matchDimensions(canvas, displaySize);

        detectionInterval = setInterval(async () => {
            if (videoEl.paused || videoEl.ended) {
                // We don't clear the interval here, just stop processing frames
                // The detection will resume if the user plays again.
                return;
            }
            
            // More comprehensive detection for recognition
            const detections = await faceapi.detectAllFaces(videoEl, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptors();

            if (detections.length === 0) {
                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);

            // Handle face recognition
            updateDetectedFaces(detections, videoEl.currentTime);

        }, 500); // Slower interval for more complex recognition task

    } catch (error) {
        console.error("Could not start face detection because models failed to load.", error);
        statusMessage.className = 'status-message error';
        statusMessage.textContent = '❌ 모델 로딩에 실패하여 분석을 시작할 수 없습니다.';
    }
}

/**
 * Compares detected faces with already known faces and adds new unique faces to the gallery.
 * @param {Array} detections - The full detections from face-api.js, including descriptors.
 * @param {number} currentTime - The current time of the video playback.
 */
async function updateDetectedFaces(detections, currentTime) {
    if (detections.length === 0) return;

    const matchedLabelsInFrame = new Set();

    for (const detection of detections) {
        // Check if this face is already known
        let bestMatch = { distance: 1, label: 'unknown' };
        if (detectedFaces.length > 0) {
            const faceMatcher = new faceapi.FaceMatcher(detectedFaces.map(f => new faceapi.LabeledFaceDescriptors(f.label, [f.descriptor])));
            const match = faceMatcher.findBestMatch(detection.descriptor);
            bestMatch = match;
        }

        // If the face is new (distance is high), add it to our list
        if (bestMatch.label === 'unknown' || bestMatch.distance > 0.45) { // Threshold for new face
            const newActorId = `배우 ${detectedFaces.length + 1}`;
            
            // Extract the face image
            const faceCanvas = await faceapi.extractFaces(videoEl, [detection.detection]);
            const faceDataUrl = faceCanvas[0].toDataURL();

            detectedFaces.push({
                label: newActorId,
                descriptor: detection.descriptor,
                image: faceDataUrl
            });
            sceneTimestamps[newActorId] = []; // Initialize timestamps for new actor

            // Update the UI
            addFaceToGallery(newActorId, faceDataUrl);
            faceCanvas.forEach(c => c.remove()); // Clean up temp canvases
            
            bestMatch.label = newActorId; // From now on, this is the matched label
        }

        // Add the matched label to a set for this frame
        if (bestMatch.label !== 'unknown') {
            matchedLabelsInFrame.add(bestMatch.label);
        }
    }

    // After checking all faces in the frame, update timestamps for actors present
    for (const label of matchedLabelsInFrame) {
        recordTimestamp(label, currentTime);
    }
}

/**
 * Records the appearance time for a given actor, merging with recent scenes.
 * @param {string} label - The label of the actor.
 * @param {number} currentTime - The current time in the video.
 */
function recordTimestamp(label, currentTime) {
    const actorTimestamps = sceneTimestamps[label];
    if (!actorTimestamps) return;

    const lastScene = actorTimestamps.length > 0 ? actorTimestamps[actorTimestamps.length - 1] : null;

    // If last scene was very recent (less than 2s ago), merge with it by extending the end time
    if (lastScene && (currentTime - lastScene.end) < 2.0) {
        lastScene.end = currentTime;
    } else {
        // Otherwise, start a new scene
        actorTimestamps.push({ start: currentTime, end: currentTime });
    }
    console.log(`Updated Timestamps for ${label}:`, sceneTimestamps[label].map(s => `${s.start.toFixed(1)}-${s.end.toFixed(1)}`).join(', '));
}

/**
 * Adds a new face to the actor gallery in the UI.
 * @param {string} label - The label for the new actor (e.g., "Actor 1").
 * @param {string} imageSrc - The base64 data URL for the actor's face image.
 */
function addFaceToGallery(label, imageSrc) {
    if (!actorGallery) return;

    const actorCard = document.createElement('div');
    actorCard.className = 'actor-card';
    actorCard.dataset.label = label;

    const img = document.createElement('img');
    img.src = imageSrc;

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'actor-name-input';
    nameInput.value = label;

    actorCard.appendChild(img);
    actorCard.appendChild(nameInput);
    
    actorCard.addEventListener('click', () => {
        // Remove 'selected' from all other cards
        document.querySelectorAll('.actor-card').forEach(card => card.classList.remove('selected'));
        // Add 'selected' to the clicked card
        actorCard.classList.add('selected');
        selectedActor = label;

        // Enable the create shorts button
        const createBtn = document.getElementById('create-shorts-btn');
        createBtn.disabled = false;
        createBtn.textContent = `'${label}'(으)로 숏츠 만들기`;
    });

    actorGallery.appendChild(actorCard);
}

/**
 * Initializes the script once the DOM is loaded.
 * Finds necessary elements and sets up event listeners.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Assign DOM elements
    videoEl = document.getElementById('video');
    canvas = document.getElementById('overlay-canvas');
    statusMessage = document.getElementById('status-message');
    actorGallery = document.getElementById('actor-gallery');
    const createShortsBtn = document.getElementById('create-shorts-btn');
    const clipsOutput = document.getElementById('clips-output');
    
    // Check if elements exist
    if (!videoEl || !canvas || !statusMessage || !actorGallery || !createShortsBtn || !clipsOutput) {
        console.error('One or more required HTML elements are missing!');
        return;
    }
    
    // Load models as soon as the DOM is ready
    loadFaceApiModels();

    // Add event listener to start detection when video plays
    videoEl.addEventListener('play', startFaceDetection);
    videoEl.addEventListener('pause', () => {
        // We don't need to clear the interval, as the loop checks for paused state.
        // This prevents re-starting detection from scratch on every play/pause cycle.
        console.log("Video paused. Detection loop is idle.");
    });
    videoEl.addEventListener('loadeddata', () => {
        // Reset gallery when new video is loaded
        if(actorGallery) actorGallery.innerHTML = '';
        detectedFaces.length = 0;
        Object.keys(sceneTimestamps).forEach(key => delete sceneTimestamps[key]);
        
        // Reset selection and button
        selectedActor = null;
        createShortsBtn.disabled = true;
        createShortsBtn.textContent = '선택한 배우로 숏츠 만들기';
        clipsOutput.innerHTML = '';
    });

    createShortsBtn.addEventListener('click', () => {
        if (!selectedActor) {
            alert('먼저 갤러리에서 배우를 선택해주세요.');
            return;
        }

        const actorClips = sceneTimestamps[selectedActor];
        if (!actorClips || actorClips.length === 0) {
            clipsOutput.innerHTML = `<p>${selectedActor}의 출연 장면을 찾을 수 없습니다.</p>`;
            return;
        }

        clipsOutput.innerHTML = `<h4>"${selectedActor}" 출연 숏츠 클립 목록</h4>`;
        actorClips.forEach((clip, index) => {
            // Filter out very short clips
            if (clip.end - clip.start < 1.0) return;

            const clipDiv = document.createElement('div');
            clipDiv.className = 'clip-item';
            
            const startTime = new Date(clip.start * 1000).toISOString().substr(14, 5);
            const endTime = new Date(clip.end * 1000).toISOString().substr(14, 5);

            clipDiv.textContent = `클립 ${index + 1}: ${startTime} ~ ${endTime} (길이: ${(clip.end - clip.start).toFixed(1)}초)`;
            clipsOutput.appendChild(clipDiv);
        });
    });
}); 