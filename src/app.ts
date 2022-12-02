import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';

interface FigureData {
    tag: string,
    caption: string,
    detail: string
}

interface Offset {
    position: THREE.Vector3,
    rotation: THREE.Euler,
    scale: THREE.Vector3
}

interface MuralData {
    svgUrl: string,
    textureUrl: string,
    figures: FigureData[]
}

interface WayspotData {
    wayspotName: string,
    offset: Offset,
}

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
    svgContainer: THREE.Group = new THREE.Group();

    selected: THREE.Mesh | null = null;

    wayspotData: WayspotData;
    muralData: MuralData;

    initialize(scene, camera, renderer) {
        this.caption = document.getElementById("caption");
        this.detail = document.getElementById("detail");

        this.logElement = document.getElementById("log");
        // console.log(this.info)

        // Hide caption/detail initially.
        this.displayCaption(false);
        this.displayDetail(false);

        this.caption!.addEventListener("click", () => {
            this.toggleDetail();
        });

        this.detail!.addEventListener("click", () => {
            this.displayDetail(false);
        });

        // Fetch data.
        let mural = window.location.hash.substring(1);
        // fetch("/murals/RockofAges.json")
        let muralUrl = `/murals/${mural}.json`;
        console.log(muralUrl);
        fetch(muralUrl)
            .then((response) => response.json())
            .then((data) => {
                this.muralData = data;
                console.log(data);

                this.initializeMural();
            });

        fetch("/wayspots/Scott.json")
            // fetch("/wayspots/CETI.json")
            .then((response) => response.json())
            .then((data) => {
                this.wayspotData = data;
                console.log(data);
            });

        // Scene setup;
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        this.origin = new THREE.Group();
        const locatorSphere = new THREE.Mesh(new THREE.SphereGeometry(.1), new THREE.MeshBasicMaterial());
        this.origin.add(locatorSphere);

        this.scene.add(this.origin);

        this.rootContainer = new THREE.Group();
        this.origin.add(this.rootContainer);

        this.camera.position.set(0, 1, 0)
    }

    update() {
        // Raycast

        let raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        raycaster.layers.set(1);

        const intersects = raycaster.intersectObjects(this.scene.children);
        if (intersects.length > 0) {
            let newSelection = intersects[intersects.length - 1].object as THREE.Mesh;

            if (newSelection != this.selected) {
                this.deselect();

                this.selected = intersects[intersects.length - 1].object as THREE.Mesh;
                (this.selected.material as THREE.Material).opacity = .25;
                this.log(intersects[intersects.length - 1].object.name);

                const tag = intersects[intersects.length - 1].object.name;
                const figureData: FigureData | null = this.findFigure(tag);
                this.log(JSON.stringify(figureData));

                if (figureData != null) {
                    this.displayCaption(true);
                    this.caption!.innerText = figureData.caption;
                    this.detail!.innerText = figureData.detail;
                    this.log(JSON.stringify(figureData));
                }
            }
        } else {
            this.deselect();
        }

    }

    deselect() {
        if (this.selected) (this.selected.material as THREE.Material).opacity = 0;
        this.selected = null;
        this.displayCaption(false);
    }

    displayCaption(visible: boolean) {
        this.caption!.style.visibility = (visible) ? "visible" : "hidden";
    }
    displayDetail(visible: boolean) {
        this.detail!.style.visibility = (visible) ? "visible" : "hidden";
    }
    toggleDetail() {
        let state = this.detail!.style.visibility;
        this.detail!.style.visibility = (state == "visible") ? "hidden" : "visible";
    }

    // 8th Wall
    trackingStatus() { }

    wayspotFound({ detail }) {
        this.log("WAYSPOT FOUND:" + detail.name);

        this.log(detail.position);

        this.applyOffset();

        this.origin.position.copy(detail.position);
        this.origin.quaternion.copy(detail.rotation)
    }

    wayspotUpdated({ detail }) {
        this.log("WAYSPOT UPDATED");

        this.applyOffset();

        this.origin.position.copy(detail.position);
        this.origin.quaternion.copy(detail.rotation)
    }

    wayspotLost({ detail }) {
        this.log("WAYSPOT LOST");

        this.applyOffset();

        this.origin.position.copy(detail.position);
        this.origin.quaternion.copy(detail.rotation)
    }

    applyOffset() {
        this.rootContainer.position.copy(this.wayspotData.offset.position);
        let { x, y, z } = this.wayspotData.offset.rotation;
        this.rootContainer.rotation.set(x, y, z);
        this.rootContainer.scale.copy(this.wayspotData.offset.scale);
    }

    log(text: string) {
        const element = document.createElement("div");
        element.innerText = (text);
        this.logElement?.prepend(element);
        console.log(text);
    }

    initializeMural() {

        const svg = new SVGLoader().load(this.muralData.svgUrl.toString(), (data) => {

            const paths = data.paths;
            this.svgContainer.scale.multiplyScalar(0.001);
            this.svgContainer.scale.y *= - 1;

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

                    this.svgContainer.add(mesh);
                }

            }

            this.rootContainer.add(this.svgContainer);

        });

        const planeGeometry = new THREE.PlaneGeometry(1, 1);

        const planeTexture = new THREE.TextureLoader().load(this.muralData.textureUrl.toString(),
            (texture) => {
                // Image plane scale.
                this.planeMesh.scale.setX(texture.image.width * .001);
                this.planeMesh.scale.setY(texture.image.height * .001);

                // SVG container offset.
                this.svgContainer.position.x = (-texture.image.width * .001) / 2;
                this.svgContainer.position.y = (texture.image.height * .001) / 2;

            });

        const planeMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: planeTexture });
        this.planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        this.rootContainer.add(this.planeMesh);
    }

    findFigure(tag: string): FigureData | null {
        for (const currentFigureData of this.muralData.figures) {
            if (currentFigureData.tag == tag) {
                return currentFigureData;
            }
        }
        return null;
    }
}

export default new App();