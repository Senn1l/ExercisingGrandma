import * as THREE from 'three';

export class Segment {
    constructor(scene, positionZ, length) {
        this.group = new THREE.Group();
        this.scene = scene;
        this.length = length;
        this.group.position.z = positionZ;
        scene.add(this.group);
    }

    // Tạo đường ray
    createTrack() {
        // BoxGeometry(width, height, depth)
        const geometry = new THREE.BoxGeometry(9, 0.1, this.length);
        const material = new THREE.MeshStandardMaterial({ color: 0x808080 });
        const track = new THREE.Mesh(geometry, material);
        track.position.y = 0;

        // Tạo một end_track ở cuối mỗi segment để trực quan hóa
        const d_geometry = new THREE.BoxGeometry(9, 0.1, 0.1);
        const d_material = new THREE.MeshStandardMaterial({ color: 0x000000 }); // màu đen
        const end_track = new THREE.Mesh(d_geometry, d_material);
        end_track.position.y = 0.1;
        end_track.position.z = -this.length/2;

        this.group.add(track);
        this.group.add(end_track);
    }

    // Điều chỉnh position z của group
    setPositionZ(positionZ) {
        this.group.position.z = positionZ;
    }

    // Di chuyển segment về phía camera (deltaZ phải dương)
    move(deltaZ) {
        this.group.position.z += deltaZ;
    }

    // Segment khởi tạo
    createSegment0() {
        // Tự thiết lập chiều dài
        const length = 50;
        // Gán length cho segment
        this.length = length;
        // Tạo track cho segment
        this.createTrack();
    }

    // TODO: Thêm vào từng Segment với length và obstacles/trang trí tự tạo
    // Thêm Segment1
    createSegment1() {
        const length = 50;
        this.length = length;
        this.createTrack();

        // Các vị trí x đặt: -3, 0, 3 tương ứng 3 đường
        //createRampWithContainer(xRamp, zRamp, containerLength)
        let result = createRampWithContainer(-3, 20, 5);
        this.group.add(result.ramp);
        this.group.add(result.pRampL);
        this.group.add(result.pRampR);
        this.group.add(result.container);

        // result = createRampWithContainer(0, 20, 20);
        // this.group.add(result.ramp);
        // this.group.add(result.pRampL);
        // this.group.add(result.pRampR);
        // this.group.add(result.container);

        result = createRampWithContainer(3, 20, 10);
        this.group.add(result.ramp);
        this.group.add(result.pRampL);
        this.group.add(result.pRampR);
        this.group.add(result.container);

        // Container - x, z, length
        let container = createContainer(0, -10, 15);
        this.group.add(container);

        // Vật cản nhảy - x, z
        let jumpOnlyObstacle = createJumpOnlyObstacles(0, 10);
        this.group.add(jumpOnlyObstacle);

        // Vật cản nhảy/cuộn - x, z
        let jumpRollObstacle = createRollJumpObstacles(3, 25);
        this.group.add(jumpRollObstacle.mainComponent);
        this.group.add(jumpRollObstacle.supportComponent_L);
        this.group.add(jumpRollObstacle.supportComponent_R);

        // let rollOnlyObstacles = createRollOnlyObstacles(-3, 25);
        // this.group.add(rollOnlyObstacles.mainComponent);
        // this.group.add(rollOnlyObstacles.supportComponent_L);
        // this.group.add(rollOnlyObstacles.supportComponent_R);
    }

