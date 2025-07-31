class TextureLoader {

    constructor(options) {

        this.textures = {};

        this.assetsDirectory = options?.assetsDirectory ?? new URL('.', import.meta.url).href + "Assets/";
    }

    resolvePath(path) {
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('file://') || path.startsWith('./') || path.startsWith('/')) {
            return path;
        }
        return new URL(path, this.assetsDirectory).href;
    }


    async addImage(name, url) {
        const path = this.resolvePath(url);
        console.log(`Attempting to load image: ${name} from ${path}`);

        if (this.textures[name]) {
            console.warn(`Image texture "${name}" already exists. Skipping load.`);
            return this.textures[name];
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.textures[name] = img;
                console.log(`Image texture "${name}" loaded successfully.`);
                resolve(img);
            };
            img.onerror = (error) => {
                console.error(`Failed to load image texture "${name}" from "${path}":`, error);
                reject(new Error(`Failed to load image: ${path}`));
            };
            img.src = path;
        });
    }


    async addImages(images) {
        const loadPromises = [];
        for (const name in images) {
            if (Object.prototype.hasOwnProperty.call(images, name)) {
                loadPromises.push(this.addImage(name, images[name])
                    .catch(e => console.error(`Error adding image ${name}: ${e.message}`))); // Catch individual errors to allow other images to load
            }
        }
        await Promise.allSettled(loadPromises); // Use allSettled to wait for all promises regardless of success/failure
        console.log("All image loading attempts completed.");
    }


    getImage(name) {
        if (!this.textures[name]) {
            console.warn(`Image texture "${name}" not found.`);
        }
        return this.textures[name];
    }
};

export default TextureLoader;
