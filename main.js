const canvas = document.querySelector("#window");
const gl = canvas.getContext("webgl");
if (!gl) {
    alert('WebGL not supported');
}

function GLBuffer(type = gl.ARRAY_BUFFER) {
    var self = this;

    self.init = function () {
        self.bufferID = gl.createBuffer();
    }

    self.bind = function () {
        gl.bindBuffer(type, self.bufferID);
    }

    self.attachData = function (data, usage = gl.STATIC_DRAW) {
        self.bind();
        gl.bufferData(type, data, usage);
    }

    self.unbind = function () {
        gl.bindBuffer(type, null);
    }

    self.init();
}

function GLShader(type) {
    var self = this;

    self.init = function () {
        self.shaderID = gl.createShader(type);
    }

    self.attachSource = function (source) {
        gl.shaderSource(self.shaderID, source);
    }

    self.compile = function () {
        gl.compileShader(self.shaderID);
        if (!gl.getShaderParameter(self.shaderID, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(self.shaderID));
            return null;
        }
    }

    self.deleteShader = function () {
        gl.deleteShader(self.shaderID);
    }

    self.init();
}

function GLProgram() {
    var self = this;

    self.init = function () {
        self.programID = gl.createProgram();
    }

    self.attachShader = function (shaderID) {
        gl.attachShader(self.programID, shaderID);
    }

    self.linkProgram = function () {
        gl.linkProgram(self.programID);
        if (!gl.getProgramParameter(self.programID, gl.LINK_STATUS)) {
            console.log(gl.getShaderInfoLog(self.programID));
            return null;
        }
    }

    self.use = function () {
        gl.useProgram(self.programID);
    }

    self.unUse = function () {
        gl.useProgram(null);
    }

    self.setInt = function (name, value) {
        var location = gl.getUniformLocation(self.programID, name);
        gl.uniform1i(location, value);
    }

    self.setFloat = function (name, value) {
        var location = gl.getUniformLocation(self.programID, name);
        gl.uniform1f(location, value);
    }

    self.setVec2 = function (name, value) {
        var location = gl.getUniformLocation(self.programID, name);
        gl.uniform2f(location, value[0], value[1]);
    }
    self.setVec2 = function (name, x, y) {
        var location = gl.getUniformLocation(self.programID, name);
        gl.uniform2f(location, x, y);
    }

    self.setVec3 = function (name, value) {
        var location = gl.getUniformLocation(self.programID, name);
        gl.uniform3f(location, value[0], value[1], value[2]);
    }
    self.setVec3 = function (name, x, y, z) {
        var location = gl.getUniformLocation(self.programID, name);
        gl.uniform3f(location, x, y, z);
    }

    self.setVec4 = function (name, value) {
        var location = gl.getUniformLocation(self.programID, name);
        gl.uniform4f(location, value[0], value[1], value[2], value[3]);
    }
    self.setVec4 = function (name, x, y, z, w) {
        var location = gl.getUniformLocation(self.programID, name);
        gl.uniform4f(location, x, y, z, w);
    }

    self.setMat2 = function (name, value) {
        var location = gl.getUniformLocation(self.programID, name);
        gl.uniformMatrix2fv(location, false, value);
    }

    self.setMat3 = function (name, value) {
        var location = gl.getUniformLocation(self.programID, name);
        gl.uniformMatrix3fv(location, false, value);
    }
    
    self.setMat4 = function (name, value) {
        var location = gl.getUniformLocation(self.programID, name);
        gl.uniformMatrix4fv(location, false, value);
    }

    self.init();
}

function toRadian(a) {
    var degree = Math.PI / 180;
    return a * degree;
}

function EventHandler() {
    var self = this;
    self.events = {
        "keydown": [],
        "keyup": [],
        "mousedown": [],
        "mouseup": [],
        "mousemove": [],
        "mousewheel": []
    };

    self.init = function () {
        for (var key in self.events) {
            for (var callbackFn in self.events[key]) {
                document.addEventListener(key, callbackFn);
            }
        }
    }

    self.addEventCallback = function (event, callback) {
        self.events[event].push(callback);
        document.addEventListener(event, callback);
    }

    self.init();
}