    // Thêm Segment2
    createSegment2() {
        const length = 100;
        this.length = length;
        this.createTrack();

        //createRampWithContainer(xRamp, zRamp, containerLength)
        let result = createRampWithContainer(-3, 40, 35);
        this.group.add(result.ramp);
        this.group.add(result.pRampL);
        this.group.add(result.pRampR);
        this.group.add(result.container);

        // Vật cản nhảy/cuộn - x, z
        let jumpRollObstacle = createRollJumpObstacles(-3, 45);
        this.group.add(jumpRollObstacle.mainComponent);
        this.group.add(jumpRollObstacle.supportComponent_L);
        this.group.add(jumpRollObstacle.supportComponent_R);

        jumpRollObstacle = createRollJumpObstacles(0, 45);
        this.group.add(jumpRollObstacle.mainComponent);
        this.group.add(jumpRollObstacle.supportComponent_L);
        this.group.add(jumpRollObstacle.supportComponent_R);

        jumpRollObstacle = createRollJumpObstacles(0, -2.5);
        this.group.add(jumpRollObstacle.mainComponent);
        this.group.add(jumpRollObstacle.supportComponent_L);
        this.group.add(jumpRollObstacle.supportComponent_R);

        jumpRollObstacle = createRollJumpObstacles(3, -40);
        this.group.add(jumpRollObstacle.mainComponent);
        this.group.add(jumpRollObstacle.supportComponent_L);
        this.group.add(jumpRollObstacle.supportComponent_R);

        // Container - x, z, length
        let container = createContainer(3, 30, 30);
        this.group.add(container);
        container = createContainer(3, -10, 30);
        this.group.add(container);
        container = createContainer(0, -25, 30);
        this.group.add(container);

        // Vật cản nhảy - x, z
        let jumpOnlyObstacle = createJumpOnlyObstacles(-3, -2.5);
        this.group.add(jumpOnlyObstacle);
        jumpOnlyObstacle = createJumpOnlyObstacles(-3, -40);
        this.group.add(jumpOnlyObstacle);
    }

    // Thêm Segment3
    createSegment3() {
        const length = 100;
        this.length = length;
        this.createTrack();

        //createRampWithContainer(xRamp, zRamp, containerLength)
        let result = createRampWithContainer(3, -2.5, 35);
        this.group.add(result.ramp);
        this.group.add(result.pRampL);
        this.group.add(result.pRampR);
        this.group.add(result.container);

        let container = createContainer(-3, 35, 25);
        this.group.add(container);
        container = createContainer(-3, -25, 30);
        this.group.add(container);
        container = createContainer(3, 30, 25);
        this.group.add(container);

        let jumpOnlyObstacle = createJumpOnlyObstacles(-3, 10);
        this.group.add(jumpOnlyObstacle);
        jumpOnlyObstacle = createJumpOnlyObstacles(0, -40);
        this.group.add(jumpOnlyObstacle);

        let rollOnlyObstacle = createRollOnlyObstacles(0, -10)
        this.group.add(rollOnlyObstacle.mainComponent);
        this.group.add(rollOnlyObstacle.supportComponent_L);
        this.group.add(rollOnlyObstacle.supportComponent_R);
    }

    // Thêm Segment4
    createSegment4() {
        const length = 50;
        this.length = length;
        this.createTrack();

        let jumpOnlyObstacle = createJumpOnlyObstacles(-3, 20);
        this.group.add(jumpOnlyObstacle);
        jumpOnlyObstacle = createJumpOnlyObstacles(0, 20);
        this.group.add(jumpOnlyObstacle);
        let jumpRollObstacle = createRollJumpObstacles(3, 20);
        this.group.add(jumpRollObstacle.mainComponent);
        this.group.add(jumpRollObstacle.supportComponent_L);
        this.group.add(jumpRollObstacle.supportComponent_R);

        let rollOnlyObstacle = createRollOnlyObstacles(-3, 10)
        this.group.add(rollOnlyObstacle.mainComponent);
        this.group.add(rollOnlyObstacle.supportComponent_L);
        this.group.add(rollOnlyObstacle.supportComponent_R);
        jumpRollObstacle = createRollJumpObstacles(0, 10);
        this.group.add(jumpRollObstacle.mainComponent);
        this.group.add(jumpRollObstacle.supportComponent_L);
        this.group.add(jumpRollObstacle.supportComponent_R);
        let container = createContainer(3, 10, 20);
        this.group.add(container);

        jumpRollObstacle = createRollJumpObstacles(-3, -5);
        this.group.add(jumpRollObstacle.mainComponent);
        this.group.add(jumpRollObstacle.supportComponent_L);
        this.group.add(jumpRollObstacle.supportComponent_R);
        rollOnlyObstacle = createRollOnlyObstacles(0, -10)
        this.group.add(rollOnlyObstacle.mainComponent);
        this.group.add(rollOnlyObstacle.supportComponent_L);
        this.group.add(rollOnlyObstacle.supportComponent_R);
        jumpRollObstacle = createRollJumpObstacles(3, -10);
        this.group.add(jumpRollObstacle.mainComponent);
        this.group.add(jumpRollObstacle.supportComponent_L);
        this.group.add(jumpRollObstacle.supportComponent_R);
    }

