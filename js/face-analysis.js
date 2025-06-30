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

export async function analyzeFaces(videoElement) {
    if (!modelsLoaded) {
        console.error("모델이 로드되지 않았습니다.");
        return null;
    }

    console.log("얼굴 분석 시작...");
    const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 });
    const detections = await faceapi.detectAllFaces(videoElement, options)
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender()
        .withFaceDescriptors();
    
    console.log("얼굴 분석 완료:", detections);
    return detections;
} 