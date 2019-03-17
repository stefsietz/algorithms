THREE.Volume2Dto3D = {
	uniforms: {
        "u_size": { value: new THREE.Vector3( 1, 1, 1 ) },
        "u_renderthreshold": { value: 0.5 },
        "u_clim": { value: new THREE.Vector2( 1, 1 ) },
        "u_data": { value: null }
    },
    vertexShader: [
        'in vec3 v_position;',

        'void main() {',
            'gl_Position = vec4(v_position);',
        '}',
    ].join( '\n' ),
	fragmentShader: [
        'uniform int u_resx;',
        'uniform int u_resy;',

        'uniform int u_cubewidth',

        'uniform sampler2D u_data;',

        'vec3 get3dcoordinates(vec2 uv){',
        ' int x = int(uv.x*u_resx);',
        ' int y = int(uv.y*u_resx);',
        ' int linIndex = u_resx * y + x;',

        ' int linIndex = u_resx * y + x;',
        ' int cz = linIndex / (u_cubewidth*u_cubewidth);',
        ' int residue = linIndex - cz * (u_cubewidth*u_cubewidth);',
        ' int cy = residue / u_cubewidth;',
        ' residue = residue - cy * u_cubewidth;',
        ' int cx = residue;',
        ' return vec3(cx, cy, cz)',
        '}',

        'void main() {',

        '}'
	].join( '\n' )
};