    // Thêm Segment5
    // createSegment5() {
    //     const length = 100;
    //     this.length = length;
    //     this.createTrack();
    // }

    // Tạo ngẫu nhiên Segment (sẽ cập nhật sau)
    createRandomSegment() {
        // Xác suất và hàm tạo segment tương ứng, lưu ý: tổng cộng lại phải = 1
        const segments = [
            { probability: 0.2, create: this.createSegment1 },
            { probability: 0.3, create: this.createSegment2 },
            { probability: 0.2, create: this.createSegment3 },
            { probability: 0.3, create: this.createSegment4 },
        ];

        // Sử dụng "xác suất tích lũy"
        const randomValue = Math.random(); // Trả về giá trị [0..1]
        let cumulativeProbability = 0;

        // Phạm vi cho segment1 (0.2): 0 -> 0.2
        // segment2 (0.3): 0.2 -> 0.5
        // segment3 (0.2): 0.5 -> 0.7...
    
        for (let i = 0; i < segments.length; i++) {
            cumulativeProbability += segments[i].probability;
    
            // Khi random value nằm trong phạm vi đó thì sẽ lấy
            if (randomValue < cumulativeProbability) {
                segments[i].create.call(this); // Gọi segment
                break;
            }
        }
    }
}

// Hàm cập nhật và di chuyển các segment
export function updateSegments(segments, segmentSpeed, scene) {
    segments.forEach((segment) => {
        segment.move(segmentSpeed); // Di chuyển segment
    });

    // Nếu đạt đến end_track của segment thứ 2
    if ((segments[1].group.position.z - segments[1].length / 2) >= 0) {
        // Thêm segment mới
        // 1. Tạo một segment random theo constructor
        const newSegment = new Segment(scene, 500, 0);
        newSegment.createRandomSegment();
        let new_segment_length = newSegment.length;

        // 2. Tính toán vị trí z mới cho segment mới
        let lastSegment = segments[segments.length - 1];
        let endOfLastSegment = lastSegment.group.position.z - lastSegment.length / 2;
        let newPositionZ = endOfLastSegment - new_segment_length / 2;

        // 3. Thiết lập position Z lại cho segment mới
        newSegment.setPositionZ(newPositionZ);
        segments.push(newSegment);

        // 4. Xóa segment đầu tiên khỏi scene
        segments[0].group.clear();
        scene.remove(segments[0].group);
        segments.shift(); // Loại bỏ segment đầu tiên khỏi mảng
    }
}

// Geometry và Material của ramp không thay đổi
const rampWidth = 2.3;
const rampLength = 10;
const rampGeometry = new THREE.BoxGeometry(rampWidth, 0.1, rampLength); // Chiều rộng, chiều cao, chiều dài - Ramp có chiều dài luôn = 10
const rampMaterial = new THREE.MeshStandardMaterial({ color: 0x704214 });

// Chỉ Material của container không thay đổi
const containerMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

// Geometry của "protection" dành cho ramp
const protectionRampWidth = 0.1;
const protectionRampLength = Math.cos(Math.PI / 6) * 10; // Hình chiếu của ramp lên Oxz
const protectionGeometry = new THREE.BoxGeometry(protectionRampWidth, 5, protectionRampLength);

