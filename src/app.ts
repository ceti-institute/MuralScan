import * as THREE from 'three';
import { CurvePath } from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';

interface FigureData {
    tag: string,
    caption: string,
    detail: string
}

interface Offset {
    position: THREE.Vector3,
    rotation: THREE.Euler,
    scale: THREE.Vector
}

interface WayspotData {
    wayspotName: string,
    offset: Offset,
    figures: FigureData[]
}

// Scott's house
// const offset: THREE.Vector3 = new THREE.Vector3(0, 0, -0.786379);

// CETI Lab
// const offsetPosition: THREE.Vector3 = new THREE.Vector3(-3.4342, 0.263576, -5.31372);
// const offsetRotation: THREE.Euler = new THREE.Euler(0, 0.9998188433, 0);
// const offsetScale: THREE.Vector3 = new THREE.Vector3(1, 1, 1);

// PSU Stairs
// e6a0180fee204be3aed2724a120ed692.107
const offsetPosition: THREE.Vector3 = new THREE.Vector3(-2.17321, 0, -1.09416);
const offsetRotation: THREE.Euler = new THREE.Euler(0, 2.412812971, 0);
const offsetScale: THREE.Vector3 = new THREE.Vector3(1, 1, 1);

const data: FigureData[] = [
    {
        "tag": "FigureA",
        "caption": "This is Figure A.",
        "detail": "Detail."
    },
    {
        "tag": "FigureB",
        "caption": "This is Figure B.",
        "detail": "Detail."

    },
    {
        "tag": "JohnDanielsA",
        "caption": "This is JohnDanielsA.",
        "detail": "Detail."
    },
    {
        "tag": "JohnDanielsB",
        "caption": "This is JohnDanielsB.",
        "detail": "Detail."
    },
    {
        "tag": "Scarf",
        "caption": "This is a scarf.",
        "detail": "Detail."
    },
    {
        "tag": "House",
        "caption": "This is a house.",
        "detail": "Detail."
    },
    {
        "tag": "TotemPole",
        "caption": "This is a totem pole.",
        "detail": "Detail."
    }
];

class App {
    caption: HTMLElement | null;
    detail: HTMLElement | null;
    logElement: HTMLElement | null;

    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;

    planeMesh: THREE.Mesh;
    image;
    context: CanvasRenderingContext2D;

    origin: THREE.Group;
    rootContainer: THREE.Group;

    selected: THREE.Mesh | null = null;

