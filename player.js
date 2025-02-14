import * as THREE from 'three';
import { isOnCountDown, isGameRunning } from "./main.js"; // import từ main
import { updateHeartDisplay } from "./utilities.js";
import { mx_safepower } from 'three/src/nodes/TSL.js';

// Lấy phần tử âm thanh
const jumpSound = document.getElementById('jumpSound');
const trippedSound = document.getElementById('trippedSound');
const deathSound = document.getElementById('deathSound');
jumpSound.volume = 1;
trippedSound.volume = 0.4;
deathSound.volume = 0.3;

let heartDisplay = document.getElementById('heartDisplay');

export class Player {
    constructor() {
        // Tạo nhân vật
        this.geometry = new THREE.BoxGeometry(1, 1.5, 1); // Mesh sẽ bị thay đổi bởi model
        this.material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(0, 0, 0);

        this.moveSpeed = 3; // (width của segment/3)
        this.fallVelocity = 0.3;

        this.isJumping = false;
        this.isRolling = false;
        this.rollDuration = 0; // Thời gian cuộn

        this.yThreshold = 0; // Dùng để xác định y khi va chạm đất/tàu/ramp
        this.isOnRamp = false;
        this.isOnContainer = false;

        // Dùng tạo hiệu ứng trượt trái/phải
        this.current_posX = this.mesh.position.x;
        this.previous_posX = 0; // Sử dụng để biết có sự thay đổi làn

        this.heart = 5; // Tim của người chơi
        this.canRemoveHeart = true;
        this.removeHeartCD = 1000; // 1s sau mới bị trừ máu một lần
        this.canAddHeart = true;
        this.addHeartCD = 10000; // 10s sau khi bị vấp thì được tăng tim

        // Xử lý sự kiện bàn phím
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));

        // Xử lý sự kiện chuột
        window.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    }

    // Khi chuột được nhấn xuống
    handleMouseDown(event) {
        if (isOnCountDown || !isGameRunning) return;
        this.isDragging = true;
        this.startDrag = { x: event.clientX, y: event.clientY }; // Lưu vị trí chuột bắt đầu
    }

    // Khi chuột được di chuyển
    handleMouseMove(event) {
        if (this.isDragging) {
            const deltaX = event.clientX - this.startDrag.x;
            const deltaY = event.clientY - this.startDrag.y;
            const threshHold = 50; //lớn hơn 1 khoảng {} pixel thì mới nhận xử lý

            // Xử lý trượt theo các hướng
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Trượt trái/phải
                if (deltaX > threshHold && this.current_posX < 3) {
                    this.current_posX += this.moveSpeed;
                    // Cập nhật lại điểm bắt đầu và giới hạn số lần trượt
                    this.startDrag.x = event.clientX;
                    this.isDragging = false; // Giới hạn 1 lần
                } else if (deltaX < -threshHold && this.current_posX > -3) {
                    this.current_posX -= this.moveSpeed;
                    // Cập nhật lại điểm bắt đầu và giới hạn số lần trượt
                    this.startDrag.x = event.clientX;
                    this.isDragging = false;
                }
            } 
            else {
                // Trượt lên/xuống
                if (deltaY < -threshHold) {
                    this.jump();
                    // Cập nhật lại điểm bắt đầu và giới hạn số lần trượt
                    this.startDrag.y = event.clientY;
                    this.isDragging = false;
                } else if (deltaY > threshHold) {
                    this.roll();
                    // Cập nhật lại điểm bắt đầu và giới hạn số lần trượt
                    this.startDrag.y = event.clientY;
                    this.isDragging = false;
                }
            }
        }
    }
    // Khi chuột không còn được nhấn
    handleMouseUp() {
        this.isDragging = false;
    }

    // Hàm xử lý phím bấm
    handleKeyDown(event) {
        if (isOnCountDown || !isGameRunning) return;

        this.previous_posX = this.current_posX;
        if (event.key == 'ArrowLeft' && this.current_posX > -3) {
            this.current_posX -= this.moveSpeed;
        }
        else if (event.key == 'ArrowRight' && this.current_posX < 3) {        
            this.current_posX += this.moveSpeed;
        }
        else if (event.key == ' ') {
            this.jump();
        }
        else if (event.key == 'ArrowDown') {
            this.roll();
        }
    }
    // Hàm nhảy
    jump() {
        if (!this.isJumping) {
            jumpSound.play();
            this.isJumping = true;
            this.isRolling = false;
            this.jumpVelocity = 0.3;
            this.mesh.scale.y = 1.5; // Reset về khi nhảy
        }
    }

    // Hàm cuộn tròn
    roll() {
        if (!this.isRolling) {
            this.isRolling = true;
            this.rollVelocity = 0.5;
            this.rollDuration = 0.5; // Cuộn trong 0.5s
            this.mesh.scale.y = 0.75; // Scale chiều cao xuống khi cuộn
        }
    }

    // Cập nhật camera theo vị trí nhân vật
    updateCamera(camera) {
        if (this.mesh.position.y < 4.3) {
            this.targetPosition = new THREE.Vector3(
                this.mesh.position.x,
                7,
                this.mesh.position.z + 5
            );
        }
        else {
            this.targetPosition = new THREE.Vector3(
                this.mesh.position.x,
                14,
                this.mesh.position.z + 5
            );
        }
        
        // Hướng camera nhìn thẳng vào nhân vật
        camera.position.lerp(this.targetPosition, 0.2);
    }

    // Hàm cập nhật trạng thái gọi trong loop
    update(deltaTime, segments, segmentSpeed) {
        // Mỗi lần cập nhật, lấy bounding box của người chơi
        this.playerBox = new THREE.Box3().setFromObject(this.mesh);

        // Giả sử luôn ở mặt đất
        this.yThreshold = 0;
        this.isOnRamp = false;
        this.isOnContainer = false;

        // Theo dõi đường đi của người chơi
        const laneWidth = 3;
        const previousLane = Math.floor(this.previous_posX / laneWidth); // Làn trước đó
        const currentLane = Math.floor(this.current_posX / laneWidth); // Làn hiện tại
        
        // Theo dõi có được đổi đường không
        let allowedToChangeLane = true;
        let gotTripped = false; // theo dõi có bị vấp không
        let gotInstaDeath = false; // theo dõi bị tông trực tiếp

        // Hoạt ảnh trượt trái/phải
        this.mesh.position.x += (this.current_posX - this.mesh.position.x) * 0.2;

        // Duyệt qua từng segment và trong group
        segments.forEach((segment) => {
            segment.group.children.forEach((child) => {
                if (!child.name || !['ramp', 'container', 'protectionRamp', 'obstacle', 'supportObstacle'].includes(child.name)) {
                    return;
                }
                else {
                    const objectWorldPosition = new THREE.Vector3();
                    child.getWorldPosition(objectWorldPosition);

                    // Giới hạn các vật thể trong phát hiện va chạm - container Length phải nhỏ hơn 50 - 45 là max
                    if (objectWorldPosition.z >= -25 && objectWorldPosition.z <= 25) {
                        // Lấy bounding box của đối tượng
                        const objectBox = new THREE.Box3().setFromObject(child);
        
                        // Làn đường của đối tượng
                        const objectLane = Math.floor(child.position.x / laneWidth);
                        // Kiểm tra nếu đối tượng là ramp
                        if (child.name == 'ramp' && this.playerBox.intersectsBox(objectBox)) {
                            //console.log("ramp hit!");
                            this.isOnRamp = true;

                            // Lấy worldPosition của ramp
                            const ramp_worldPosition = new THREE.Vector3();
                            child.getWorldPosition(ramp_worldPosition);

                            // Tính toán vị trí Y của người chơi trên ramp
                            const rampAngle = Math.PI / 6; // Luôn = 30 độ
                            const deltaZ = ramp_worldPosition.z - this.mesh.position.z;
                            const rampYAtPlayerPosition = ramp_worldPosition.y + deltaZ * Math.tan(rampAngle);

                            // Đặt yThreshold = đúng với vị trí ramp
                            this.yThreshold = rampYAtPlayerPosition;
                        }

                        // Kiểm tra nếu đối tượng là container
                        if ((child.name == 'container') && this.playerBox.intersectsBox(objectBox)) {
                            if (this.isOnRamp) return;

                            // Đặt yThreshold = đúng với vị trí của container
                            // Tính bounding box để lấy chiều cao
                            child.geometry.computeBoundingBox();
                            const boundingBox = child.geometry.boundingBox;
                            // Lấy chiều cao theo trục y
                            let bb_height = boundingBox.max.y - boundingBox.min.y;
                            // Chia đôi và cộng thêm nơi đặt của container
                            let height = bb_height/2 + child.position.y; 
                            this.yThreshold = height; // height = 4.9

                            let alpha;
                            // Trường hợp rơi tự do
                            alpha = this.fallVelocity;
                            // Trường hợp cuộn
                            if (this.isRolling) alpha = this.rollVelocity;
                            // Trường hợp nhảy
                            if (this.isJumping) {
                                if (this.jumpVelocity > 0) alpha = this.jumpVelocity;
                                else alpha = -this.jumpVelocity; 
                            }
                            
                            console.log(this.isJumping, this.isRolling);
                            // TH1: Người chơi trên container
                            if (this.mesh.position.y > this.yThreshold - alpha) {
                                this.isOnContainer = true;
                                allowedToChangeLane = true;
                            }
                            // TH2: Đang không đi trên container
                            else {
                                // Tính vị trí điểm chết
                                child.geometry.computeBoundingBox();
                                const boundingBox = child.geometry.boundingBox;

                                // Lấy chiều dài theo trục z
                                const lengthZ = boundingBox.max.z - boundingBox.min.z;
                                const container_worldPosition = new THREE.Vector3();
                                child.getWorldPosition(container_worldPosition);

                                // Điểm chết
                                const deathPos = container_worldPosition.z + lengthZ / 2;
                                // Nếu người chơi né vào container
                                if (previousLane != objectLane) {
                                    gotTripped = true; // Bị trừ máu
                                    allowedToChangeLane = false; // Không được đổi làn
                                }
                                // Nếu người chơi né thành công (bị vướng nhẹ vào)
                                else if (Math.abs(deathPos) < 0.5) {
                                    gotTripped = true; // Bị trừ máu
                                    allowedToChangeLane = true; // Được đổi làn
                                }
                                // Nếu không thèm né
                                else if (previousLane == objectLane) {
                                    //console.log("Direct collision");
                                    gotInstaDeath = true;
                                    allowedToChangeLane = false;
                                }
                            }
                        }

                        // Kiểm tra nếu đối tượng là vật cản
                        if ((child.name == 'obstacle') && this.playerBox.intersectsBox(objectBox)) {
                            const isObstacleInCurrentLane = (currentLane == objectLane);
                            const isObstacleInPreviousLane = (previousLane == objectLane);

                            child.geometry.computeBoundingBox();
                            const boundingBox = child.geometry.boundingBox;

                            // Lấy chiều cao theo trục y là ra độ cao của geometry
                            let height = boundingBox.max.y - boundingBox.min.y;
                            // Chia đôi và cộng thêm nơi đặt
                            height = height/2 + child.position.y;

                            // Nếu né ra khỏi chướng ngại vật
                            if (!isObstacleInCurrentLane) {
                                gotTripped = true;
                                //allowedToChangeLane = true;
                            } 
                            // Nếu đang ở làn có vật cản
                            else if (isObstacleInCurrentLane) {
                                // Trường hợp từ làn khác vào làn có vật cản
                                if (!isObstacleInPreviousLane) {
                                    gotTripped = true;
                                    //allowedToChangeLane = true;
                                }
                                // Trường hợp cả hai làn đều có vật cản
                                else if (isObstacleInPreviousLane) {
                                    // Kiểm tra nếu nhảy vượt qua
                                    if (this.isJumping && this.mesh.position.y > height - 0.5) {
                                        gotTripped = true;
                                        //allowedToChangeLane = true;
                                    }
                                    // Không nhảy qua được
                                    else {
                                        gotInstaDeath = true;
                                        //allowedToChangeLane = false;
                                    }
                                }
                            }                    
                        }

                        // Kiểm tra nếu đối tượng là protectionRamp
                        if (child.name == 'protectionRamp' && this.playerBox.intersectsBox(objectBox)) {
                            //console.log("protection ramp hit!");

                            // Tương tự với container nhưng không có yThreshold
                            // Đặt yThreshold = đúng với vị trí của container
                            // Tính bounding box để lấy chiều cao
                            child.geometry.computeBoundingBox();
                            const boundingBox = child.geometry.boundingBox;
                            // Lấy chiều cao theo trục y
                            let bb_height = boundingBox.max.y - boundingBox.min.y;
                            // Chia đôi và cộng thêm nơi đặt của container
                            let height = bb_height/2 + child.position.y; 

                            let alpha;
                            alpha = this.fallVelocity;
                            if (this.isRolling) alpha = this.rollVelocity;
                            if (this.isJumping) {
                                if (this.jumpVelocity > 0) alpha = this.jumpVelocity;
                                else alpha = -this.jumpVelocity; 
                            }

                            if (this.mesh.position.y > height - alpha) {
                                allowedToChangeLane = true;
                            }
                            else {
                                gotTripped = true;
                                allowedToChangeLane = false;
                            }
                        }

                        // Kiểm tra nếu đối tượng là supportObstacle
                        if (child.name == 'supportObstacle' && this.playerBox.intersectsBox(objectBox)) {
                            //console.log("support Obstacle hit!");
                            gotTripped = true; // Nếu chạm sẽ bị trừ máu
                        }
                    }
                    
                }
            });
        });

        // Nếu thay đổi làn thành công sẽ cập nhật vị trí, nếu không thì sẽ bị hạn chế thay đổi
        if (Math.abs(this.mesh.position.x - this.current_posX) < 0.5) {
            this.previous_posX = this.current_posX;
        }
        // Hạn chế thay đổi làn
        if (!allowedToChangeLane) {
            this.current_posX = this.previous_posX;
        }

        // Bị chết ngay lập tức
        if (gotInstaDeath) {
            deathSound.play();
            this.heart -= 100;
            updateHeartDisplay(heartDisplay, this.heart);
        }

        // Bị vấp, trừ tim
        if (gotTripped) {
            if (this.canRemoveHeart) {
                this.canRemoveHeart = false;
                this.heart -= 1;
                updateHeartDisplay(heartDisplay, this.heart);
                trippedSound.play();
    
                // Chờ 0.5s thì set canRemoveHeart = true (0.5s khiên)
                setTimeout(() => {
                    if (this.canAddHeart) {
                        this.canAddHeart = false;
                        setTimeout(() => {
                            // Cộng lại tim sau 10 giây
                            if (this.heart > 0) {
                                this.heart += 1;
                                updateHeartDisplay(heartDisplay, this.heart);
                            }
    
                            // Đặt lại trạng thái cộng tim sau khi thực hiện
                            this.canAddHeart = true;
                        }, this.addHeartCD);
                    }
                    this.canRemoveHeart = true;
                }, this.removeHeartCD);
            }
        }

        // Nếu người chơi đang trên ramp
        if (this.isOnRamp) {
            // Tính toán và cập nhật vị trí Y của người chơi khi ở trên ramp chỉ khi người chơi không nhảy trên ramp
            if (!this.isJumping) {
                this.mesh.position.y = Math.max(this.mesh.position.y, this.yThreshold);
                const deltaY = segmentSpeed * Math.sin(Math.PI / 6);
                this.mesh.position.y += deltaY;
            }
        }

        // Nhảy
        if (this.isJumping) {
            this.mesh.position.y += this.jumpVelocity;
            this.jumpVelocity -= 0.014; // Hiệu ứng rơi

            if (this.isOnContainer || this.isOnRamp) {
                if (this.mesh.position.y < this.yThreshold) {
                    this.mesh.position.y = this.yThreshold;
                    this.isJumping = false;
                }
            }
            else {
                if (this.mesh.position.y < 0) {
                    this.mesh.position.y = 0;
                    this.isJumping = false;
                }
            }
        }

        // Cuộn tròn
        if (this.isRolling) {
            this.rollDuration -= deltaTime;
            this.mesh.position.y -= this.rollVelocity;
            this.isJumping = false; // Không nhảy khi đang cuộn
            if (this.isOnContainer || this.isOnRamp) {
                if (this.mesh.position.y < this.yThreshold) {
                    this.mesh.position.y = this.yThreshold;
                }
            }
            else {
                if (this.mesh.position.y < 0) {
                    this.mesh.position.y = 0;
                }
            }

            if (this.rollDuration <= 0) {
                this.isRolling = false;
                this.mesh.scale.y = 1.5; // Khôi phục chiều cao
            }
        }

        // Rơi tự do
        if (this.mesh.position.y > this.yThreshold && !this.isJumping && !this.isRolling && !this.isOnContainer && !this.isOnRamp
        ) {
            if (this.mesh.position.y < this.yThreshold) {
                this.mesh.position.y = this.yThreshold;
            }
            else {
                this.mesh.position.y -= this.fallVelocity;
            }
        }
    }
}