function Camera(position = [0,0,0], up = [0,1,0], yaw = -90.0, pitch =  0.0) {
    var self = this;

    self.right = [];
    self.up = [];

    self.init = function () {
        self.front = [0, 0, -1];
        self.movementSpeed = 2.5;
        self.mouseSensitivity = 0.1;
        self.zoom = 45.0;

        self.position = position;
        self.worldUp = up;
        self.yaw = yaw;
        self.pitch = pitch;
        updateCameraVectors();
    }

    self.getViewMatrix = function () {
        var eye = glMatrix.vec3.create();
        glMatrix.vec3.add(eye, self.position, self.front);
        var lookAt = glMatrix.mat4.create();
        glMatrix.mat4.lookAt(lookAt, self.position, eye, self.up);
        return lookAt;
    }

    self.processKeyboard = function (direction) {
        var velocity = self.movementSpeed * 0.007;
        if (direction == 'FORWARD')
        {
            var scaledFront = glMatrix.vec3.create();
            glMatrix.vec3.scale(scaledFront, self.front, velocity);
            glMatrix.vec3.add(self.position, self.position, scaledFront);
        }
        if (direction == 'BACKWARD')
        {
            var scaledFront = glMatrix.vec3.create();
            glMatrix.vec3.scale(scaledFront, self.front, velocity);
            glMatrix.vec3.subtract(self.position, self.position, scaledFront);
        }
        if (direction == 'LEFT')
        {
            var scaledRight = glMatrix.vec3.create();
            glMatrix.vec3.scale(scaledRight, self.right, velocity);
            glMatrix.vec3.subtract(self.position, self.position, scaledRight);
        }
        if (direction == 'RIGHT')
        {
            var scaledRight = glMatrix.vec3.create();
            glMatrix.vec3.scale(scaledRight, self.right, velocity);
            glMatrix.vec3.add(self.position, self.position, scaledRight);
        }
        if (direction == "UP")
        {
            var scaledUp = glMatrix.vec3.create();
            glMatrix.vec3.scale(scaledUp, self.up, velocity);
            glMatrix.vec3.add(self.position, self.position, scaledUp);
        }
        if (direction == "DOWN")
        {
            var scaledUp = glMatrix.vec3.create();
            glMatrix.vec3.scale(scaledUp, self.up, velocity);
            glMatrix.vec3.subtract(self.position, self.position, scaledUp);
        }
    }

    self.processMouseMovement = function (xoffset, yoffset, constrainPitch = true) {
        xoffset *= self.mouseSensitivity;
        yoffset *= self.mouseSensitivity;

        self.yaw += xoffset;
        self.pitch += yoffset;

        if (constrainPitch) {
            if (self.pitch > 89.0)
                self.pitch = 89.0;
            if (self.pitch < -89.0)
                self.pitch = -89.0;
        }

        updateCameraVectors();
    }

    self.processMouseScroll = function (yoffset) {
        if (self.zoom >= 1.0 && self.zoom <= 45.0)
            self.zoom -= yoffset;
        if (self.zoom <= 1.0)
            self.zoom = 1.0;
        if (self.zoom >= 45.0)
            self.zoom = 45.0;
    }

    self.events = function (eventHandler) {
        eventHandler.addEventCallback("keydown", function (event) {
            if(event.keyCode == 38) {
                self.processKeyboard("FORWARD");
            }
            if(event.keyCode == 40 ) {
                self.processKeyboard("BACKWARD");
            }
            if(event.keyCode == 37) {
                self.processKeyboard("LEFT");
            }
            if(event.keyCode == 39) {
                self.processKeyboard("RIGHT");
            }
            if(event.keyCode == 32) {
                self.processKeyboard("UP");
            }
            if(event.keyCode == 16) {
                self.processKeyboard("DOWN")
            }
        });

        var lastX = 0;
        var lastY = 0;
        var firstMouse = true;
        var xoffset = 0;
        var yoffset = 0;

        eventHandler.addEventCallback("mousemove", function (event) {
            if (firstMouse) {
                lastX = event.clientX;
                lastY = event.clientY;
                firstMouse = false;
            }

            xoffset = event.clientX - lastX;
            yoffset = lastY - event.clientY;
            lastX = event.clientX;
            lastY = event.clientY;

            self.processMouseMovement(xoffset, yoffset);
        });

        eventHandler.addEventCallback("mousewheel", function (event) {
            self.processMouseScroll(event.wheelDelta);
        });

        eventHandler.addEventCallback("mousedown", function (event) {
            firstMouse = true;
        });

        eventHandler.addEventCallback("mouseup", function (event) {
            firstMouse = true;
        });
    }

    function updateCameraVectors() {
        var front = [];
        front[0] = Math.cos(toRadian(self.yaw)) * Math.cos(toRadian(self.pitch));
        front[1] = Math.sin(toRadian(self.pitch));
        front[2] = Math.sin(toRadian(self.yaw)) * Math.cos(toRadian(self.pitch));
        glMatrix.vec3.normalize(self.front, front);

        glMatrix.vec3.cross(self.right, self.front, self.worldUp);
        glMatrix.vec3.normalize(self.right, self.right);

        glMatrix.vec3.cross(self.up, self.right, self.front);
        glMatrix.vec3.normalize(self.up, self.up);
    }

    self.init();
}

