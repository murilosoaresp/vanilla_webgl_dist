import { Vec2D, UiAlRect, AlRect2D } from 'vanilla_math';

declare class Float32List {
    private array;
    private capacity_;
    private index;
    constructor(capacity: number);
    get_array(): Float32Array;
    capacity(): number;
    len(): number;
    get(index: number): number;
    put(index: number, value: number): void;
    push(value: number): void;
    clear(): void;
}

type GlCtx = WebGL2RenderingContext;
declare namespace GlCtxUtils {
    function get_context(canvas: HTMLCanvasElement): GlCtx;
}

declare namespace GlProgram {
    function create_from_sources(gl: GlCtx, vertexShaderSrc: string, fragmentShaderSrc: string): WebGLProgram;
    function get_uniform_location(gl: GlCtx, program: WebGLProgram, name: string): WebGLUniformLocation;
}

declare namespace GlShader {
    type KindTag = "vertex" | "fragment";
    function create(gl: GlCtx, kind: KindTag, source: string): WebGLShader;
    function _KindTadToGlEnum(gl: GlCtx, kind: KindTag): number;
}

declare namespace GlUtils {
    type Ctx = GlCtx;
    const Shader: typeof GlShader;
    const Program: typeof GlProgram;
    function resize_canvas_to_display_size(canvas: HTMLCanvasElement): boolean;
    function load_image(img_url: string, on_load: (image: HTMLImageElement) => Promise<void>): Promise<void>;
    function window_coords_to_world_coords(vec_window_coords: Vec2D, canvas_window_al_rect: UiAlRect, world_camera: AlRect2D): Vec2D;
    function TransformCanvasCoordinates(canvas_vec: Vec2D, canvas_width: number, canvas_height: number): Vec2D;
    function transform_window_coordinates(vec: Vec2D): Vec2D;
}

declare namespace GlBuffer {
    function create_vao(gl: GlCtx): WebGLVertexArrayObject;
    function create_buffer(gl: GlCtx): WebGLBuffer;
}

declare namespace GlScreen {
    /**
     * PPCM: Pixels Per Centimeter
     * How many pixels are in one centimenter.
     */
    function ppcm(): number;
}

declare namespace GlTexture {
    function create(gl: GlCtx): WebGLTexture;
    function bind(gl: GlCtx, target: "texture_1d" | "texture_2d" | "texture_3d", texture: WebGLTexture, min_filter: "nearest" | "linear" | "nearest_mipmap_nearest" | "linear_mipmap_nearest" | "nearest_mipmap_linear" | "linear_mipmap_linear" | "texture_mag_filter" | "texture_min_filter", mag_filter: "nearest" | "linear"): void;
    function remove(gl: GlCtx, tex: WebGLTexture): void;
    function load_image_dimensions(url: string): Promise<{
        width: number;
        height: number;
    }>;
    function load_2d_rgba_from_url_to_texture(gl: GlCtx, url: string): Promise<{
        texture: WebGLTexture;
        dim: {
            width: number;
            height: number;
        };
    }>;
}

export { Float32List, GlBuffer, type GlCtx, GlCtxUtils, GlProgram, GlScreen, GlShader, GlTexture, GlUtils };
