THREE.TSDFShader = {
	uniforms: {
				"u_resx": { value: 1 },
				"u_resy": { value: 1 },
				"u_cubewidth": { value: 1 },
        "u_data": { value: null },
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
				'float texToMeter = 8192.0/1000.0;',


        'void main() {',

					'const float MAX_WEIGHT = 128.0;',

					'vec2 uv = gl_FragCoord.xy;',

					'vec3 coords3d = get3dCoordinates(uv)*3.0;',

					'vec4 data = texture(u_data, coords3d/3.0);',
					'float depth = getDepth(coords3d);',
					'float sdf = 0.0;',
					'float new_value = data.x;',
					'float new_weight = max(1.0, data.y);',

					'vec3 camPos = (u_camMat*vec4(vec3(0.0), 1.0)).xyz;',

					'vec3 camFramePos = getCamFramePos(coords3d);',
					'if(camFramePos.z > 0.0 || isOnEdge(coords3d/3.0) || depth > 30.0) {',
						'gl_FragColor = data;',
						'return;',
					'}',

					'vec3 uvPos = camFramePos/-camFramePos.z;',
					'vec3 ndcPos = vec3(getCamCoordinates(coords3d), 1.0);',
					'if(isInFrame(ndcPos.xy)) {',
						'sdf = -(length(camFramePos)/length(uvPos)- depth);',

						'float truncDist = 0.25;',
						'if(sdf >= -truncDist){',
    					'float new_sdf = sdf/truncDist;',
							'sdf = sdf/truncDist;',
							'sdf = max(-1.0, min(1.0, sdf));',

							'float current_sdf = data.x;',
							'float current_weight = max(1.0, data.y);',
							'float add_weight = 1.0;',
							'float updated_sdf = (current_weight * current_sdf +',
																				'add_weight * new_sdf) /',
																				'(current_weight  + add_weight);',
							'new_weight = min(current_weight + add_weight, MAX_WEIGHT);',
							'new_value = max(-1.0, min(1.0, updated_sdf));',
						'} else {',
							'gl_FragColor = vec4(vec3(new_value, new_weight, sdf), 1.0);',
							'return;',
						'}',
					'}',

					'gl_FragColor = vec4(vec3(new_value, new_weight, sdf), 1.0);',

        '}',

				'float getDepth(vec3 uvw){',
					'vec2 camCoords = getCamCoordinates(uvw);',
					'camCoords.x = 1.0-camCoords.x;',
					'float depth = texture(u_depthTexture, camCoords).x*texToMeter;',
					'if(depth >= 5.0) depth = 1000000.0;',
					'else if(depth <= 0.05) depth = 1000000.0;',
					'return depth * 1.0;',
				'}',

				'vec3 getCamFramePos(vec3 coords){',
					'vec4 camFramePos = inverse(u_camMat)* vec4(coords, 1.0);',
					'camFramePos /= camFramePos.w;',
					'return camFramePos.xyz;',
				'}',

				'vec2 getCamCoordinates(vec3 coords){',
					'vec3 camFramePos = getCamFramePos(coords);',
					'vec2 uvPos = camFramePos.xy / -camFramePos.z;',
					'uvPos.x /= flength_x;',
					'uvPos.y /= flength_y;',
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
				' return vec3(cx, cy, cz)/float(u_cubewidth-1);',
				'}',

				'bool isOnEdge(vec3 coords){',
				' return coords.x < edge || coords.x > 1.0-edge || coords.y < edge || coords.y > 1.0-edge || coords.z < edge || coords.z > 1.0-edge;',
				'}',

				'bool isInFrame(vec2 coords){',
				' return coords.x > 0.0 && coords.x < 1.0 && coords.y > 0.0 && coords.y < 1.0;',
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

THREE.PointVolumeShader = {
	uniforms: {
		'u_size': {value: 1.0},
		"u_res": { value: 64 },
		"u_data": { value: null }
		},
    vertexShader: [
			'precision mediump sampler3D;',
			'uniform float u_size;',
			'uniform int u_res;',
			'uniform sampler3D u_data;',
			'varying float v_size;',
			'varying vec3 v_gradient;',
			'varying float v_zeroCrossing;',

			'const float edge = 0.02;',

			'vec3 gradient(vec3 pos);',
			'float getValue(vec3 pos);',
			'bool isOnEdge(vec3 coords);',
			'bool zeroCrossing(vec3 coords);',

      'void main() {',
					'float tsdfValue = getValue(position);',
					'v_size = 1.0/(0.3+pow(tsdfValue, 0.6));',
					'v_gradient = gradient(position);',
					'v_zeroCrossing = zeroCrossing(position) ? 1.0 : 0.0;',
					'gl_PointSize = 3.0;',
          'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      '}',

			'bool zeroCrossing(vec3 pos){',
				'vec3 coords = pos/u_size;',
				'vec3 hx = vec3(u_size/float(u_res), 0, 0);',
				'vec3 hy = vec3(0, u_size/float(u_res), 0);',
				'vec3 hz = vec3(0, 0, u_size/float(u_res));',
				'bool zeroCrossing = sign(getValue(pos+hx))!=sign(getValue(pos-hx));',
				'zeroCrossing = zeroCrossing || sign(getValue(pos+hy))!=sign(getValue(pos-hy));',
				'zeroCrossing = zeroCrossing || sign(getValue(pos+hz))!=sign(getValue(pos-hz));',
				'return zeroCrossing;',
			'}',

			'vec3 gradient(vec3 pos){',
				'vec3 coords = pos/u_size;',
				'vec3 hx = vec3(u_size/float(u_res), 0, 0);',
				'vec3 hy = vec3(0, u_size/float(u_res), 0);',
				'vec3 hz = vec3(0, 0, u_size/float(u_res));',
				'vec3 grad;',
				'grad.x = getValue(pos+hx)-getValue(pos+hx);',
				'grad.y = getValue(pos+hy)-getValue(pos-hy);',
				'grad.z = getValue(pos+hz)-getValue(pos-hz);',
				'grad *= float(u_res) / 2.0;',
				'if(isOnEdge(coords)) return vec3(0.0);',
				'return grad;',
			'}',

			'float getValue(vec3 pos){',
				'float tsdfValue = texture(u_data, pos/u_size).x;',
				'//tsdfValue = length(pos/u_size - vec3(0.5))-0.4;',
				'return tsdfValue;',
			'}',

			'bool isOnEdge(vec3 coords){',
			' return coords.x < edge || coords.x > 1.0-edge || coords.y < edge || coords.y > 1.0-edge || coords.z < edge || coords.z > 1.0-edge;',
			'}',
    ].join( '\n' ),
	fragmentShader: [
			'varying float v_size;',
			'varying vec3 v_gradient;',
			'varying float v_zeroCrossing;',

      'void main() {',
				'vec2 circCoord = 2.0 * gl_PointCoord - 1.0;',
				'if (dot(circCoord, circCoord) > 1.0 || v_size < 3.0',
				'|| length(v_gradient) == 0.0 || v_zeroCrossing > 0.5) {',
				    'discard;',
				'}',

				'gl_FragColor = vec4(vec3(1.0), 1.0);',

      '}',
	].join( '\n' )
};

THREE.DepthGridShader = {
	uniforms: {
		"u_resx": { value: 1 },
		"u_resy": { value: 1 },
		"u_depthTexture": {value: null},
		'u_camMat': {value: null},
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
					'vec4 worldPos = u_camMat * vec4(pos, 1.0);',
          'gl_Position = projectionMatrix * modelViewMatrix * worldPos;',
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