function RawModel(positions, positionLoc, normals = [], normalLoc = -1) {
    var self = this;

    self.init = function () {
        self.positions = positions;
        self.positionBuffer = new GLBuffer();
        self.positionBuffer.bind();
        self.positionBuffer.attachData(self.positions);
        
        // index, size, type, normalized, stride, offset
        gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLoc);
        
        self.positionBuffer.unbind();

        if (normals.length > 0 && normalLoc != -1) {
            self.normals = normals;
            self.normalBuffer = new GLBuffer();
            self.normalBuffer.bind();
            self.normalBuffer.attachData(self.normals);

            // index, size, type, normalized, stride, offset
            gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(normalLoc);

            self.normalBuffer.unbind();
        }

        self.modelMatrix = glMatrix.mat4.create();
        self.modelMatrix = glMatrix.mat4.identity(self.modelMatrix);

        self.position = [0, 0, -3];
        self.rotation = [0, 0, 0];
        self.scale = [1, 1, 1];

        self.updateModelMatrix();
    }
    
    self.translate = function (x, y, z) {
        self.position[0] += x;
        self.position[1] += y;
        self.position[2] += z;
        self.updateModelMatrix();
    }

    self.rotate = function (x, y, z) {
        self.rotation[0] += x;
        self.rotation[1] += y;
        self.rotation[2] += z;
        self.updateModelMatrix();
    }

    self.scale = function (x, y, z) {
        self.scale[0] += x;
        self.scale[1] += y;
        self.scale[2] += z;
        self.updateModelMatrix();
    }

    self.update = function () {
        self.positionBuffer.bind();
        self.updateModelMatrix();
    }

    self.updateModelMatrix = function () {
        self.modelMatrix = glMatrix.mat4.identity(self.modelMatrix);
        glMatrix.mat4.translate(self.modelMatrix, self.modelMatrix, self.position);
        glMatrix.mat4.rotateX(self.modelMatrix, self.modelMatrix, toRadian(self.rotation[0]));
        glMatrix.mat4.rotateY(self.modelMatrix, self.modelMatrix, toRadian(self.rotation[1]));
        glMatrix.mat4.rotateZ(self.modelMatrix, self.modelMatrix, toRadian(self.rotation[2]));
        glMatrix.mat4.scale(self.modelMatrix, self.modelMatrix, self.scale);
    }

    self.processKeyboard = function (direction) {
        if (direction == "FORWARD") {
            self.translate(0, 0, 0.5);
        }
        if (direction == "BACKWARD") {
            self.translate(0, 0, -0.5);
        }
        if (direction == "LEFT") {
            self.translate(-0.5, 0, 0);
        }
        if (direction == "RIGHT") {
            self.translate(0.5, 0, 0);
        }
    }

    self.events = function (eventHandler) {
        eventHandler.addEventCallback("keydown", function (event) {
            if(event.keyCode == 87) {
                self.processKeyboard("FORWARD");
            }
            if(event.keyCode == 83) {
                self.processKeyboard("BACKWARD");
            }
            if(event.keyCode == 65) {
                self.processKeyboard("LEFT");
            }
            if(event.keyCode == 68) {
                self.processKeyboard("RIGHT");
            }
        });
    }

    self.init();

}

