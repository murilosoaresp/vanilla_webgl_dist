import { Vec2D } from 'vanilla_core';
import { BrowserExtensions } from 'vanilla_browser';

class Float32List {
    array;
    capacity_;
    index;
    constructor(capacity) {
        this.array = new Float32Array(capacity);
        this.capacity_ = capacity;
        this.index = 0;
    }
    get_array() {
        return this.array;
    }
    capacity() {
        return this.capacity_;
    }
    len() {
        return this.index;
    }
    get(index) {
        return this.array[index];
    }
    put(index, value) {
        this.array[index] = value;
    }
    push(value) {
        if (this.index >= this.capacity()) {
            let new_array = new Float32Array(2 * this.capacity());
            for (let i = 0; i < this.len(); i++) {
                new_array[i] = this.array[i];
            }
            this.array = new_array;
            this.capacity_ = 2 * this.capacity();
        }
        this.array[this.index] = value;
        this.index += 1;
    }
    clear() {
        this.index = 0;
    }
}

var GlShader;
(function (GlShader) {
    function create(gl, kind, source) {
        let parsedKind = _KindTadToGlEnum(gl, kind);
        var shader = gl.createShader(parsedKind);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }
        else {
            let error = gl.getShaderInfoLog(shader);
            console.log(error);
            gl.deleteShader(shader);
            throw new Error(error);
        }
    }
    GlShader.create = create;
    function _KindTadToGlEnum(gl, kind) {
        switch (kind) {
            case "vertex":
                return gl.VERTEX_SHADER;
            case "fragment":
                return gl.FRAGMENT_SHADER;
        }
    }
    GlShader._KindTadToGlEnum = _KindTadToGlEnum;
})(GlShader || (GlShader = {}));

var GlProgram;
(function (GlProgram) {
    function create_from_sources(gl, vertexShaderSrc, fragmentShaderSrc) {
        let vertexShader = GlShader.create(gl, "vertex", vertexShaderSrc);
        let fragmentShader = GlShader.create(gl, "fragment", fragmentShaderSrc);
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }
        else {
            let error = gl.getProgramInfoLog(program);
            console.log(error);
            gl.deleteProgram(program);
            throw new Error(error);
        }
    }
    GlProgram.create_from_sources = create_from_sources;
    function get_uniform_location(gl, program, name) {
        let location = gl.getUniformLocation(program, name);
        if (location === null) {
            throw new Error();
        }
        return location;
    }
    GlProgram.get_uniform_location = get_uniform_location;
})(GlProgram || (GlProgram = {}));

var GlUtils;
(function (GlUtils) {
    GlUtils.Shader = GlShader;
    GlUtils.Program = GlProgram;
    function resize_canvas_to_display_size(canvas) {
        // Lookup the size the browser is displaying the canvas in CSS pixels.
        let displayWidth = canvas.clientWidth;
        let displayHeight = canvas.clientHeight;
        // Check if the canvas is not the same size.
        let needResize = canvas.width !== displayWidth ||
            canvas.height !== displayHeight;
        if (needResize) {
            // Make the canvas the same size
            canvas.width = displayWidth;
            canvas.height = displayHeight;
        }
        return needResize;
    }
    GlUtils.resize_canvas_to_display_size = resize_canvas_to_display_size;
    async function load_image(img_url, on_load) {
        return new Promise((res, rej) => {
            var image = new Image();
            image.src = img_url;
            image.addEventListener('load', async () => {
                await on_load(image);
                res();
            });
            image.addEventListener("error", (err) => rej(err));
        });
    }
    GlUtils.load_image = load_image;
    function window_coords_to_world_coords(vec_window_coords, canvas_window_al_rect, world_camera) {
        let worldShift = canvas_window_al_rect.center().shift_to(vec_window_coords).flip_y();
        worldShift.x = (worldShift.x / canvas_window_al_rect.width) * world_camera.width;
        worldShift.y = (worldShift.y / canvas_window_al_rect.height) * world_camera.height;
        let worldPos = worldShift.plus(world_camera.center);
        return worldPos;
    }
    GlUtils.window_coords_to_world_coords = window_coords_to_world_coords;
    function TransformCanvasCoordinates(canvas_vec, canvas_width, canvas_height) {
        return new Vec2D(canvas_vec.x - (0.5 * canvas_width), -canvas_vec.y + (0.5 * canvas_height));
    }
    GlUtils.TransformCanvasCoordinates = TransformCanvasCoordinates;
    function transform_window_coordinates(vec) {
        return new Vec2D(vec.x - (0.5 * window.innerWidth), -vec.y + (0.5 * window.innerHeight));
    }
    GlUtils.transform_window_coordinates = transform_window_coordinates;
})(GlUtils || (GlUtils = {}));

