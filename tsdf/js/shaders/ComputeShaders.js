THREE.TSDFShader = {
	uniforms: {
				"u_resx": { value: 1 },
				"u_resy": { value: 1 },
				"u_cubewidth": { value: 1 },
        "u_data": { value: null },
				"u_tsdf": { value: null },
				"u_col": { value: null },
				"u_depthTexture": {value: null},
				'u_camMat': {value: null}
    },
    vertexShader: [
        'void main() {',
            'gl_Position = vec4(position, 1.0);',
        '}',
    ].join( '\n' ),
	fragmentShader: [
				'precision mediump sampler3D;',
				'precision highp sampler2D;',
				'const float edge = 0.02;',
        'uniform int u_resx;',
        'uniform int u_resy;',

        'uniform int u_cubewidth;',

        'uniform sampler3D u_data;',
				'uniform sampler2D u_depthTexture;',

				'uniform mat4 u_camMat;',

				'vec3 get3dCoordinates(vec2 uv);',
				'float getDepth(vec3 uvw);',
				'bool isOnEdge(vec3 coords);',
				'vec2 getCamCoordinates(vec3 coords);',
				'vec3 getCamFramePos(vec3 coords);',
				'bool isInFrame(vec2 coords);',

				'const float flength_x = 320.0/585.0;',
				'const float flength_y = 240.0/585.0;',
				'const float aspect = 320.0/240.0;',

        'void main() {',

				'vec2 uv = gl_FragCoord.xy;',

				'vec3 coords3d = get3dCoordinates(uv);',

				'vec4 data = texture(u_data, coords3d);',
				'float depth = getDepth(coords3d);',
				'float sdf = 0.0;',

				'if( !isOnEdge(coords3d)) {',
					'vec3 camFramePos = getCamFramePos(coords3d);',
					'vec3 uvPos = vec3(getCamCoordinates(coords3d), 1.0);',
					'if(isInFrame(uvPos.xy)) {',
						'vec3 sdfVec = camFramePos - uvPos * depth;',
						'float sign = -sign(sdfVec.z);',

						'sdf = -(length(camFramePos)/length(uvPos)- depth);',

						'float truncDist = 0.025;',
						'if(sdf >= -truncDist){',
    					'sdf = sdf/truncDist;',
							'sdf = max(-1.0, min(1.0, sdf));',
						'}',
					'}',
				'}',

				'gl_FragColor = vec4(vec3(-sdf), 1.0);',

        '}',

				'float getDepth(vec3 uvw){',
					'vec2 camCoords = getCamCoordinates(uvw);',
					'float texVal = texture(u_depthTexture, camCoords).x*65536.0;',
					'if(texVal >= 65535.0) texVal = 0.0;',
					'return texVal/65535.0;',
				'}',

				'vec3 getCamFramePos(vec3 coords){',
					'vec4 camFramePos = inverse(u_camMat)* vec4(coords, 1.0);',
					'camFramePos *= aspect;',
					'camFramePos /= camFramePos.w;',
					'return camFramePos.xyz;',
				'}',

				'vec2 getCamCoordinates(vec3 coords){',
					'vec3 camFramePos = getCamFramePos(coords);',
					'vec2 uvPos = camFramePos.xy / camFramePos.z;',
					'uvPos = uvPos / 2.0 + vec2(0.5);',
					'return uvPos;',
				'}',


				'vec3 get3dCoordinates(vec2 uv){',
				' int x = int(uv.x);',
				' int y = int(uv.y);',
				' int w = u_cubewidth;',

				' float scaleFact = float(u_cubewidth+1)/float(u_cubewidth);',

				' int linIndex = u_resx * y + x;',
				' int cz = linIndex / (w*w);',
				' int residue = linIndex - cz * (w*w);',
				' int cy = residue / w;',
				' residue = residue - cy * w;',
				' int cx = residue;',
				' return vec3(cx, cy, cz)/float(u_cubewidth);',
				'}',

				'bool isOnEdge(vec3 coords){',
				' return coords.x < edge || coords.x > 1.0-edge || coords.y < edge || coords.y > 1.0-edge || coords.z < edge || coords.z > 1.0-edge;',
				'}',

				'bool isInFrame(vec2 coords){',
				' return coords.x > 0.0 || coords.x < 1.0 || coords.y > 0.0 || coords.y < 1.0;',
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

THREE.DepthGridShader = {
	uniforms: {
		"u_resx": { value: 1 },
		"u_resy": { value: 1 },
		"u_depthTexture": {value: null},
		'u_camMat': {value: null}
    },
    vertexShader: [
			'precision highp sampler2D;',
			'const float edge = 0.02;',
			'uniform int u_resx;',
			'uniform int u_resy;',

			'uniform sampler2D u_depthTexture;',

			'uniform mat4 u_camMat;',

			'varying vec2 v_uv;',
			'varying vec3 v_position;',
			'varying float v_depth;',

			'const float flength_x = 320.0/585.0;',
			'const float flength_y = 240.0/585.0;',
			'const float aspect = 320.0/240.0;',
			'float texToMeter = 8192.0/1000.0;',

			'float getDepth(vec3 uvw);',

			'varying float invalid;',

      'void main() {',
					'v_uv = position.xy/2.0 + vec2(0.5);',
					'v_uv.x = 1.0 - v_uv.x;',
					'v_depth = getDepth(position);',
					'if(v_depth > 1000.0) invalid = 1.0;',
					'vec3 pos = position;',
					'pos.x *= flength_x;',
					'pos.y *= flength_y;',
					'pos.z = -1.0;',
					'pos = pos*v_depth;',
					'v_position = position;',
          'gl_Position = projectionMatrix * modelViewMatrix * u_camMat * vec4(pos, 1.0);',
      '}',


			'float getDepth(vec3 uvw){',
				'vec2 camCoords = uvw.xy/2.0+vec2(0.5);',
				'camCoords.x = 1.0-camCoords.x;',
				'float depth = texture(u_depthTexture, camCoords).x*texToMeter;',
				'if(depth >= 5.0) depth = 1000000.0;',
				'else if(depth <= 0.05) depth = 1000000.0;',
				'return depth * 1.0;',
			'}',
    ].join( '\n' ),
	fragmentShader: [
        'uniform sampler2D u_depthTexture;',

				'const float flength_x = 320.0/585.0;',
				'const float flength_y = 240.0/585.0;',
				'const float aspect = 320.0/240.0;',
				'float texToMeter = 8192.0/1000.0;',

				'varying vec2 v_uv;',
				'varying vec3 v_position;',
				'varying float v_depth;',
				'varying float invalid;',

				'float getDepth(vec3 uvw);',

				'bool isInFrame(vec2 coords, float edge);',

        'void main() {',
				'float depth = getDepth(v_position);',
				'if (invalid > 0.0 || !isInFrame(v_uv, 0.01)) discard;',

				'vec3 col = texture(u_depthTexture, v_uv).xyz;',

				'gl_FragColor = vec4(vec3(depth/4.0), 1.0);',

        '}',

				'bool isInFrame(vec2 coords, float edge){',
				' return coords.x > 0.0+edge && coords.x < 1.0-edge && coords.y > 0.0+edge && coords.y < 1.0-edge;',
				'}',

				'float getDepth(vec3 uvw){',
					'vec2 camCoords = uvw.xy/2.0+vec2(0.5);',
					'camCoords.x = 1.0-camCoords.x;',
					'float depth = texture(u_depthTexture, camCoords).x*texToMeter;',
					'if(depth >= 5.0) depth = 1000000.0;',
					'else if(depth <= 0.05) depth = 1000000.0;',
					'return depth * 1.0;',
				'}',
	].join( '\n' )
};