function Grid() {
    var self = this;

    const SLICES = 100;

    function generateVertexData() {
        self.vertices = [];
        self.indices = [];

        for (let j = 0; j <= SLICES; j++) {
            for (let i = 0; i <= SLICES; i++) {
                var x = i / SLICES;
                var y = 0;
                var z = i / SLICES;
                self.vertices.push(glMatrix.vec3.fromValues(x, y, z));
            }
        }

        for (let j = 0; j < SLICES; j++) {
            for (let i = 0; i < SLICES; i++) {
                var row1 = j * (SLICES+1);
                var row2 = (j+1) * (SLICES + 1);

                self.indices.push(glMatrix.vec4.fromValues(row1+i, row1+i+1, row1+i+1, row2+i+1));
                self.indices.push(glMatrix.vec4.fromValues(row2+i+1, row2+i, row2+i, row1+i));
            }        
        }
    }

    self.init = function() {
        var vertexShader = new GLShader(gl.VERTEX_SHADER);
        vertexShader.attachSource(`
        attribute vec3 aPos;
        void main() {
            gl_Position = vec4(aPos, 1);
        }
        `);
        vertexShader.compile();

        var fragmentShader = new GLShader(gl.FRAGMENT_SHADER);
        fragmentShader.attachSource(`
        precision mediump float;
        void main() {
            gl_FragColor = vec4(1.0);
        }
        `);
        fragmentShader.compile();

        self.program = new GLProgram();
        self.program.attachShader(vertexShader.shaderID);
        self.program.attachShader(fragmentShader.shaderID);
        self.program.linkProgram();
        vertexShader.deleteShader();
        fragmentShader.deleteShader();

        self.program.use();

        generateVertexData();

        self.vbo = new GLBuffer(gl.ARRAY_BUFFER);
        self.vbo.bind();
        self.vbo.attachData(self.vertices);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        self.ibo = new GLBuffer(gl.ELEMENT_ARRAY_BUFFER);
        self.ibo.bind();
        self.ibo.attachData(self.indices);
    }

    self.drawGrid = function() {
        self.program.use();
        self.vbo.bind();
        self.ibo.bind();
        gl.drawElements(gl.LINES, self.indices.length * 3, gl.FLOAT, 0);
        self.ibo.unbind();
        self.vbo.unbind();
    }

    self.init();
}

