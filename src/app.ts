import { url } from 'inspector';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class MuralScan {

    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;

    mesh: THREE.Mesh;
    image;
    context: CanvasRenderingContext2D;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        const svgUrl = new URL('Rock-of-Ages.svg', import.meta.url);
        const textureUrl = new URL("Rock-of-Ages.jpg", import.meta.url);

        const image = new THREE.ImageLoader().load(svgUrl.toString(), (image) => {
            console.log(image);
            this.image = image;
            const canvas = document.createElement('canvas');
            canvas.width = this.image.width;
            canvas.height = this.image.height;

            this.context = canvas.getContext('2d')!;
            this.context!.drawImage(this.image, 0, 0);
        });

        const texture = new THREE.TextureLoader().load(textureUrl.toString(), (texture) => {

        });



        const planeGeometry = new THREE.PlaneGeometry(1.600, 2.160);
        const planeMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: texture });
        this.mesh = new THREE.Mesh(planeGeometry, planeMaterial);
        this.scene.add(this.mesh);



        this.camera.position.z = 5;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        // this.controls.minPolarAngle = this.controls.maxPolarAngle = Math.PI / 2;
        // this.controls.enableDamping = true;
        // this.controls.dampingFactor = 0.05;
        // this.controls.enablePan = false;

        let animate = () => {
            requestAnimationFrame(animate);

            this.mesh.material.color.set(0xffffff);

            // Raycast

            let raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

            const intersects = raycaster.intersectObjects(this.scene.children);
            for (let i = 0; i < intersects.length; i++) {

                let pixel = this.getPixel(intersects[i].uv);
                if (pixel[0] > 128) {
                    intersects[i].object.material.color.set(0x00ff00);
                } else {
                    intersects[i].object.material.color.set(0xff0000);
                }

            }


            this.renderer.render(this.scene, this.camera);
        };

        animate();
    }

    getPixel(uv: THREE.Vector2) {
        if (this.context) {
            return this.context.getImageData(this.image.width * uv.x, this.image.height * uv.y, 1, 1).data;
        }
    }

}

export default new MuralScan();