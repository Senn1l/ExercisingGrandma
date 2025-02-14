import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; //model 3d

// Hàm thêm nhân vật vào cảnh
export function loadCharacter(filePath, scene, player) {
    const loader = new GLTFLoader();
    loader.load(filePath, (gltf) => {
        gltf.scene.rotation.y = Math.PI; // Quay 180 độ trên trục Y
        const character = gltf.scene;
        character.scale.set(1, 1.5, 1); // Tùy chỉnh kích thước nhân vật

        const mixer = new THREE.AnimationMixer(character);
        // Lấy hoạt ảnh từ mô hình
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();

        scene.add(character); // Thêm nhân vật vào scene
        player.mesh = character; // Gán nhân vật vào player
        player.mixer = mixer; // Lưu mixer để sử dụng lại
    });
}

// Hàm để cập nhật số tim
export function updateHeartDisplay(heartDisplay, heart) {
    heartDisplay.innerText = "Heart: " + Math.max(heart, 0);
}