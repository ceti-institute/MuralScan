
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';

interface MuralData {
    svgUrl: string,
    textureUrl: string,
    figures: FigureData[]
    scale: number;
}

interface FigureData {
    tag: string,
    caption: string,
    detail: string,
    audio?: string
}

class Mural extends THREE.Group {

    muralData;

    planeMesh: THREE.Mesh;
    svgContainer: THREE.Group = new THREE.Group();

    constructor(muralData: MuralData) {
        super();

        this.muralData = muralData;

        const svg = new SVGLoader().load(this.muralData.svgUrl.toString(), (data) => {
            const paths = data.paths;
            this.svgContainer.scale.multiplyScalar(0.001 * this.muralData.scale);
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
                    // color: new THREE.Color("#ffff00"),// path.color,
                    color: path.color,
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

            this.add(this.svgContainer);

        });

        const planeGeometry = new THREE.PlaneGeometry(1, 1);

        const planeTexture = new THREE.TextureLoader().load(this.muralData.textureUrl.toString(),
            (texture) => {
                // Image plane scale.
                this.planeMesh.scale.setX(texture.image.width * .001 * this.muralData.scale);
                this.planeMesh.scale.setY(texture.image.height * .001 * this.muralData.scale);

                // SVG container offset.
                this.svgContainer.position.x = (-texture.image.width * .001 * this.muralData.scale) / 2;
                this.svgContainer.position.y = (texture.image.height * .001 * this.muralData.scale) / 2;

            });

        const planeMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: planeTexture });
        this.planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        this.add(this.planeMesh);
    }

    toggleTexture() {
        this.planeMesh.visible = !this.planeMesh.visible;
    }

}

export {
    Mural, MuralData, FigureData
}