// Tạo Ramp với Geometry cố định tại vị trí x và z cho trước
function createRamp(xRamp, zRamp) {
    // xRamp: vị trí tương ứng 3 làn đường (-3, 0, 3)
    // zRamp: vị trí z đặt trên Segment
    if (xRamp != -3 && xRamp != 0 && xRamp != 3) {
        // console.log("Can't create")
        return null;
    }
    const ramp = new THREE.Mesh(rampGeometry, rampMaterial);
    ramp.position.set(xRamp, 2.4, zRamp);
    ramp.rotation.x = Math.PI / 6; // Luôn nghiêng 30 độ
    ramp.name = 'ramp'; // Gán tên

    // Tạo 2 vách ngăn 2 bên ramp để hạn chế người chơi đổi đường
    const endRampX_Right = xRamp + rampWidth/2;
    const endRampX_Left = xRamp - rampWidth/2;
    const posX_Right_ProtectionRamp = endRampX_Right + protectionRampWidth/2;
    const posX_Left_ProtectionRamp = endRampX_Left - protectionRampWidth/2;
    const protectionRampR = new THREE.Mesh(protectionGeometry, containerMaterial);
    const protectionRampL = new THREE.Mesh(protectionGeometry, containerMaterial);

    protectionRampR.position.set(posX_Right_ProtectionRamp, 2.4, zRamp);
    protectionRampL.position.set(posX_Left_ProtectionRamp, 2.4, zRamp);
    protectionRampR.name = 'protectionRamp';
    protectionRampL.name = 'protectionRamp';

    return {ramp, protectionRampL, protectionRampR};
}

// Tạo Container tại vị trí x, z và chiều dài cho trước
function createContainer(xContainer, zContainer, containerLength) {
    // xContainer: vị trí x tương ứng 3 làn đường (-3, 0, 3)
    // zContainer: vị trí z đặt trên Segment
    // containerLength là chiều dài của container
    if (xContainer != -3 && xContainer != 0 && xContainer != 3) {
        return null;
    }
    let containerGeometry = new THREE.BoxGeometry(2.5, 5, containerLength); // Chiều rộng, chiều cao, chiều dài
    const container = new THREE.Mesh(containerGeometry, containerMaterial);
    container.position.set(xContainer, 2.4, zContainer); // Vị trí
    container.name = 'container'; // Gán tên

    return container;
}

// Tạo Ramp kết nối với Container
function createRampWithContainer(xRamp, zRamp, containerLength) {
    // xRamp: vị trí tương ứng 3 làn đường (-3, 0, 3)
    // zRamp: vị trí z đặt trên Segment
    // containerLength là chiều dài của container

    // Tạo ramp
    let result = createRamp(xRamp, zRamp);
    if (result == null) {
        console.log("Can't create ramp in RampWithContainer");
        return null;
    }
    const ramp = result.ramp;
    const pRampL = result.protectionRampL;
    const pRampR = result.protectionRampR;

    // Tạo container
    // Tính toán - quay trở lại với end_track
    // 1. Tính hình chiếu của ramp lên mặt phẳng Oxz là L   
    // 2. Tính L (là cạnh kề): cos30 = kề/huyền = kề/10 (cạnh huyền là chiều dài của ramp) -> kề = cos(30) * 10
    const rampL_Oxz = Math.cos(Math.PI / 6) * 10;
    const endRampZ = zRamp - rampL_Oxz / 2; // công thức tìm được
    // 3. Sử dụng endRampz để cập nhật cho vị trí z của container
    const zContainer = endRampZ - containerLength / 2;
    const container = createContainer(xRamp, zContainer, containerLength);
    if (container == null) {
        console.log("Can't create container in RampWithContainer");
        return null;
    }

    // Trả về một đối tượng
    return {ramp, pRampL, pRampR, container};
}

