// Các thư viện sử dụng
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { Player } from './player.js';
import { updateSegments } from './segments.js';
import { Segment } from './segments.js';
import { loadCharacter, updateHeartDisplay } from './utilities.js';

// Tạo scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
window.renderer = new THREE.WebGLRenderer();
window.renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(window.renderer.domElement);

// Điều chỉnh camera
camera.position.set(0, 4, 3);
camera.lookAt(0, 2, 0)
var currentCamera = camera;

// Camera cảnh
const sceneCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
sceneCamera.position.set(5, 9, 20);
sceneCamera.lookAt(0, -10, -30);

// Camera Debug
const debugCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
debugCamera.position.set(100, 100, 20);
debugCamera.lookAt(0, -1, -75);

// Tạo camera điều khiển cho debug
const controls = new OrbitControls(debugCamera, renderer.domElement);

// Điều chỉnh số 1, 2 để thay đổi chế độ camera
document.addEventListener('keydown', (event) => {
    if (event.key == '1') {
        currentCamera = camera; // Camera mặc định
    } 
    else if (event.key == '2') {
        currentCamera = sceneCamera; // Camera cảnh
    }
    else if (event.key == '3') {
        currentCamera = debugCamera; // Camera debug
    }
});

// Ánh sáng
const ambientLight = new THREE.AmbientLight(0xffe17d, 1);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 1, -1);
scene.add(directionalLight);

// Sương mù
scene.fog = new THREE.Fog(0xcccccc, 1, 500); // Buổi sáng
// scene.fog = new THREE.Fog(0x808080, 1, 500); // Buổi tối

// Siêu tham số
const num_of_segments = 10; // Số lượng segment khởi tạo
const segments = []; // Lưu trữ các segments
export let isGameRunning = false; // 
let backgroundAudio; // Âm thanh nền
let player; // Nhân vật

// Khởi tạo game
function initializeGame() {
    // Hiển thị
    startButton.style.display = 'none';
    playAgainButton.style.display = 'none';

    // Tạo mới và thêm người chơi vào scene
    player = new Player();
    loadCharacter('./static/granny_treadmillrunning.glb', scene, player);
    updateHeartDisplay(heartDisplay, player.heart);

    // Reset trạng thái
    isGameRunning = true;
    segments.length = 0; // Xóa tất cả segments
    scene.clear(); // Xóa tất cả các object trong scene

    // Thêm ánh sáng và sương mù vào lại scene
    scene.add(ambientLight);
    scene.add(directionalLight);
    scene.fog = new THREE.Fog(0xcccccc, 1, 500);

    // Phát âm thanh nền nếu chưa được phát
    if (!backgroundAudio) {
        backgroundAudio = new Audio('./static/background.mp3'); // Đường dẫn đến tệp âm thanh
        backgroundAudio.loop = true; // Set lặp lại
        backgroundAudio.volume = 0.25; // Đặt âm lượng
        backgroundAudio.play();
    }

    // Tạo các segments
    let positionZ = 0; // Vị trí khởi tạo segment đầu tiên
    for (let i = 0; i < num_of_segments; i++) {
        // Thêm segment mới
        // 1. Tạo một segment random theo constructor tại vị trí 500
        const newSegment = new Segment(scene, 500, 0);

        // 2. Khởi tạo segment đầu tiên, posZ = 0 (Không có gì cả)
        if (i == 0) {
            newSegment.createSegment0();
        }
        // 2. Từ segment thứ 1 trở đi tính positionZ dựa trên segment trước nó
        else if (i > 0) {
            newSegment.createRandomSegment();
            let new_segment_length = newSegment.length;
            // Lấy end_track bằng posz - old_length_segment/2
            let old_length_segment = segments[segments.length - 1].length;
            let end_track = positionZ - old_length_segment/2;
            // Cập nhật posz = end_track - new_segment_length/2;
            positionZ = end_track - new_segment_length/2;
        }
        // 3. Thiết lập position Z lại cho segment mới
        newSegment.setPositionZ(positionZ);
        segments.push(newSegment);
    }
}

// Hàm reset game
function resetGame() {
    initializeGame(); // Gọi lại hàm khởi tạo
}

// Hàm kết thúc game
function endGame() {
    isGameRunning = false;
    playAgainButton.style.display = 'inline-block';

    // Dừng âm thanh nền
    if (backgroundAudio) {
        backgroundAudio.pause();
        backgroundAudio.currentTime = 0; // Đặt lại currentTime
        backgroundAudio = null; // Xóa tham chiếu âm thanh
    }
}

// Lấy tham chiếu
let startButton = document.getElementById('startButton');
let playAgainButton = document.getElementById('playAgainButton');
let countdownDiv = document.getElementById('countdown');
let heartDisplay = document.getElementById('heartDisplay');

// Gắn sự kiện cho các nút
startButton.addEventListener('click', () => {
    initializeGame();
});
playAgainButton.addEventListener('click', () => {
    resetGame();
});

// Render loop
let clock = new THREE.Clock();
let segmentSpeed = 0.31; // min = 0.2 max = 0.4 +0.01 mỗi 20s , 15 28, 31 max?
// Nếu segment Speed quá nhanh sẽ không phát hiện
let time = 0;
let lastSpeedUpdateTime = 0; // biến theo dõi thời gian cập nhật tốc độ
export let isOnCountDown = true;
function animate() {
    let deltaTime = clock.getDelta();
    requestAnimationFrame(animate);
    
    if (isGameRunning) {
        time += deltaTime;
        if (time < 2) {
            // Đếm 3, 2, 1
            // Hiển thị số đếm ngược
            isOnCountDown = true;
            countdownDiv.style.display = 'block';
            countdownDiv.textContent = Math.ceil(2 - time); // Chuyển thành 3, 2, 1
        }
        else if (time > 2) {
            countdownDiv.style.display = 'none';
            isOnCountDown = false;
            updateSegments(segments, segmentSpeed, scene);
            player.update(deltaTime, segments, segmentSpeed);
            if (player.mixer) player.mixer.update(deltaTime); // Hoạt ảnh chạy
        }

        // Tăng segmentSpeed mỗi 20 giây, nhưng không vượt quá 0.4
        if (time - lastSpeedUpdateTime >= 20) {
            if (segmentSpeed < 0.4) {
                segmentSpeed += 0.01;  // Tăng tốc độ segment
                lastSpeedUpdateTime = time;  // Cập nhật thời gian cập nhật tốc độ
            }
        }

        // Logic kết thúc game
        if (player.heart <= 0) {
            time = 0;
            endGame();
        }
        player.updateCamera(camera);
    }
    renderer.render(scene, currentCamera);
}

animate();