var GlBuffer;
(function (GlBuffer) {
    function create_vao(gl) {
        let buffer = gl.createVertexArray();
        if (buffer === null) {
            throw new Error();
        }
        return buffer;
    }
    GlBuffer.create_vao = create_vao;
    function create_buffer(gl) {
        let buffer = gl.createBuffer();
        if (buffer === null) {
            throw new Error();
        }
        return buffer;
    }
    GlBuffer.create_buffer = create_buffer;
})(GlBuffer || (GlBuffer = {}));

var GlCtxUtils;
(function (GlCtxUtils) {
    function get_context(canvas) {
        let ctx = canvas.getContext("webgl2");
        if (ctx === null) {
            throw new Error();
        }
        return ctx;
    }
    GlCtxUtils.get_context = get_context;
})(GlCtxUtils || (GlCtxUtils = {}));

var GlScreen;
(function (GlScreen) {
    BrowserExtensions.load();
    /**
     * PPCM: Pixels Per Centimeter
     * How many pixels are in one centimenter.
     */
    function ppcm() {
        let div_id = "##ppcm_div_helper#####";
        let html = `
        <div id="${div_id}" style="width: 1cm; height: 1cm" class="">
        </div>
        `;
        document.body.insert_before_end(html);
        let div = document.getElementById(div_id);
        let ppcm = div.getBoundingClientRect().width;
        div.remove();
        return ppcm;
    }
    GlScreen.ppcm = ppcm;
    // /*
    // PPI: Pixels Per Inch. This is mesured using the (full)screen and monitor diagonals
    // Returns how many physical (not logical/css) pixels are covered by one inch of along the monitor diagonal.
    // This should be browser agnostic.
    // */
    // export function physical_ppi(monitor_diagonal_size_in_inches: number) {
    //     // get the screen dimensions in css pixels
    //     const width_css = window.screen.width;
    //     const height_css = window.screen.height;
    //     // get the device pixel ratio (dpr)
    //     const dpr = window.devicePixelRatio || 1;
    //     // get screen dimensions in physical pixels
    //     const width_physical = width_css * dpr;
    //     const height_physical = height_css * dpr;
    //     // calculate diagonal size in pixels
    //     const diagonal_in_pixels = Math.sqrt(width_physical ** 2 + height_physical ** 2);
    //     // calculate ppi (pixels per inch)
    //     const ppi = diagonal_in_pixels / monitor_diagonal_size_in_inches;
    //     return ppi;
    // }
})(GlScreen || (GlScreen = {}));

var GlTexture;
(function (GlTexture) {
    function create(gl) {
        let tex = gl.createTexture();
        if (tex === null) {
            throw new Error();
        }
        return tex;
    }
    GlTexture.create = create;
    function bind(gl, target, texture, min_filter, mag_filter) {
        let gl_target = gl[target.toUpperCase()];
        gl.bindTexture(gl_target, texture);
        let gl_min_filter = gl[min_filter.toUpperCase()];
        let gl_mag_filter = gl[mag_filter.toUpperCase()];
        // TODO: "gl.TEXTURE_2D" should be replaced with "gl_target"
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl_min_filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl_mag_filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    GlTexture.bind = bind;
    function remove(gl, tex) {
        gl.deleteTexture(tex);
    }
    GlTexture.remove = remove;
    function load_image_dimensions(url) {
        return new Promise((res, rej) => {
            let image = new Image();
            image.onload = () => {
                res({ width: image.width, height: image.height });
            };
            image.src = url;
        });
    }
    GlTexture.load_image_dimensions = load_image_dimensions;
    function load_2d_rgba_from_url_to_texture(gl, url) {
        return new Promise((res, rej) => {
            let image = new Image();
            image.onload = () => {
                let texture = gl.createTexture();
                if (texture === null) {
                    throw new Error;
                }
                // TODO: generalize min and mag filter parameters beyond "linear"
                bind(gl, "texture_2d", texture, "linear", "linear");
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                res({
                    dim: { width: image.width, height: image.height },
                    texture: texture,
                });
            };
            image.src = url;
        });
    }
    GlTexture.load_2d_rgba_from_url_to_texture = load_2d_rgba_from_url_to_texture;
})(GlTexture || (GlTexture = {}));

export { Float32List, GlBuffer, GlCtxUtils, GlProgram, GlScreen, GlShader, GlTexture, GlUtils };