// Đặt tên (.name = obstacles)
const obstacleWidth = 2.5;
const obstacleLength = 0.2;
const obstacle_material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
function createJumpOnlyObstacles(xObstacle, zObstacle) {
    // xObstacle: vị trí tương ứng 3 làn đường (-3, 0, 3)
    // zObstacle: vị trí z đặt trên Segment
    // Chỉ gồm 1 mesh duy nhất tại vị trí
    const obstacle_geometry = new THREE.BoxGeometry(obstacleWidth, 2, obstacleLength);
    const jumpOnlyObstacle = new THREE.Mesh(obstacle_geometry, obstacle_material);

    jumpOnlyObstacle.position.set(xObstacle, 1, zObstacle); // vị trí y = chia đôi height
    jumpOnlyObstacle.name = 'obstacle'; // Gán tên

    return jumpOnlyObstacle;
}

// Vật cản có thể nhảy và cuộn qua được
function createRollJumpObstacles(xObstacle, zObstacle) {
    // xObstacle: vị trí tương ứng 3 làn đường (-3, 0, 3)
    // zObstacle: vị trí z đặt trên Segment
    // Gồm 3 mesh - 2 mesh support, 1 mesh chính
    // mesh chính
    const main_geometry = new THREE.BoxGeometry(obstacleWidth, 0.4, obstacleLength);
    const mainComponent = new THREE.Mesh(main_geometry, obstacle_material);

    mainComponent.position.set(xObstacle, 1.8, zObstacle);
    mainComponent.name = 'obstacle'; // Gán tên

    // 2 mesh support
    const support_geometry = new THREE.CylinderGeometry(0.1, 0.1, 2);
    const supportComponent_L = new THREE.Mesh(support_geometry, obstacle_material);
    const supportComponent_R = new THREE.Mesh(support_geometry, obstacle_material);

    // Tính vị trí cho 2 mesh support 2 bên
    const endObstacleX_Right = xObstacle + obstacleWidth/2;
    const endObstacleX_Left = xObstacle - obstacleWidth/2;
    const posX_Right_ProtectionRamp = endObstacleX_Right;
    const posX_Left_ProtectionRamp = endObstacleX_Left;

    supportComponent_L.position.set(posX_Left_ProtectionRamp, 1, zObstacle);
    supportComponent_R.position.set(posX_Right_ProtectionRamp, 1, zObstacle);
    supportComponent_L.name = 'supportObstacle'; // Gán tên
    supportComponent_R.name = 'supportObstacle'; // Gán tên

    return {mainComponent, supportComponent_L, supportComponent_R};
}

// Chỉ thay đổi height cao hơn
function createRollOnlyObstacles(xObstacle, zObstacle) {
    // xObstacle: vị trí tương ứng 3 làn đường (-3, 0, 3)
    // zObstacle: vị trí z đặt trên Segment
    // Gồm 3 mesh - 2 mesh support, 1 mesh chính
    // mesh chính
    const main_geometry = new THREE.BoxGeometry(obstacleWidth, 3, obstacleLength);
    const mainComponent = new THREE.Mesh(main_geometry, obstacle_material);

    mainComponent.position.set(xObstacle, 3.5, zObstacle);
    mainComponent.name = 'obstacle'; // Gán tên

    // 2 mesh support
    const support_geometry = new THREE.CylinderGeometry(0.1, 0.1, 5);
    const supportComponent_L = new THREE.Mesh(support_geometry, obstacle_material);
    const supportComponent_R = new THREE.Mesh(support_geometry, obstacle_material);

    // Tính vị trí cho 2 mesh support 2 bên
    const endObstacleX_Right = xObstacle + obstacleWidth/2;
    const endObstacleX_Left = xObstacle - obstacleWidth/2;
    const posX_Right_ProtectionRamp = endObstacleX_Right;
    const posX_Left_ProtectionRamp = endObstacleX_Left;

    supportComponent_L.position.set(posX_Left_ProtectionRamp, 2.5, zObstacle);
    supportComponent_R.position.set(posX_Right_ProtectionRamp, 2.5, zObstacle);
    supportComponent_L.name = 'supportObstacle'; // Gán tên
    supportComponent_R.name = 'supportObstacle'; // Gán tên

    return {mainComponent, supportComponent_L, supportComponent_R};
}