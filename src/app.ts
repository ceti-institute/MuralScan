import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';

class App {
    info: HTMLElement | null;
    logElement: HTMLElement | null;

    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;

    mesh: THREE.Mesh;
    image;
    context: CanvasRenderingContext2D;

    rootContainer: THREE.Group;

    selected: THREE.Mesh | null = null;

    initialize(scene, camera, renderer) {
        this.info = document.getElementById("info");
        this.logElement = document.getElementById("log");
        // console.log(this.info)
        this.info!.hidden = true;

        console.log(scene, camera);

        this.scene = scene;// || new THREE.Scene();
        this.camera = camera;// || new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.renderer = renderer;// new THREE.WebGLRenderer();
        // this.renderer.setSize(window.innerWidth, window.innerHeight);
        // document.body.appendChild(this.renderer.domElement);

        this.rootContainer = new THREE.Group();
        this.scene.add(this.rootContainer);

        this.camera.position.set(0, 1, 0)

        // const svgUrl = new URL('Rock-of-Ages.svg', import.meta.url);
        // const textureUrl = new URL("Rock-of-Ages.jpg", import.meta.url);

        const svgUrl = new URL('Vanport/Vanport.svg', import.meta.url);
        const textureUrl = new URL("Vanport/Vanport.png", import.meta.url);

        const svg = new SVGLoader().load(svgUrl.toString(), (data) => {

            const paths = data.paths;
            const container = new THREE.Group();
            container.scale.multiplyScalar(0.001);
            container.scale.y *= - 1;

            // container.position.x = -1.6 / 2;
            // container.position.y = 2.16 / 2;

            container.position.x = -1.024 / 2;
            container.position.y = 1.646 / 2;

            for (let i = 0; i < paths.length; i++) {

                const path = paths[i];
                const name = path?.userData?.node?.id;

                console.log(path?.userData?.node);

                const material = new THREE.MeshBasicMaterial({
                    color: new THREE.Color("#ffff00"),// path.color,
                    side: THREE.DoubleSide,
                    // depthWrite: false,
                    transparent: true,
                    opacity: 0
                });

                const shapes = SVGLoader.createShapes(path);

                for (let j = 0; j < shapes.length; j++) {

                    const shape = shapes[j];
                    console.log(shape);
                    const geometry = new THREE.ShapeGeometry(shape);
                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.name = name;
                    mesh.layers.enable(1);
                    mesh.position.z = 1 + j;
                    container.add(mesh);

                }

            }

            this.rootContainer.add(container);

        });

        // const image = new THREE.ImageLoader().load(svgUrl.toString(), (image) => {

        //     // Canvas

        //     console.log(image);

        //     this.image = image;
        //     const canvas = document.createElement('canvas');
        //     canvas.width = this.image.width;
        //     canvas.height = this.image.height;

        //     this.context = canvas.getContext('2d')!;
        //     this.context!.drawImage(this.image, 0, 0);

        // });

        const texture = new THREE.TextureLoader().load(textureUrl.toString(), (texture) => {

        });



        // const planeGeometry = new THREE.PlaneGeometry(1.600, 2.160);

        const planeGeometry = new THREE.PlaneGeometry(1.024, 1.646);

        const planeMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: texture });
        this.mesh = new THREE.Mesh(planeGeometry, planeMaterial);
        this.rootContainer.add(this.mesh);




        // let animate = () => {
        //     requestAnimationFrame(animate);

        // this.mesh.material.color.set(0xffffff);


        // for (let i = 0; i < intersects.length; i++) {

        //     console.log(intersects[i]);


        //     // let pixel = this.getPixel(intersects[i].uv);
        //     // if (pixel[0] > 128) {
        //     //     intersects[i].object.material.color.set(0x00ff00);
        //     // } else {
        //     //     intersects[i].object.material.color.set(0xff0000);
        //     // }
        // }

        //     this.renderer.render(this.scene, this.camera);
        // };

        // animate();
    }

    update() {
        // Raycast

        let raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        raycaster.layers.set(1);

        const intersects = raycaster.intersectObjects(this.scene.children);

        if (this.selected) (this.selected.material as THREE.Material).opacity = 0;
        this.info!.hidden = true;

        if (intersects.length > 0) {
            this.selected = intersects[intersects.length - 1].object as THREE.Mesh;
            this.selected.material!.opacity = .25;
            this.info!.hidden = false;
            this.log(intersects[intersects.length - 1].object.name);
        }

        // this.log("update");
    }

    // getPixel(uv: THREE.Vector2) {
    //     if (this.context) {
    //         return this.context.getImageData(this.image.width * uv.x, this.image.height * uv.y, 1, 1).data;
    //     }
    // }



    // 8th Wall


    trackingStatus() { }
    imageLoading() { }
    imageScanning() { }
    imageFound() {
        this.log("FOUND");
    }
    imageUpdated({ detail }) {

        this.log(JSON.stringify(detail.position));
        this.rootContainer.position.copy(detail.position)
        this.rootContainer.quaternion.copy(detail.rotation)
        this.rootContainer.scale.set(detail.scale, detail.scale, detail.scale)
    }

    imageLost() { }

    log(text: string) {
        const element = document.createElement("div");
        element.innerText = (text);
        this.logElement?.prepend(element);
        console.log(text);
    }

}

export default new App();