    initialize(scene, camera, renderer) {
        this.caption = document.getElementById("caption");
        this.detail = document.getElementById("detail");

        this.logElement = document.getElementById("log");
        // console.log(this.info)

        this.caption.hidden = true;
        this.detail!.hidden = true;

        this.scene = scene;// || new THREE.Scene();
        this.camera = camera;// || new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.renderer = renderer;// new THREE.WebGLRenderer();
        // this.renderer.setSize(window.innerWidth, window.innerHeight);
        // document.body.appendChild(this.renderer.domElement);

        this.origin = new THREE.Group();
        const locatorSphere = new THREE.Mesh(new THREE.SphereGeometry(.1), new THREE.MeshBasicMaterial());
        this.origin.add(locatorSphere);

        this.scene.add(this.origin);

        this.rootContainer = new THREE.Group();
        this.origin.add(this.rootContainer);
        // this.scene.add(this.rootContainer);

        this.camera.position.set(0, 1, 0)

        // const svgUrl = new URL('Rock-of-Ages.svg', import.meta.url);
        // const textureUrl = new URL("Rock-of-Ages.jpg", import.meta.url);

        const svgContainer = new THREE.Group();
        const svgUrl = new URL('Vanport/VanportHigh.svg', import.meta.url);

        const textureUrl = new URL("Vanport/VanportHigh.png", import.meta.url);

        const svg = new SVGLoader().load(svgUrl.toString(), (data) => {

            const paths = data.paths;
            svgContainer.scale.multiplyScalar(0.001);
            svgContainer.scale.y *= - 1;

            // container.position.x = -1.6 / 2;
            // container.position.y = 2.16 / 2;

            // container.position.x = -1.024 * .72 / 2;
            // container.position.y = 1.646 * .72 / 2;

            for (let i = 0; i < paths.length; i++) {

                const path = paths[i];
                const name = path?.userData?.node?.id;

                // console.log(path?.userData?.node);

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


                    //console.log(shape);
                    const geometry = new THREE.ShapeGeometry(shape);
                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.name = name;
                    mesh.layers.enable(1);
                    mesh.position.z = 1 + j;

                    svgContainer.add(mesh);
                }

            }

            this.rootContainer.add(svgContainer);

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




        // const planeGeometry = new THREE.PlaneGeometry(1.600, 2.160);

        // const planeGeometry = new THREE.PlaneGeometry(1.024 * .72, 1.646 * .72);
        const planeGeometry = new THREE.PlaneGeometry(1, 1);

        const planeTexture = new THREE.TextureLoader().load(textureUrl.toString(),
            (texture) => {
                // Image plane scale.
                this.planeMesh.scale.setX(texture.image.width * .001);
                this.planeMesh.scale.setY(texture.image.height * .001);

                // SVG container offset.
                svgContainer.position.x = (-texture.image.width * .001) / 2;
                svgContainer.position.y = (texture.image.height * .001) / 2;

            });

        const planeMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: planeTexture });
        this.planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        this.rootContainer.add(this.planeMesh);




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
        this.caption!.hidden = true;

        if (intersects.length > 0) {
            this.selected = intersects[intersects.length - 1].object as THREE.Mesh;
            this.selected.material!.opacity = .25;
            this.log(intersects[intersects.length - 1].object.name);

            const tag = intersects[intersects.length - 1].object.name;
            const figureData: FigureData | null = this.findFigure(tag);
            this.log(JSON.stringify(figureData));

            if (figureData != null) {
                this.caption!.hidden = false;
                this.caption.innerText = figureData.caption;
                this.detail.innerText = figureData.detail;
                this.log(JSON.stringify(figureData));
            }
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

        // this.log(JSON.stringify(detail.position));
        // this.rootContainer.position.copy(detail.position)
        // this.rootContainer.quaternion.copy(detail.rotation)
        // this.rootContainer.scale.set(detail.scale, detail.scale, detail.scale)
    }

    imageLost() { }

    wayspotFound({ detail }) {
        this.log("WAYSPOT FOUND");

        this.log(detail.position);

        this.rootContainer.position.copy(offsetPosition);
        this.rootContainer.rotation.copy(offsetRotation);
        this.rootContainer.scale.copy(offsetScale);

        this.origin.position.copy(detail.position);
        this.origin.quaternion.copy(detail.rotation)
    }

    wayspotUpdated({ detail }) {
        this.log("WAYSPOT UPDATED");

        this.rootContainer.position.copy(offsetPosition);
        this.rootContainer.rotation.copy(offsetRotation);
        this.rootContainer.scale.copy(offsetScale);

        this.origin.position.copy(detail.position);
        this.origin.quaternion.copy(detail.rotation)
    }

    wayspotLost({ detail }) {
        this.log("WAYSPOT LOST");

        this.rootContainer.position.copy(offsetPosition);
        this.rootContainer.rotation.copy(offsetRotation);
        this.rootContainer.scale.copy(offsetScale);

        this.origin.position.copy(detail.position);
        this.origin.quaternion.copy(detail.rotation)
    }

    log(text: string) {
        const element = document.createElement("div");
        element.innerText = (text);
        this.logElement?.prepend(element);
        console.log(text);
    }

    findFigure(tag: string): FigureData | null {
        for (const currentFigureData of data) {
            if (currentFigureData.tag == tag) {
                return currentFigureData;
            }
        }
        return null;
    }
}

export default new App();