function Scene() {
    var self = this;

    self.init = function () {
        var vertexShader = new GLShader(gl.VERTEX_SHADER);
        vertexShader.attachSource(`
        precision mediump float;

        attribute vec3 aPos;
        attribute vec3 aNormal;
        
        uniform mat4 model;
        uniform mat4 view;
        uniform mat4 projection;

        varying vec3 FragPos;
        varying vec3 Normal;
        
        void main() {
            FragPos = vec3(model * vec4(aPos, 1.0));
            Normal = aNormal;

            gl_Position = projection * view * vec4(FragPos, 1.0);
        }
        `);
        vertexShader.compile();

        var fragmentShader = new GLShader(gl.FRAGMENT_SHADER);
        fragmentShader.attachSource(`
        precision mediump float;
        
        varying vec3 FragPos;
        varying vec3 Normal;

        uniform vec3 material_color;
        uniform float material_shininess;

        uniform vec3 light_direction;
        
        uniform vec3 light_ambient;
        uniform vec3 light_diffuse;
        uniform vec3 light_specular;

        uniform vec3 viewPos;

        void main() {
            vec3 ambient = light_ambient * material_color;

            vec3 norm = normalize(Normal);
            vec3 lightDir = normalize(-light_direction);
            float diff = max(dot(norm, lightDir), 0.0);
            vec3 diffuse = light_diffuse * diff * material_color;

            vec3 viewDir = normalize(viewPos - FragPos);
            vec3 reflectDir = reflect(-lightDir, norm);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), material_shininess);
            vec3 specular = light_specular * spec * material_color;

            vec3 result = (ambient + diffuse + specular);
            gl_FragColor = vec4(result, 1.0);
        }
        `);
        fragmentShader.compile();

        self.program = new GLProgram();
        self.program.attachShader(vertexShader.shaderID);
        self.program.attachShader(fragmentShader.shaderID);
        self.program.linkProgram();
        vertexShader.deleteShader();
        fragmentShader.deleteShader();

        self.program.use();
        
        self.camera = new Camera();

        self.rawModel = new RawModel(
        new Float32Array([
            -0.5, -0.5, -0.5,
             0.5, -0.5, -0.5,
             0.5,  0.5, -0.5,
             0.5,  0.5, -0.5,
            -0.5,  0.5, -0.5,
            -0.5, -0.5, -0.5,

            -0.5, -0.5,  0.5,
             0.5, -0.5,  0.5,
             0.5,  0.5,  0.5,
             0.5,  0.5,  0.5,
            -0.5,  0.5,  0.5,
            -0.5, -0.5,  0.5,

            -0.5,  0.5,  0.5,
            -0.5,  0.5, -0.5,
            -0.5, -0.5, -0.5,
            -0.5, -0.5, -0.5,
            -0.5, -0.5,  0.5,
            -0.5,  0.5,  0.5,

             0.5,  0.5,  0.5,
             0.5,  0.5, -0.5,
             0.5, -0.5, -0.5,
             0.5, -0.5, -0.5,
             0.5, -0.5,  0.5,
             0.5,  0.5,  0.5,

            -0.5, -0.5, -0.5,
             0.5, -0.5, -0.5,
             0.5, -0.5,  0.5,
             0.5, -0.5,  0.5,
            -0.5, -0.5,  0.5,
            -0.5, -0.5, -0.5,

            -0.5,  0.5, -0.5,
             0.5,  0.5, -0.5,
             0.5,  0.5,  0.5,
             0.5,  0.5,  0.5,
            -0.5,  0.5,  0.5,
            -0.5,  0.5, -0.5
        ]),
        gl.getAttribLocation(self.program.programID, "aPos"),
        new Float32Array([
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,

            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
        
           -1.0,  0.0,  0.0,
           -1.0,  0.0,  0.0,
           -1.0,  0.0,  0.0,
           -1.0,  0.0,  0.0,
           -1.0,  0.0,  0.0,
           -1.0,  0.0,  0.0,
           
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,
           
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
           
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0
        ]),
        gl.getAttribLocation(self.program.programID, "aNormal"),
        );
    }

    function updateView() {
        var view = self.camera.getViewMatrix();
        var projection = glMatrix.mat4.create();
        glMatrix.mat4.perspective(projection, toRadian(self.camera.zoom), canvas.width / canvas.height, 0.1, 100.0);
        
        self.program.setMat4("view", view);
        self.program.setMat4("projection", projection);
    }

    self.update = function () {
        self.program.use();

        var viewPos = self.camera.position;

        self.program.setVec3("material_color", 1.0, 0.5, 0.31);

        self.program.setVec3("light_direction", -0.2, -1.0, -0.3);
        self.program.setVec3("viewPos", viewPos);

        self.program.setVec3("light_ambient", 0.2, 0.2, 0.2);
        self.program.setVec3("light_diffuse", 0.5, 0.5, 0.5);
        self.program.setVec3("light_specular", 1.0, 1.0, 1.0);

        self.program.setFloat("material_shininess", 32.0);

        updateView();
        self.program.setMat4("model", self.rawModel.modelMatrix);
    }

    self.init();
}

function Renderer(scene) {
    var self = this;
    
    self.init = function () {
        self.scene = scene;
        self.eventHandler = new EventHandler();
        // self.grid = new Grid();
    }

    self.update = function () {
        requestAnimationFrame(self.update);
        
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.clearColor(0.1, 0.1, 0.1, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        self.scene.update();
        self.scene.rawModel.update();
        gl.drawArrays(gl.TRIANGLES, 0, 36);

        // self.grid.drawGrid();
    }
    
    self.render = function () {
        self.scene.program.use();
        self.scene.camera.events(self.eventHandler);
        self.scene.rawModel.events(self.eventHandler);
        self.update();
    }

    self.init();
}

function Engine() {
    var self = this;
    
    self.loadScene = function (scene) {
        self.renderer = new Renderer(scene);
    }

    self.run = function () {
        self.renderer.render();
    }
}

function main() {
    var engine = new Engine();
    engine.loadScene(new Scene());
    engine.run();
}

main();
