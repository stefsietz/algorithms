THREE.TSDFShader = {
	uniforms: {
				"u_resx": { value: 1 },
				"u_resy": { value: 1 },
				"u_cubewidth": { value: 1 },
        "u_data": { value: null },
				"u_tsdf": { value: null },
				"u_col": { value: null },
    },
    vertexShader: [
        'void main() {',
            'gl_Position = vec4(position, 1.0);',
        '}',
    ].join( '\n' ),
	fragmentShader: [
				'precision mediump sampler3D;',
        'uniform int u_resx;',
        'uniform int u_resy;',

        'uniform int u_cubewidth;',

        'uniform sampler3D u_data;',

				'vec3 get3dCoordinates(vec2 uv);',

        'void main() {',

				'vec2 uv = gl_FragCoord.xy;',

				'vec3 coords3d = get3dCoordinates(uv);',

				'vec4 data = texture(u_data, coords3d/float(u_cubewidth));',

				'mat4 tmat = viewMatrix;',
				'mat4 tmat_inv = inverse(viewMatrix);',

				'gl_FragColor = data;//vec4(coords3d/float(u_cubewidth), 1.0);',

        '}',

				'vec3 get3dCoordinates(vec2 uv){',
				' int x = int(uv.x);',
				' int y = int(uv.y);',

				' int linIndex = u_resx * y + x;',
				' int cz = linIndex / (u_cubewidth*u_cubewidth);',
				' int residue = linIndex - cz * (u_cubewidth*u_cubewidth);',
				' int cy = residue / u_cubewidth;',
				' residue = residue - cy * u_cubewidth;',
				' int cx = residue;',
				' return vec3(cx, cy, cz);',
				'}',
	].join( '\n' )
};

THREE.PassThroughShader = {
	uniforms: {
				"u_tex": { value: null },
    },
    vertexShader: [
				'varying vec3 v_position;',

        'void main() {',
						'v_position = position;',
            'gl_Position = vec4(position, 1.0);',
        '}',
    ].join( '\n' ),
	fragmentShader: [
        'uniform sampler2D u_tex;',

				'varying vec3 v_position;',

        'void main() {',

				'vec2 uv = v_position.xy/2.0 + vec2(0.5);',

				'vec3 col = texture(u_tex, uv).xyz;',

				'gl_FragColor = vec4(col, 1.0);',

        '}',
	].join( '\n' )
};
