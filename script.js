(() => {
    'use strict';
    const $ = id => document.getElementById(id);
    function updateDeviceType() {
        const mobile = navigator.userAgentData?.mobile === true
            || /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(navigator.userAgent)
            || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        document.body.classList.toggle('device-mobile', mobile);
        document.body.classList.toggle('device-desktop', !mobile);
    }
    updateDeviceType();
    addEventListener('resize', updateDeviceType);
    if (!window.THREE) { $('errorText').textContent = 'Não foi possível carregar Three.js da CDN. Esta versão precisa de internet na primeira abertura.'; $('menu').style.display = 'none'; $('error').style.display = 'flex'; return }
    // Inicializa a cena, a câmera e as luzes do vale.
    const THREE = window.THREE, host = $('game'), scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0d10); scene.fog = new THREE.FogExp2(0x0b0d10, .022);
    const camera = new THREE.PerspectiveCamera(56, innerWidth / innerHeight, .1, 180);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); renderer.setSize(innerWidth, innerHeight); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .82; host.appendChild(renderer.domElement);
    const hemi = new THREE.HemisphereLight(0x788897, 0x201916, .46); scene.add(hemi);
    const moon = new THREE.DirectionalLight(0xa6b1c0, .92); moon.position.set(-12, 20, 8); moon.castShadow = true; moon.shadow.mapSize.set(1024, 1024); moon.shadow.camera.left = -26; moon.shadow.camera.right = 26; moon.shadow.camera.top = 26; moon.shadow.camera.bottom = -26; moon.shadow.bias = -.0005; scene.add(moon);
    const fire = new THREE.PointLight(0xd16b3a, 2.65, 19, 2); fire.position.set(-5, 2, 5.5); scene.add(fire);
    const tealFill = new THREE.PointLight(0x79614b, .45, 20, 2); tealFill.position.set(13, 2.5, -11); scene.add(tealFill);
    const mat = (color, rough = .88, metal = 0) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
    // Desenha texturas de pedra, metal, tecido e couro em tempo de execução.
    function proceduralTexture(kind, base, accent, repeatX = 1, repeatY = 1) {
        const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
        const ctx = canvas.getContext('2d'); ctx.fillStyle = base; ctx.fillRect(0, 0, 256, 256);
        let state = kind.length * 173 + base.length * 97 + accent.length * 41;
        const rand = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296 };
        if (kind === 'ground' || kind === 'stone') {
            const rows = kind === 'ground' ? 8 : 5, cell = 256 / rows;
            for (let y = 0; y < rows; y++)for (let x = 0; x < rows; x++) {
                const px = x * cell + (y % 2 ? cell * .5 : 0), py = y * cell, w = cell * (.82 + rand() * .16), h = cell * (.78 + rand() * .15), shade = kind === 'ground' ? Math.floor(rand() * 13) - 6 : Math.floor(rand() * 26) - 13;
                const light = kind === 'ground' ? 56 : 66;
                ctx.fillStyle = `rgb(${Math.max(0, light + shade)},${Math.max(0, light - 5 + shade)},${Math.max(0, light - 10 + shade)})`;
                ctx.beginPath(); ctx.moveTo(px + 2 + rand() * 4, py + 2 + rand() * 4); ctx.lineTo(px + w * .52, py + rand() * 4); ctx.lineTo(px + w - 2, py + h * .38); ctx.lineTo(px + w * .78, py + h - 2); ctx.lineTo(px + w * .36, py + h - 1); ctx.lineTo(px + rand() * 4, py + h * .66); ctx.closePath(); ctx.fill();
                ctx.strokeStyle = kind === 'ground' ? 'rgba(8,7,7,.24)' : 'rgba(8,7,7,.62)'; ctx.lineWidth = kind === 'ground' ? 1 : 2; ctx.stroke();
                if (rand() > .36) { ctx.strokeStyle = 'rgba(125,103,84,.2)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px + cell * .2, py + cell * .25); ctx.lineTo(px + cell * (.35 + rand() * .3), py + cell * (.38 + rand() * .2)); ctx.lineTo(px + cell * (.4 + rand() * .3), py + cell * .8); ctx.stroke() }
            }
            for (let i = 0; i < (kind === 'ground' ? 72 : 38); i++) {
                const x = rand() * 256, y = rand() * 256, r = 1 + rand() * (kind === 'ground' ? 9 : 5);
                ctx.fillStyle = kind === 'ground'
                    ? (rand() > .5 ? 'rgba(89,91,60,.13)' : 'rgba(9,8,7,.16)')
                    : (rand() > .5 ? 'rgba(145,126,101,.12)' : 'rgba(8,7,6,.22)');
                ctx.beginPath(); ctx.ellipse(x, y, r, r * (.35 + rand() * .45), rand(), 0, Math.PI * 2); ctx.fill();
            }
            ctx.strokeStyle = accent + '55'; ctx.lineWidth = 1;
            for (let i = 0; i < 32; i++) { const x = rand() * 256, y = rand() * 256; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 2 + rand() * 8, y + 1 + rand() * 5); ctx.stroke() }
        }
        if (kind === 'metal') {
            const gradient = ctx.createLinearGradient(0, 0, 256, 256); gradient.addColorStop(0, '#383a3d'); gradient.addColorStop(.48, '#68635c'); gradient.addColorStop(1, '#282a2d'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 256, 256);
            for (let i = 0; i < 190; i++) { const x = rand() * 256, y = rand() * 256; ctx.strokeStyle = rand() > .5 ? 'rgba(190,185,173,.16)' : 'rgba(5,6,8,.35)'; ctx.lineWidth = .5 + rand() * 1.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (rand() - .5) * 24, y + (rand() - .5) * 4); ctx.stroke() }
            for (let i = 0; i < 20; i++) { const x = rand() * 256, y = rand() * 256; ctx.fillStyle = 'rgba(9,8,7,.24)'; ctx.beginPath(); ctx.ellipse(x, y, 2 + rand() * 7, 1 + rand() * 3, rand(), 0, Math.PI * 2); ctx.fill() }
            for (let i = 0; i < 26; i++) { const x = rand() * 256, y = rand() * 256; ctx.strokeStyle = rand() > .5 ? 'rgba(176,106,65,.2)' : 'rgba(219,207,181,.16)'; ctx.lineWidth = .6 + rand(); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (rand() - .5) * 17, y + (rand() - .5) * 8); ctx.stroke() }
        }
        if (kind === 'cloth') {
            ctx.fillStyle = '#2a1c1e'; ctx.fillRect(0, 0, 256, 256);
            for (let i = 0; i < 256; i += 4) { ctx.fillStyle = i % 8 ? 'rgba(136,103,83,.06)' : 'rgba(0,0,0,.22)'; ctx.fillRect(i, 0, 1, 256); ctx.fillRect(0, i, 256, 1) }
            for (let i = 0; i < 16; i++) { const x = rand() * 256, y = rand() * 256; ctx.strokeStyle = 'rgba(7,6,7,.48)'; ctx.lineWidth = 1 + rand() * 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (rand() - .5) * 12, y + 8 + rand() * 24); ctx.stroke() }
            ctx.strokeStyle = 'rgba(164,117,78,.32)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(20, 25); ctx.lineTo(32, 118); ctx.lineTo(22, 210); ctx.stroke();
            ctx.strokeStyle = accent + '88'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(128, 58); ctx.lineTo(128, 185); ctx.moveTo(101, 94); ctx.lineTo(155, 94); ctx.moveTo(110, 155); ctx.lineTo(146, 155); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(128, 42); ctx.lineTo(114, 66); ctx.lineTo(142, 66); ctx.closePath(); ctx.stroke();
        }
        if (kind === 'leather') {
            ctx.fillStyle = '#30251f'; ctx.fillRect(0, 0, 256, 256);
            for (let i = 0; i < 700; i++) { const x = rand() * 256, y = rand() * 256, r = .4 + rand() * 2.2; ctx.fillStyle = rand() > .5 ? 'rgba(170,134,93,.12)' : 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill() }
            for (let y = 24; y < 256; y += 48) { ctx.fillStyle = 'rgba(0,0,0,.42)'; ctx.fillRect(0, y, 256, 3); for (let x = 12; x < 256; x += 24) { ctx.fillStyle = 'rgba(180,147,104,.28)'; ctx.fillRect(x, y - 5, 2, 2) } }
        }
        const texture = new THREE.CanvasTexture(canvas); texture.encoding = THREE.sRGBEncoding; texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(repeatX, repeatY); texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy()); return texture;
    }
    const mats = {
        ground: new THREE.MeshStandardMaterial({ color: 0xffffff, map: proceduralTexture('ground', '#211d1a', '#494139', 6, 6), roughness: 1 }),
        stone: new THREE.MeshStandardMaterial({ color: 0xcac1b6, map: proceduralTexture('stone', '#35312d', '#5a5148', 1, 1), roughness: .96 }),
        darkStone: new THREE.MeshStandardMaterial({ color: 0xb1aaa0, map: proceduralTexture('stone', '#222223', '#373431', 1, 1), roughness: .98 }),
        metal: new THREE.MeshStandardMaterial({ color: 0xa8a7a5, map: proceduralTexture('metal', '#51545a', '#96918a', 1, 1), roughness: .72, metalness: .34 }),
        gold: new THREE.MeshStandardMaterial({ color: 0x9a8b75, map: proceduralTexture('metal', '#65543d', '#a78b63', 1, 1), roughness: .78, metalness: .22 }),
        cloth: new THREE.MeshStandardMaterial({ color: 0x8b7b76, map: proceduralTexture('cloth', '#2a1c1e', '#68413b', 1, 1), roughness: 1 }),
        leather: new THREE.MeshStandardMaterial({ color: 0x9a8873, map: proceduralTexture('leather', '#30251f', '#715b42', 1, 1), roughness: .94 }),
        red: new THREE.MeshStandardMaterial({ color: 0x806d68, map: proceduralTexture('cloth', '#351b1d', '#75423a', 1, 1), roughness: 1 }),
        enemy: new THREE.MeshStandardMaterial({ color: 0x85817d, map: proceduralTexture('metal', '#343236', '#615a52', 1, 1), roughness: .82, metalness: .2 }),
        eye: new THREE.MeshStandardMaterial({ color: 0xd6814c, emissive: 0x7d2814, emissiveIntensity: .8, roughness: .38 }),
        ember: new THREE.MeshStandardMaterial({ color: 0xb8683c, emissive: 0x61220f, emissiveIntensity: .42, roughness: .62 }),
        cyan: new THREE.MeshStandardMaterial({ color: 0x3d3430, emissive: 0x3d130e, emissiveIntensity: .45, roughness: .55 }),
        violet: new THREE.MeshStandardMaterial({ color: 0x282426, emissive: 0x321613, emissiveIntensity: .55, roughness: .62 }),
        teal: mat(0x35302b, .7, .08), banner: new THREE.MeshStandardMaterial({ color: 0x80706b, map: proceduralTexture('cloth', '#351b1d', '#75423a', 1, 1), roughness: 1 })
    };
    for (const material of [mats.ground, mats.stone, mats.darkStone, mats.metal, mats.gold, mats.cloth, mats.leather, mats.red, mats.enemy, mats.banner]) {
        material.bumpMap = material.map; material.bumpScale = material === mats.ground ? .006 : .028;
    }
    function box(parent, geoMaterial, pos, scale, cast = true, receive = true) { const m = new THREE.Mesh(new THREE.BoxGeometry(...scale), geoMaterial); m.position.set(...pos); m.castShadow = cast; m.receiveShadow = receive; parent.add(m); return m }
    function cylinder(parent, geoMaterial, pos, r1, r2, height, segments = 8) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, height, segments), geoMaterial); m.position.set(...pos); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m }
    function makeSword(parent, scale = 1) {
        const sword = new THREE.Group(); parent.add(sword); sword.scale.setScalar(scale);
        box(sword, mats.leather, [0, 0, .2], [.14, .14, .48]);
        cylinder(sword, mats.gold, [0, 0, -.08], .12, .12, .1, 8);
        box(sword, mats.gold, [0, 0, .48], [.64, .13, .14]);
        box(sword, mats.metal, [0, 0, 1.13], [.34, .075, 1.18]);
        box(sword, mats.gold, [0, .047, 1.12], [.045, .012, .92], false);
        const point = new THREE.Mesh(new THREE.ConeGeometry(.18, .38, 4), mats.metal); point.rotation.x = Math.PI / 2; point.position.set(0, 0, 1.91); point.castShadow = true; sword.add(point);
        return sword;
    }
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), mats.ground); ground.rotation.x = -Math.PI / 2; ground.position.y = -.12; ground.receiveShadow = true; scene.add(ground);
    const grid = new THREE.GridHelper(118, 59, 0x342c28, 0x292522); grid.position.y = -.105; grid.material.transparent = true; grid.material.opacity = .055; scene.add(grid);
    // Espalha pedras decorativas ao redor da arena.
    let seed = 79; const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 };
    const cameraBlockers = [];
    const stonePalette = [0x8a8278, 0x73706c, 0x999083, 0x706b66, 0x62615e].map(color => new THREE.MeshStandardMaterial({ color, map: mats.stone.map, bumpMap: mats.stone.map, bumpScale: .028, roughness: .96 }));
    for (let i = 0; i < 115; i++) { const x = (random() - .5) * 68, z = (random() - .5) * 68; if (Math.hypot(x, z) < 8) continue; const s = .4 + random() * 1.8, p = box(scene, stonePalette[Math.floor(random() * stonePalette.length)], [x, -.01 + random() * .08, z], [s, .08 + random() * .12, s * (.6 + random())], false, true); p.rotation.y = random() * Math.PI; p.rotation.x = (random() - .5) * .05 }
    const arenaRadius = 24.5, arenaBoundaryRadius = arenaRadius - 1.2;
    const pillars = [];
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, r = arenaRadius + (i % 3) * 1.3, x = Math.cos(a) * r, z = Math.sin(a) * r; const p = new THREE.Group(); p.position.set(x, 0, z); cylinder(p, mats.darkStone, [0, 1.4, 0], .72, .92, 2.8, 7); cylinder(p, mats.stone, [0, 2.7, 0], 1.05, 1, .32, 7); cylinder(p, mats.gold, [0, .12, 0], 1, .92, .22, 7); scene.add(p); cameraBlockers.push(p); pillars.push({ x, z, r: .95 }) }
    // Monta o arco destruído ao fundo da arena.
    for (const x of [-7, 7]) { cameraBlockers.push(box(scene, mats.darkStone, [x, 3, -23], [1.2, 6, 1.4])); cameraBlockers.push(box(scene, mats.stone, [x, 5.9, -23], [2, 1, 1.8])) }
    cameraBlockers.push(box(scene, mats.darkStone, [0, 8, -23], [15, 1.3, 1.8])); cameraBlockers.push(box(scene, mats.gold, [0, 8.75, -23], [15, .13, 1.8], false));
    const banners = [];
    for (const x of [-5.2, 5.2]) {
        const cloth = box(scene, mats.banner, [x, 4.4, -22.05], [1.45, 2.7, .12], false);
        cloth.geometry.translate(0, -.55, 0);
        const emblem = box(scene, mats.gold, [x, 4.35, -21.96], [.18, .75, .035], false);
        banners.push({ cloth, emblem, phase: random() * Math.PI * 2 });
    }
    const arenaRune = new THREE.Mesh(new THREE.RingGeometry(5.2, 5.34, 96), new THREE.MeshBasicMaterial({ color: 0x71372b, transparent: true, opacity: .24, side: THREE.DoubleSide }));
    arenaRune.rotation.x = -Math.PI / 2; arenaRune.position.y = -.065; scene.add(arenaRune);
    const runeMarks = [];
    for (let i = 0; i < 8; i++) { const mark = new THREE.Mesh(new THREE.BoxGeometry(.13, .018, .8), new THREE.MeshBasicMaterial({ color: i % 2 ? 0x896843 : 0x743c30, transparent: true, opacity: .48 })); const a = i / 8 * Math.PI * 2; mark.position.set(Math.cos(a) * 5.27, -.052, Math.sin(a) * 5.27); mark.rotation.y = -a; scene.add(mark); runeMarks.push(mark) }
    const crystals = [];
    for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2, r = 35 + (i % 3) * 1.2, x = Math.cos(a) * r, z = Math.sin(a) * r;
        const group = new THREE.Group(); group.position.set(x, 0, z);
        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(.8 + (i % 3) * .18, 0), i % 2 ? mats.cyan : mats.violet); crystal.position.y = .95; crystal.scale.set(.72, 1.7, .72); crystal.rotation.y = a; crystal.castShadow = true; group.add(crystal);
        const base = cylinder(group, mats.darkStone, [0, .12, 0], .72, .88, .25, 6);
        const glint = new THREE.Mesh(new THREE.OctahedronGeometry(.28, 0), mats.gold); glint.position.set(.35, .52, 0); group.add(glint);
        scene.add(group); crystals.push({ group, crystal, phase: random() * Math.PI * 2, base });
    }
    const graveMarkers = [];
    for (let i = 0; i < 7; i++) {
        const a = i / 7 * Math.PI * 2, r = 41 + (i % 2) * 2, x = Math.cos(a) * r, z = Math.sin(a) * r;
        const marker = new THREE.Group(); marker.position.set(x, 0, z); marker.rotation.y = -a;
        box(marker, mats.darkStone, [0, .68, 0], [.82, 1.36, .32]);
        cylinder(marker, mats.stone, [0, 1.43, 0], .43, .43, .3, 6);
        box(marker, mats.gold, [0, .72, .18], [.52, .055, .025], false, false);
        scene.add(marker); cameraBlockers.push(marker); graveMarkers.push({ marker, phase: random() * Math.PI * 2 });
    }
    // Cria o braseiro e a luz quente ao redor dele.
    const bowl = cylinder(scene, mats.darkStone, [-5, .9, 5.5], .85, .56, .7, 8); cylinder(scene, mats.gold, [-5, 1.3, 5.5], .72, .68, .12, 8);
    const flame = new THREE.Mesh(new THREE.IcosahedronGeometry(.45, 1), mats.ember); flame.position.set(-5, 1.9, 5.5); flame.scale.set(.7, 1.25, .7); scene.add(flame);
    const embers = [];
    for (let i = 0; i < 34; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.035 + random() * .045, 5, 4), mats.ember); scene.add(m); embers.push({ mesh: m, a: random() * Math.PI * 2, r: .2 + random() * .9, h: random() * 3, s: .35 + random() * .75 }) }
    // Monta o cavaleiro azul jogável e equipa a espada e o escudo do modelo original.
    function makeHero() {
        const root = new THREE.Group(), visual = new THREE.Group(); root.add(visual); scene.add(root);
        const group = (parent, x = 0, y = 0, z = 0) => { const item = new THREE.Group(); item.position.set(x, y, z); parent.add(item); return item };
        const steel = new THREE.MeshStandardMaterial({ color: 0x8a929e, metalness: .7, roughness: .3 });
        const darkSteel = new THREE.MeshStandardMaterial({ color: 0x2d3138, metalness: .6, roughness: .4 });
        const tunic = new THREE.MeshStandardMaterial({ color: 0x1a1c20, roughness: .85 });
        const leather = new THREE.MeshStandardMaterial({ color: 0x5a3b22, roughness: .85 });
        const capeMaterial = new THREE.MeshStandardMaterial({ color: 0x2e1e18, roughness: .9, side: THREE.DoubleSide });
        const bladeMaterial = new THREE.MeshStandardMaterial({ color: 0xd4e2ed, metalness: .95, roughness: .15 });
        const blueGem = new THREE.MeshStandardMaterial({ color: 0x2563eb, emissive: 0x1d4ed8, emissiveIntensity: 1.3, metalness: .3, roughness: .2 });
        const blueMosaic = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, emissive: 0x1e40af, emissiveIntensity: .65, metalness: .4, roughness: .3 });
        const hips = group(visual, 0, .96, 0);
        box(hips, darkSteel, [0, 0, 0], [.38, .24, .26]);
        for (const side of [-1, 1]) {
            const fauld = box(hips, steel, [side * .14, -.06, .13], [.16, .22, .04]);
            fauld.rotation.y = side * .1;
        }
        cylinder(hips, leather, [0, .08, 0], .205, .205, .08, 16);
        const torso = group(hips, 0, .1, 0);
        cylinder(torso, darkSteel, [0, .3, 0], .24, .18, .56, 12).scale.set(1.25, 1, .85);
        box(torso, darkSteel, [0, .32, .03], [.38, .44, .22]);
        const breastplate = box(torso, steel, [0, .34, .14], [.32, .36, .06]);
        breastplate.rotation.x = -.08;
        const head = group(torso, 0, .61, 0);
        cylinder(head, steel, [0, .06, 0], .135, .135, .14, 16);
        const helmDome = new THREE.Mesh(new THREE.SphereGeometry(.135, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), steel);
        helmDome.position.set(0, .13, 0); helmDome.scale.set(1.02, .88, 1.02); head.add(helmDome);
        for (const side of [-1, 1]) {
            box(head, blueGem, [side * .038, .09, .122], [.014, .06, .03]);
            const crestCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(side * .06, .22, 0), new THREE.Vector3(side * .1, .3, .01),
                new THREE.Vector3(side * .15, .39, -.01), new THREE.Vector3(side * .09, .47, -.02)
            ]);
            head.add(new THREE.Mesh(new THREE.TubeGeometry(crestCurve, 14, .009, 8, false), steel));
        }
        const cape = group(torso, 0, .54, -.12);
        const capeCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -.35, -.08),
            new THREE.Vector3(0, -.75, -.18), new THREE.Vector3(0, -1, -.24)
        ]);
        const capeMesh = new THREE.Mesh(new THREE.TubeGeometry(capeCurve, 16, .28, 12, false), capeMaterial);
        capeMesh.scale.set(1.4, 1, .15); cape.add(capeMesh);
        const arm = side => {
            const shoulder = group(torso, side * .27, .52, 0);
            cylinder(shoulder, steel, [side * .02, .06, 0], .12, .09, .12, 10).scale.set(1.3, 1, 1.1);
            cylinder(shoulder, darkSteel, [side * .03, .01, 0], .1, .085, .1, 10).scale.x = 1.2;
            box(shoulder, tunic, [0, -.17, 0], [.11, .24, .11]);
            const elbow = group(shoulder, 0, -.31, 0);
            box(elbow, steel, [0, 0, 0], [.12, .12, .12]);
            box(elbow, steel, [0, -.16, 0], [.12, .26, .12]);
            const hand = group(elbow, 0, -.3, 0);
            box(hand, darkSteel, [0, 0, 0], [.13, .13, .13]);
            box(hand, steel, [0, .04, 0], [.14, .05, .14]);
            return { shoulder, elbow, hand };
        };
        const rightArm = arm(1), leftArm = arm(-1), legs = [];
        for (const x of [-.11, .11]) {
            const thigh = group(hips, x, -.05, 0);
            box(thigh, tunic, [0, -.23, 0], [.18, .46, .19]);
            box(thigh, steel, [0, -.2, .1], [.16, .32, .06]);
            const knee = group(thigh, 0, -.45, 0);
            box(knee, steel, [0, 0, .06], [.16, .14, .12]);
            box(knee, steel, [0, -.23, 0], [.15, .46, .15]);
            box(knee, darkSteel, [0, -.23, .08], [.06, .42, .04]);
            const foot = group(knee, 0, -.45, 0);
            box(foot, leather, [0, -.03, .07], [.12, .09, .3]);
            box(foot, steel, [0, -.01, .08], [.13, .05, .22]);
            thigh.userData.legSide = x;
            thigh.userData.knee = knee;
            legs.push(thigh);
        }
        const createSword = () => {
            const sword = new THREE.Group();
            cylinder(sword, darkSteel, [0, .14, 0], .022, .022, .28, 20);
            for (let ring = 0; ring < 4; ring++) cylinder(sword, leather, [0, .06 + ring * .05, 0], .024, .024, .015, 16);
            const pommel = group(sword, 0, .28, 0);
            const pommelRing = new THREE.Mesh(new THREE.TorusGeometry(.045, .012, 10, 20), steel);
            pommelRing.rotation.x = Math.PI / 2; pommel.add(pommelRing);
            const gem = new THREE.Mesh(new THREE.SphereGeometry(.032, 10, 8), blueGem);
            gem.scale.set(1, .4, 1); pommel.add(gem);
            const guard = cylinder(sword, steel, [0, .02, 0], .038, .038, .48, 20);
            guard.rotation.z = Math.PI / 2; guard.scale.set(1.2, 1, .6);
            cylinder(sword, bladeMaterial, [0, -.48, 0], .068, .058, .9, 24).scale.set(1, 1, .32);
            const mosaic = cylinder(sword, blueMosaic, [0, -.26, 0], .062, .035, .32, 20);
            mosaic.scale.set(.9, 1, .34);
            for (let i = 0; i < 3; i++) {
                const inset = new THREE.Mesh(new THREE.SphereGeometry(.018 - i * .003, 8, 6), blueGem);
                inset.position.set(0, .08 - i * .07, .012); inset.scale.z = .5; sword.add(inset);
            }
            return sword;
        };
        const createShield = () => {
            const shield = new THREE.Group();
            const wood = cylinder(shield, leather, [0, 0, 0], .38, .38, .04, 24);
            wood.rotation.x = Math.PI / 2;
            shield.add(new THREE.Mesh(new THREE.TorusGeometry(.38, .025, 8, 24), steel));
            const bossGem = new THREE.Mesh(new THREE.SphereGeometry(.09, 10, 8), blueGem);
            bossGem.position.z = .025; shield.add(bossGem);
            return shield;
        };
        const waistSword = createSword();
        waistSword.position.set(.24, -.05, .05); waistSword.rotation.set(-Math.PI / 12, -Math.PI / 2, -Math.PI / 2.8);
        hips.add(waistSword);
        const sword = createSword();
        sword.position.set(0, -.1, .15); sword.rotation.set(Math.PI / 2, Math.PI, Math.PI);
        rightArm.hand.add(sword);
        const backShield = createShield();
        backShield.position.set(0, .35, -.22); backShield.rotation.y = Math.PI; torso.add(backShield);
        const handShield = createShield();
        handShield.position.set(-.14, -.1, .06); handShield.rotation.y = Math.PI / 2; leftArm.hand.add(handShield);
        rightArm.shoulder.rotation.set(-.2, 0, .2); rightArm.elbow.rotation.x = -.8;
        leftArm.shoulder.rotation.set(-.3, 0, -.2); leftArm.elbow.rotation.x = -.6;
        waistSword.visible = false; backShield.visible = true; handShield.visible = false;
        return {
            root, visual, torso, pivot: rightArm.shoulder, rightElbow: rightArm.elbow,
            leftArm, sword, waistSword, backShield, handShield, legs, cape, head,
            weaponDrawn: true, shieldDrawn: false, equipmentAction: null, guardImpact: 0
        };
    }
    const hero = makeHero(); hero.root.position.set(0, 0, 49);
    const worldColliders = [];
    const pathStones = [];
    function buildRuinHouse(x, z, rotation = 0) {
        const house = new THREE.Group();
        house.position.set(x, 0, z);
        house.rotation.y = rotation;
        const wall = mats.stone, brokenWall = mats.darkStone;
        box(house, wall, [-2.35, 1.15, 0], [.45, 2.3, 4.4]);
        box(house, wall, [2.35, .9, -.25], [.45, 1.8, 3.9]);
        box(house, brokenWall, [0, 1.1, -2.05], [4.6, 2.2, .4]);
        box(house, brokenWall, [-1.6, 1.05, 2.05], [1.35, 2.1, .4]);
        box(house, brokenWall, [1.6, 1.05, 2.05], [1.35, 2.1, .4]);
        box(house, wall, [0, 2.25, 2.05], [2, .38, .48]);
        const roofLeft = box(house, mats.leather, [-1.15, 2.75, 0], [2.9, .25, 4.8]);
        const roofRight = box(house, mats.leather, [1.15, 2.75, 0], [2.9, .25, 4.8]);
        roofLeft.rotation.z = -.43;
        roofRight.rotation.z = .43;
        box(house, mats.darkStone, [-2.2, .22, 0], [1.05, .3, 4.5]);
        scene.add(house);
        worldColliders.push({ x, z, radius: 3.05 });
    }
    function plantDeadTree(x, z, height = 5) {
        const trunk = cylinder(scene, mats.darkStone, [x, height * .42, z], .3, .48, height * .84, 6);
        trunk.rotation.z = .1;
        for (const [side, y, branchLength] of [[-1, height * .52, 1.5], [1, height * .68, 1.25], [-1, height * .82, .9]]) {
            const branch = cylinder(scene, mats.darkStone, [x + side * branchLength * .32, y, z], .11, .2, branchLength, 5);
            branch.rotation.z = side * -.72;
        }
        worldColliders.push({ x, z, radius: .75 });
    }
    for (let i = 0; i < 22; i++) {
        const z = 50 - i * 2.2, x = Math.sin(i * .38) * 1.2;
        const stone = box(scene, i % 4 === 0 ? mats.darkStone : mats.stone, [x, -.015, z], [3.8, .075, 2.1], false);
        stone.rotation.y = Math.sin(i * .57) * .08;
        pathStones.push(stone);
    }
    buildRuinHouse(-9, 47, .12);
    buildRuinHouse(9, 43, -.17);
    for (const [x, z, height] of [[-13, 42, 5.3], [13, 48, 5.8], [-12, 32, 4.8], [12, 29, 5.4], [-10, 20, 6], [11, 18, 5.1], [-9, 11, 4.7], [10, 9, 5.8]]) plantDeadTree(x, z, height);
    const routeCamp = new THREE.Group();
    routeCamp.position.set(4, 0, 34);
    cylinder(routeCamp, mats.darkStone, [0, .38, 0], 1.08, .86, .52, 8);
    cylinder(routeCamp, mats.gold, [0, .68, 0], .86, .78, .12, 8);
    const routeCampFlame = new THREE.Mesh(new THREE.IcosahedronGeometry(.42, 1), mats.ember);
    routeCampFlame.position.y = 1.22;
    routeCampFlame.scale.set(.7, 1.3, .7);
    routeCamp.add(routeCampFlame);
    scene.add(routeCamp);
    const routeCampLight = new THREE.PointLight(0xe08743, 2.1, 13, 2);
    routeCampLight.position.set(4, 2, 34);
    scene.add(routeCampLight);
    const routeEmbers = [];
    for (let i = 0; i < 12; i++) {
        const ember = new THREE.Mesh(new THREE.SphereGeometry(.035, 5, 4), mats.ember);
        scene.add(ember);
        routeEmbers.push({ mesh: ember, angle: random() * Math.PI * 2, height: random() * 2.1, radius: .3 + random() * .8 });
    }
    // Monta o dragão, seus efeitos e os indicadores de ataque.
    function makeBoss() {
        const root = new THREE.Group(), v = new THREE.Group(); root.add(v); scene.add(root);
        const dragonMat = new THREE.MeshStandardMaterial({ color: 0x80695b, metalness: .12, roughness: .88, flatShading: true });
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x59463d, metalness: .1, roughness: .92, flatShading: true });
        const boneMat = new THREE.MeshStandardMaterial({ color: 0xc9baa1, roughness: .76, flatShading: true });
        const bellyMat = new THREE.MeshStandardMaterial({ color: 0xb9a58b, roughness: .82, flatShading: true });
        const wingMat = new THREE.MeshStandardMaterial({ color: 0x493126, side: THREE.DoubleSide, roughness: .95, flatShading: true });
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0xff4131, emissive: 0x9b160b, emissiveIntensity: 1.8, roughness: .4 });
        const c8 = (p, rt, rb, h, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 8), m); o.position.set(x, y, z); o.castShadow = true; p.add(o); return o };
        const s8 = (p, r, m, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => { const o = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.castShadow = true; p.add(o); return o };
        const cone = (p, r, h, m, x, y, z, rx = 0, rz = 0) => { const o = new THREE.Mesh(new THREE.ConeGeometry(r, h, 8), m); o.position.set(x, y, z); o.rotation.set(rx, 0, rz); o.castShadow = true; p.add(o); return o };
        const boxPart = (p, w, h, d, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = true; p.add(o); return o };
        const group = (p, x = 0, y = 0, z = 0) => { const o = new THREE.Group(); o.position.set(x, y, z); p.add(o); return o };
        const bone = (p, a, b, r, m) => { const d = new THREE.Vector3().subVectors(b, a), o = new THREE.Mesh(new THREE.CylinderGeometry(r * .6, r, d.length(), 8), m); o.position.copy(a).addScaledVector(d, .5); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); o.castShadow = true; p.add(o) };

        s8(v, 1.1, dragonMat, 0, 1.8, 0, .95, .9, 1.75);
        for (let i = 0; i < 7; i++) boxPart(v, .85 - Math.abs(i - 3) * .08, .12, .28, bellyMat, 0, 1.05 - i * .02, 1.1 - i * .35);
        const neck = [], tail = [], neckCount = 7, tailCount = 16;
        for (let i = 0; i < neckCount; i++) { const segment = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), dragonMat); v.add(segment); neck.push(segment); cone(segment, .3, .8, boneMat, 0, .9, -.3, -.5) }
        for (let i = 0; i < tailCount; i++) { const segment = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), i % 2 ? dragonMat : darkMat); v.add(segment); tail.push(segment); if (i % 2 === 0) cone(segment, .25, .7, boneMat, 0, .9, 0) }
        for (let i = 0; i < 6; i++) cone(v, .2, .7, boneMat, 0, 2.7, 1.2 - i * .48);
        const head = group(v), jaw = group(head, 0, -.28, .1);
        boxPart(head, .85, .58, 1.1, dragonMat, 0, .05, 0);
        boxPart(head, .52, .35, 1.1, dragonMat, 0, -.02, .8);
        boxPart(head, .3, .2, .5, darkMat, 0, .12, 1.05);
        boxPart(jaw, .5, .15, 1.3, darkMat, 0, -.02, .7);
        for (const side of [-1, 1]) {
            cone(head, .16, 1.8, boneMat, side * .34, .55, -.5, -1.2, side * .25);
            boxPart(head, .12, .1, .1, eyeMat, side * .44, .16, .35);
            boxPart(head, .2, .08, .3, darkMat, side * .38, .24, .35);
            cone(head, .04, .18, darkMat, side * .15, .12, 1.3, Math.PI / 2);
        }
        for (const tooth of [{ x: -.2, z: 1.28, r: .05, h: .22 }, { x: .2, z: 1.28, r: .05, h: .22 }, { x: -.22, z: 1.05, r: .04, h: .18 }, { x: .22, z: 1.05, r: .04, h: .18 }, { x: 0, z: 1.3, r: .035, h: .15 }]) cone(head, tooth.r, tooth.h, boneMat, tooth.x, -.18, tooth.z, Math.PI);
        const hindLegs = [];
        for (const [x, z] of [[-.52, -.6], [.52, -.6]]) {
            const hip = group(v, x, 1.3, z), side = Math.sign(x);
            c8(hip, .24, .16, .75, dragonMat, 0, -.35, 0);
            const knee = group(hip, 0, -.7, 0); s8(knee, .16, darkMat); c8(knee, .14, .1, .65, dragonMat, 0, -.3, 0);
            const foot = group(knee, 0, -.6, 0); boxPart(foot, .35, .16, .58, darkMat, 0, -.05, .15);
            for (let claw = -1; claw <= 1; claw++) cone(foot, .07, .3, boneMat, claw * .12, -.1, .4, 1.57);
            hip.rotation.z = side * .15; knee.rotation.z = -side * .15; hindLegs.push({ hip, knee });
        }
        const arms = [];
        for (const x of [-.52, .52]) { const shoulder = group(v, x, 1.3, .85); c8(shoulder, .22, .14, .7, dragonMat, 0, -.35, 0); const elbow = group(shoulder, 0, -.7, 0); s8(elbow, .15, darkMat); c8(elbow, .13, .1, .6, dragonMat, 0, -.3, 0); arms.push(shoulder) }
        function makeWing(side) {
            const wing = new THREE.Group(), base = new THREE.Vector3(0, 0, 0), elbow = new THREE.Vector3(2.2, 1.6, -.4), tip = new THREE.Vector3(5.8, 3.4, -1.2), f1 = new THREE.Vector3(5.4, 1.2, -2.4), f2 = new THREE.Vector3(4.2, -.6, -3.2), f3 = new THREE.Vector3(2, -1.2, -2.8), end = new THREE.Vector3(.5, -.5, -2);
            const membrane = new THREE.BufferGeometry().setFromPoints([base, elbow, tip, elbow, tip, f1, elbow, f1, f2, elbow, f2, f3, base, elbow, f3, base, f3, end]); membrane.computeVertexNormals(); wing.add(new THREE.Mesh(membrane, wingMat));
            bone(wing, base, elbow, .16, darkMat); bone(wing, elbow, tip, .12, darkMat); bone(wing, tip, f1, .06, darkMat); bone(wing, elbow, f2, .05, darkMat); bone(wing, elbow, f3, .05, darkMat);
            cone(wing, .08, .35, boneMat, tip.x, tip.y, tip.z, -.5); wing.scale.x = side; v.add(wing); return wing;
        }
        const wings = [makeWing(-1), makeWing(1)];
        const throat = new THREE.PointLight(0xff5500, 0, 7, 2); throat.position.set(0, -.1, .5); head.add(throat);
        const fireGeometry = new THREE.DodecahedronGeometry(1, 1);
        const fireMaterials = [
            new THREE.MeshBasicMaterial({ color: 0xffe6a0, transparent: true, opacity: .95 }),
            new THREE.MeshStandardMaterial({ color: 0xff5500, emissive: 0xff2200, emissiveIntensity: 2, transparent: true, opacity: .85 }),
            new THREE.MeshStandardMaterial({ color: 0xff1100, emissive: 0x880000, emissiveIntensity: 1.2, transparent: true, opacity: .6 })
        ];
        const fireWarning = new THREE.Mesh(new THREE.RingGeometry(.5, 9, 32, 1, -Math.PI / 2 - Math.PI / 5, Math.PI * 2 / 5), new THREE.MeshBasicMaterial({ color: 0xff3d1f, transparent: true, opacity: .7, side: THREE.DoubleSide, depthWrite: false }));
        fireWarning.rotation.x = -Math.PI / 2; fireWarning.position.set(0, .035, .25); fireWarning.visible = false; root.add(fireWarning);
        const flightFireWarning = new THREE.Mesh(new THREE.RingGeometry(1.9, 2.2, 40), new THREE.MeshBasicMaterial({ color: 0xff5a25, transparent: true, opacity: .65, side: THREE.DoubleSide, depthWrite: false }));
        flightFireWarning.rotation.x = -Math.PI / 2; flightFireWarning.position.y = .045; flightFireWarning.visible = false; scene.add(flightFireWarning);
        const infernoWarning = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshBasicMaterial({ color: 0xe63218, transparent: true, opacity: .1, side: THREE.DoubleSide, depthWrite: false }));
        infernoWarning.rotation.x = -Math.PI / 2; infernoWarning.position.y = .025; infernoWarning.visible = false; scene.add(infernoWarning);
        const infernoSafeSpot = new THREE.Group();
        const safeSpotFill = new THREE.Mesh(new THREE.CircleGeometry(2.25, 48), new THREE.MeshBasicMaterial({ color: 0x3da987, transparent: true, opacity: .22, side: THREE.DoubleSide, depthWrite: false }));
        safeSpotFill.rotation.x = -Math.PI / 2; safeSpotFill.position.y = .035; infernoSafeSpot.add(safeSpotFill);
        const safeSpotRing = new THREE.Mesh(new THREE.RingGeometry(2.25, 2.65, 48), new THREE.MeshBasicMaterial({ color: 0x7ee0c3, transparent: true, opacity: .9, side: THREE.DoubleSide, depthWrite: false }));
        safeSpotRing.rotation.x = -Math.PI / 2; safeSpotRing.position.y = .065; infernoSafeSpot.add(safeSpotRing);
        infernoSafeSpot.position.set(-5, 0, 5.5); infernoSafeSpot.visible = false; scene.add(infernoSafeSpot);
        const lightningWarnings = [];
        const lightningStrikeCount = 11;
        for (let i = 0; i < lightningStrikeCount; i++) { const marker = new THREE.Mesh(new THREE.RingGeometry(.18, 2.1, 32), new THREE.MeshBasicMaterial({ color: 0xffa52f, transparent: true, opacity: .5, side: THREE.DoubleSide, depthWrite: false })); marker.rotation.x = -Math.PI / 2; marker.position.y = .04; marker.visible = false; scene.add(marker); lightningWarnings.push(marker) }
        const lightning = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xff4933, transparent: true, opacity: .95 })); lightning.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lightningStrikeCount * 8 * 6), 3)); lightning.visible = false; scene.add(lightning);
        const warning = new THREE.Mesh(new THREE.RingGeometry(3.05, 3.3, 48), new THREE.MeshBasicMaterial({ color: 0xff554b, transparent: true, opacity: .8, side: THREE.DoubleSide, depthWrite: false })); warning.rotation.x = -Math.PI / 2; warning.position.y = .025; warning.visible = false; root.add(warning);
        root.position.set(0, 0, -9); v.scale.setScalar(.62);
        return { root, v, warning, fireWarning, flightFireWarning, infernoWarning, infernoSafeSpot, lightningWarnings, lightning, lightningStrikeCount, lightningTargets: [], lightningResolved: [], throat, head, jaw, neck, tail, neckCount, hindLegs, arms, wings, fireGeometry, fireMaterials, size: 1.35, hp: 1100, maxHp: 1100, state: 'intro', timer: 1.4, phase: 1, alive: true, hitCooldown: 0, fireHitCooldown: 0, infernoHitCooldown: 0, attackCount: 0, attackKind: 'fire', attackResolved: false, attackDirection: new THREE.Vector3(), attackTarget: new THREE.Vector3(), attackStart: new THREE.Vector3(), fireStreams: [], nextFire: 0, flightDuration: 2.2, lightningDuration: 4.4, infernoDuration: 3.6, windupDuration: 1.05 };
    }
    // Reaproveita o cavaleiro do jogador para montar o chefe com espada e bainha.
    function makeKnightBoss() {
        const knight = makeHero(), { root, visual, torso, pivot, sword, head, cape } = knight;
        const scale = 1.32;
        visual.scale.setScalar(scale);
        cape.material = mats.darkStone;
        const sheath = new THREE.Group();
        sheath.position.set(-.22, -.12, -.3);
        sheath.rotation.x = -Math.PI / 2;
        torso.add(sheath);
        box(sheath, mats.darkStone, [0, 0, .61], [.19, .16, 1.35]);
        cylinder(sheath, mats.gold, [0, 0, .12], .14, .14, .1, 6);
        cylinder(sheath, mats.gold, [0, 0, 1.12], .13, .13, .1, 6);
        const crest = new THREE.Mesh(new THREE.ConeGeometry(.15, .55, 5), mats.gold);
        crest.position.set(0, .39, .03);
        crest.rotation.z = -.12;
        crest.castShadow = true;
        head.add(crest);
        for (const side of [-1, 1]) {
            const spike = new THREE.Mesh(new THREE.ConeGeometry(.1, .34, 5), mats.gold);
            spike.position.set(side * .48, .42, 0);
            spike.rotation.z = side * -.7;
            spike.castShadow = true;
            torso.add(spike);
        }
        const warning = new THREE.Mesh(new THREE.RingGeometry(3.05, 3.3, 48), new THREE.MeshBasicMaterial({ color: 0xff554b, transparent: true, opacity: .8, side: THREE.DoubleSide, depthWrite: false }));
        warning.rotation.x = -Math.PI / 2;
        warning.position.y = .025;
        warning.visible = false;
        root.add(warning);
        sword.visible = false;
        root.position.set(0, 0, -9);
        const handPosition = pivot.position.clone();
        const drawPosition = new THREE.Vector3(-.25, -.25, -.25);
        return {
            ...knight, root, v: visual, warning, sword, sheath, size: 1.05, modelScale: scale,
            hp: 1100, maxHp: 1100, state: 'intro', timer: 1.4, phase: 1, alive: true,
            hitCooldown: 0, attackCount: 0, attackKind: 'cleave', attackResolved: false,
            attackDirection: new THREE.Vector3(), attackDuration: .52, attackTarget: new THREE.Vector3(),
            weaponDrawn: false, handPosition, drawPosition, drawTimer: 0, attackStart: new THREE.Vector3()
        };
    }
    const boss = makeBoss();
    let bossActive = false;
    boss.root.visible = false;
    function tintKnight(actor, tint, cloak) {
        actor.visual.traverse(part => {
            if (!part.isMesh || !part.material) return;
            part.material = part.material.clone();
            part.material.color.lerp(new THREE.Color(tint), .3);
        });
        actor.cape.material = cloak;
    }
    const companion = makeHero();
    companion.root.position.set(-5, 0, 42);
    companion.root.rotation.y = Math.PI / 2;
    companion.sword.visible = false;
    companion.waistSword.visible = false;
    companion.backShield.visible = false;
    companion.weaponDrawn = false;
    tintKnight(companion, 0x7d6953, mats.red);
    const hood = new THREE.Mesh(new THREE.ConeGeometry(.33, .55, 6), mats.darkStone);
    hood.position.y = .34;
    companion.head.add(hood);
    function makeJourneyEnemy(name, type, x, z, health, damage, speed, tint, size) {
        const model = makeHero();
        model.root.position.set(x, 0, z);
        model.visual.scale.setScalar(size);
        model.cape.material = mats.enemy;
        tintKnight(model, tint, mats.enemy);
        model.backShield.visible = type === 'guard';
        model.handShield.visible = false;
        model.weaponDrawn = true;
        const warning = new THREE.Mesh(
            new THREE.RingGeometry(type === 'guard' ? 2.4 : 1.8, type === 'guard' ? 2.65 : 2.05, 32),
            new THREE.MeshBasicMaterial({ color: 0xd35445, transparent: true, opacity: .8, side: THREE.DoubleSide, depthWrite: false })
        );
        warning.rotation.x = -Math.PI / 2;
        warning.position.y = .035;
        warning.visible = false;
        model.root.add(warning);
        const healthBar = new THREE.Group();
        healthBar.position.y = 3.05;
        const healthBack = new THREE.Mesh(
            new THREE.PlaneGeometry(1.05, .11),
            new THREE.MeshBasicMaterial({ color: 0x171516, side: THREE.DoubleSide, depthWrite: false })
        );
        const healthFill = new THREE.Mesh(
            new THREE.PlaneGeometry(.97, .055),
            new THREE.MeshBasicMaterial({ color: 0xc3463e, side: THREE.DoubleSide, depthWrite: false })
        );
        healthFill.position.z = .008;
        healthBar.add(healthBack, healthFill);
        healthBar.visible = false;
        model.root.add(healthBar);
        return { name, type, model, root: model.root, warning, healthBar, healthFill, health, maxHealth: health, damage, speed, state: 'idle', timer: 0, attackCooldown: 1.1, alive: true, x, z };
    }
    const journeyEnemies = [
        makeJourneyEnemy('Guerreiro Caído', 'soldier', 5, 26, 72, 12, 2.2, 0x59372c, .58),
        makeJourneyEnemy('Criatura Sombria', 'shade', -6, 15, 54, 10, 3.2, 0x352d3a, .48),
        makeJourneyEnemy('Guardião das Ruínas', 'guard', 5, 7, 112, 16, 1.55, 0x514b44, .7)
    ];
    const questShards = [];
    for (const [index, [x, z]] of [[-7, 22], [8, 17], [-1, 10]].entries()) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        const ring = new THREE.Mesh(new THREE.RingGeometry(.42, .57, 24), new THREE.MeshBasicMaterial({ color: 0x77c8bb, transparent: true, opacity: .8, side: THREE.DoubleSide }));
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = .045;
        group.add(ring);
        const shard = new THREE.Mesh(new THREE.OctahedronGeometry(.42, 0), mats.cyan);
        shard.position.y = .8;
        shard.scale.set(.7, 1.5, .7);
        shard.castShadow = true;
        group.add(shard);
        scene.add(group);
        questShards.push({ group, shard, x, z, phase: index * 2.1, index });
    }
    const lantern = new THREE.PointLight(0x8c6441, .22, 7, 2); lantern.position.set(0, 1.8, 0); hero.root.add(lantern);
    const keys = new Set(), maxFlasks = 3, flaskHeal = 45, maxEnergyFlasks = 3, energyFlaskRestore = 45, maxHealth = 120;
    let flasks = maxFlasks, energyFlasks = maxEnergyFlasks, mobileGuarding = false, yaw = 0, lockYawOffset = 0, pitch = .18, mouseLocked = false, mouseDragging = false, lastMouseX = 0, lastMouseY = 0, paused = true, running = false, last = performance.now(), time = 0, stamina = 100, hp = maxHealth, attack = null, bufferedAttack = null, dodge = 0, dodgeCooldown = 0, lockOn = false, invulnerable = 0, shake = 0, toastTimer = 0, hitStop = 0, walkPhase = 0, cinematicTimer = 0, saveTimer = 0, gateNoticeTimer = 0;
    const journey = { questStarted: false, shardCount: 0, shardsFound: [false, false, false], rewarded: false, weaponUpgrade: false, ashes: 0, checkpoint: { x: 0, z: 49 }, position: { x: 0, z: 49 }, hp: maxHealth, flasks: maxFlasks, energyFlasks: maxEnergyFlasks, defeatedEnemies: [], bossDefeated: false };
    const saveKey = 'requiem-ashes-of-the-vale-save-v1';
    const camTarget = new THREE.Vector3(), desiredCamera = new THREE.Vector3(), cameraBasePosition = new THREE.Vector3(), cameraLookTarget = new THREE.Vector3(), cameraRayDirection = new THREE.Vector3(), cameraRight = new THREE.Vector3(), forward = new THREE.Vector3(), right = new THREE.Vector3(), moveDir = new THREE.Vector3(), temp = new THREE.Vector3(), cameraRaycaster = new THREE.Raycaster(), clock = new THREE.Clock();
    let cameraInitialized = false;
    let activeTouch = null, touchX = 0, touchY = 0;
    function loadProgress() {
        try {
            const raw = localStorage.getItem(saveKey);
            if (!raw) return;
            const saved = JSON.parse(raw);
            if (saved.version !== 1 || typeof saved.journey !== 'object' || !saved.journey) return;
            const data = saved.journey;
            journey.questStarted = data.questStarted === true;
            journey.shardsFound = journey.shardsFound.map((_, index) => data.shardsFound?.[index] === true);
            journey.shardCount = journey.shardsFound.filter(Boolean).length;
            journey.rewarded = data.rewarded === true;
            journey.weaponUpgrade = data.weaponUpgrade === true;
            journey.ashes = Number.isFinite(data.ashes) ? Math.max(0, Math.floor(data.ashes)) : 0;
            journey.defeatedEnemies = Array.isArray(data.defeatedEnemies) ? data.defeatedEnemies.filter(index => Number.isInteger(index) && index >= 0 && index < journeyEnemies.length) : [];
            journey.bossDefeated = data.bossDefeated === true;
            const position = data.position;
            if (position && Number.isFinite(position.x) && Number.isFinite(position.z)) journey.position = { x: clamp(position.x, -32, 32), z: clamp(position.z, -30, 55) };
            const checkpoint = data.checkpoint;
            if (checkpoint && Number.isFinite(checkpoint.x) && Number.isFinite(checkpoint.z)) journey.checkpoint = { x: clamp(checkpoint.x, -32, 32), z: clamp(checkpoint.z, -30, 55) };
            journey.hp = Number.isFinite(data.hp) ? clamp(data.hp, 1, maxHealth) : maxHealth;
            journey.flasks = Number.isInteger(data.flasks) ? clamp(data.flasks, 0, maxFlasks) : maxFlasks;
            journey.energyFlasks = Number.isInteger(data.energyFlasks) ? clamp(data.energyFlasks, 0, maxEnergyFlasks) : maxEnergyFlasks;
            questShards.forEach(item => { item.group.visible = !journey.shardsFound[item.index] });
            journeyEnemies.forEach((enemy, index) => {
                if (!journey.defeatedEnemies.includes(index)) return;
                enemy.alive = false;
                enemy.root.visible = false;
            });
        } catch (error) {
            console.error('Não foi possível carregar o progresso salvo de REQUIEM.', error);
        }
    }
    function saveProgress() {
        journey.position = { x: hero.root.position.x, z: hero.root.position.z };
        journey.hp = hp;
        journey.flasks = flasks;
        journey.energyFlasks = energyFlasks;
        try {
            localStorage.setItem(saveKey, JSON.stringify({ version: 1, journey }));
        } catch (error) {
            console.error('Não foi possível salvar o progresso de REQUIEM.', error);
            toast('FALHA AO SALVAR · VERIFIQUE O ARMAZENAMENTO DO NAVEGADOR', 2);
        }
    }
    loadProgress();
    const sparks = [], slashes = [], sparkGeometry = new THREE.IcosahedronGeometry(.075, 0);
    const sparkMaterials = [mats.ember, mats.cyan, mats.gold];
    // Solta partículas quando ocorre um impacto.
    function burst(position, count = 9) {
        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(sparkGeometry, sparkMaterials[i % sparkMaterials.length]); mesh.position.copy(position);
            const angle = random() * Math.PI * 2, speed = 1.2 + random() * 3.2;
            scene.add(mesh); sparks.push({ mesh, velocity: new THREE.Vector3(Math.cos(angle) * speed, .8 + random() * 2.2, Math.sin(angle) * speed), life: .28 + random() * .35, maxLife: .63 });
        }
    }
    function slashEffect(heavy) {
        const material = new THREE.MeshBasicMaterial({ color: heavy ? 0xc77748 : 0xb89a68, transparent: true, opacity: .82, depthWrite: false, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(new THREE.TorusGeometry(heavy ? 1.12 : .9, .035, 5, 32, Math.PI * 1.35), material);
        mesh.position.copy(hero.root.position).add(new THREE.Vector3(0, 1.25, 0));
        mesh.rotation.y = hero.root.rotation.y - (heavy ? .45 : .2); mesh.scale.set(1, 1.12, 1); scene.add(mesh); slashes.push({ mesh, life: .25, maxLife: .25, heavy });
    }
    // Atualiza e remove os efeitos visuais temporários.
    function updateEffects(dt) {
        for (let i = sparks.length - 1; i >= 0; i--) {
            const s = sparks[i]; s.life -= dt; s.velocity.y -= 5 * dt; s.mesh.position.addScaledVector(s.velocity, dt); s.mesh.scale.setScalar(Math.max(.01, s.life / s.maxLife));
            if (s.life <= 0) { scene.remove(s.mesh); sparks.splice(i, 1) }
        }
        for (let i = slashes.length - 1; i >= 0; i--) {
            const s = slashes[i]; s.life -= dt; const progress = 1 - s.life / s.maxLife; s.mesh.material.opacity = Math.max(0, 1 - progress); s.mesh.scale.setScalar(1 + progress * (s.heavy ? .75 : .45));
            if (s.life <= 0) { scene.remove(s.mesh); s.mesh.geometry.dispose(); s.mesh.material.dispose(); slashes.splice(i, 1) }
        }
    }
    // Anima fogo, brasas, bandeiras e cristais do cenário.
    function updateAmbience(dt) {
        fire.intensity = 2.2 + Math.sin(time * 9) * .55; tealFill.intensity = .34 + Math.sin(time * 1.7) * .08;
        flame.scale.y = 1.15 + Math.sin(time * 11) * .18; flame.rotation.y = time * 1.6;
        for (const e of embers) { e.h += dt * e.s; if (e.h > 3.5) e.h = 0; e.mesh.position.set(-5 + Math.sin(e.a + time * 1.8) * e.r, e.h + 1.4, 5.5 + Math.cos(e.a + time * 1.8) * e.r) }
        for (const b of banners) b.cloth.rotation.z = Math.sin(time * 1.8 + b.phase) * .055;
        for (const c of crystals) { c.group.position.y = Math.sin(time * 1.4 + c.phase) * .055; c.crystal.rotation.y = c.phase + time * .16 }
        for (const g of graveMarkers) g.marker.rotation.z = Math.sin(time * .7 + g.phase) * .012;
        arenaRune.material.opacity = .18 + Math.sin(time * 2.1) * .07;
        updateEffects(dt);
    }
    function toast(text, seconds = 1.1) { $('toast').textContent = text; $('toast').style.opacity = '1'; toastTimer = seconds }
    function updateJourneyHud() {
        $('questTracker').style.display = running ? 'block' : 'none';
        $('questProgress').textContent = journey.rewarded
            ? (bossActive ? 'Enfrente o Dragão das Cinzas' : 'Atravesse o caminho até a arena')
            : journey.shardCount === 3 ? 'Volte a Maelis para receber sua recompensa'
                : journey.questStarted ? 'Fragmentos antigos · ' + journey.shardCount + ' / 3'
                    : 'Fale com Maelis no vilarejo';
        $('journalQuest').textContent = journey.rewarded
            ? 'Concluída: os três vestígios foram devolvidos a Maelis. Sua espada foi fortalecida; siga pela trilha até a arena.'
            : 'Em andamento: fale com Maelis e encontre os três vestígios antigos espalhados pela trilha em direção à arena. Depois, volte para receber a recompensa.';
        const inventorySummary = [journey.shardCount, flasks, energyFlasks, journey.ashes, journey.weaponUpgrade].join(':');
        if ($('journalInventory').dataset.summary !== inventorySummary) {
            $('journalInventory').dataset.summary = inventorySummary;
            $('journalInventory').innerHTML = '<div>Fragmentos antigos <kbd>' + journey.shardCount + ' / 3</kbd></div><div>Frascos de vida <kbd>' + flasks + ' / ' + maxFlasks + '</kbd></div><div>Frascos de energia <kbd>' + energyFlasks + ' / ' + maxEnergyFlasks + '</kbd></div><div>Cinzas coletadas <kbd>' + journey.ashes + '</kbd></div><div>Arma <kbd>' + (journey.weaponUpgrade ? 'Espada azul · reforçada' : 'Espada azul') + '</kbd></div>';
        }
        const prompt = $('interactionPrompt');
        const nearby = nearestInteraction();
        const promptText = running && !paused && nearby ? 'G · ' + nearby.label : '';
        prompt.textContent = promptText;
        prompt.style.display = promptText ? 'block' : 'none';
    }
    function setHud() {
        const h = Math.max(0, hp / maxHealth * 100), s = Math.max(0, stamina);
        $('hp').firstElementChild.style.width = h + '%';
        $('stamina').firstElementChild.style.width = s + '%';
        $('hpText').textContent = Math.ceil(hp) + ' / ' + maxHealth;
        $('stText').textContent = Math.ceil(stamina) + ' / 100';
        $('flaskCount').textContent = 'VIDA · ' + flasks + ' / ' + maxFlasks;
        $('energyFlaskCount').textContent = 'ENERGIA · ' + energyFlasks + ' / ' + maxEnergyFlasks;
        $('bossBar').firstElementChild.style.width = Math.max(0, boss.hp / boss.maxHp * 100) + '%';
        $('bossName').textContent = boss.phase === 2 ? 'DRAGÃO DAS CINZAS · IRA DESPERTA' : 'DRAGÃO DAS CINZAS';
        updateJourneyHud();
    }
    function nearestInteraction() {
        const npcDistance = horizontalDistance(hero.root.position, companion.root.position);
        const campDistance = horizontalDistance(hero.root.position, routeCamp.position);
        if (npcDistance < 3.2 && (!campDistance || npcDistance <= campDistance)) return { type: 'npc', label: 'Falar com Maelis' };
        if (campDistance < 3.8) return { type: 'camp', label: 'Descansar e salvar na fogueira' };
        return null;
    }
    function showDialogue(text) {
        $('dialogueText').textContent = text;
        $('dialogue').style.display = 'flex';
        paused = true;
        document.exitPointerLock?.();
    }
    function interactWithWorld() {
        if (!running || paused || cinematicTimer > 0) return;
        const interaction = nearestInteraction();
        if (!interaction) {
            toast('NÃO HÁ NADA PARA INTERAGIR AQUI', .8);
            return;
        }
        if (interaction.type === 'camp') {
            restAtCamp();
            return;
        }
        if (!journey.questStarted) {
            journey.questStarted = true;
            saveProgress();
            showDialogue('Maelis, a Cinza: “O dragão despertou, e a trilha está se desfazendo. Traga de volta os três vestígios antigos que ficaram nas ruínas. A espada azul ainda pode ferir a fera — vou reforçá-la quando você voltar.”');
        } else if (journey.shardCount === 3 && !journey.rewarded) {
            journey.rewarded = true;
            journey.weaponUpgrade = true;
            flasks = maxFlasks;
            energyFlasks = maxEnergyFlasks;
            hp = maxHealth;
            saveProgress();
            showDialogue('Maelis: “Você os encontrou. Esta têmpera vai conduzir melhor a chama azul. A arena fica adiante; quando cruzar o arco, não haverá caminho de volta.”');
        } else if (journey.rewarded) {
            showDialogue('Maelis: “O vento mudou. Vá pela trilha até o arco antigo. Eu ficarei aqui, mantendo a fogueira acesa.”');
        } else {
            showDialogue('Maelis: “Os vestígios brilham perto das ruínas. Procure ao longo do caminho e volte quando tiver os três.”');
        }
        setHud();
    }
    function restAtCamp() {
        if (bossActive) {
            toast('NÃO É POSSÍVEL DESCANSAR DURANTE A BATALHA', 1);
            return;
        }
        hp = maxHealth;
        stamina = 100;
        flasks = maxFlasks;
        energyFlasks = maxEnergyFlasks;
        journey.checkpoint = { x: hero.root.position.x, z: hero.root.position.z };
        journey.defeatedEnemies = [];
        journeyEnemies.forEach(enemy => {
            enemy.alive = true;
            enemy.health = enemy.maxHealth;
            enemy.state = 'idle';
            enemy.timer = 0;
            enemy.attackCooldown = 1.1;
            enemy.root.position.set(enemy.x, 0, enemy.z);
            enemy.root.visible = true;
            enemy.model.pivot.rotation.set(-.2, 0, .2);
        });
        saveProgress();
        setHud();
        toast('FOGUEIRA · VIDA, FRASCOS E PROGRESSO RESTAURADOS', 1.5);
    }
    function openJournal() {
        if (!running || paused || cinematicTimer > 0) return;
        $('journal').style.display = 'flex';
        paused = true;
        document.exitPointerLock?.();
        setHud();
    }
    function closeOverlay(id) {
        $(id).style.display = 'none';
        if (running) {
            paused = false;
            last = performance.now();
        }
        updateJourneyHud();
    }
    function beginBossIntro() {
        if (bossActive || journey.bossDefeated) return;
        bossActive = true;
        saveProgress();
        boss.alive = true;
        boss.hp = boss.maxHp;
        boss.phase = 1;
        boss.state = 'intro';
        boss.timer = 1.4;
        boss.root.position.set(0, 0, -9);
        boss.root.rotation.set(0, 0, 0);
        boss.root.visible = true;
        boss.warning.visible = false;
        boss.fireWarning.visible = false;
        boss.flightFireWarning.visible = false;
        boss.infernoWarning.visible = false;
        boss.infernoSafeSpot.visible = false;
        boss.lightning.visible = false;
        boss.lightningWarnings.forEach(marker => { marker.visible = false });
        boss.lightningTargets.length = 0;
        boss.lightningResolved.length = 0;
        boss.throat.intensity = 0;
        boss.fireStreams.forEach(stream => scene.remove(stream.group));
        boss.fireStreams.length = 0;
        lockOn = true;
        lockYawOffset = 0;
        cinematicTimer = 5.8;
        $('introKicker').textContent = 'A ÚLTIMA VIGÍLIA';
        $('introTitle').textContent = 'O DRAGÃO DAS CINZAS';
        $('introLine').textContent = 'Maelis: “Que as cinzas guardem seu nome.”';
        $('introScene').style.display = 'flex';
        requestAnimationFrame(() => $('introScene').classList.add('visible'));
        $('bossHud').style.display = 'none';
        $('hud').style.visibility = 'hidden';
        cameraInitialized = false;
        toast('O ARCO SE FECHA ATRÁS DE VOCÊ', 1.5);
    }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }
    function horizontalDistance(a, b) { return Math.hypot(a.x - b.x, a.z - b.z) }
    // Mede a distância entre o alvo e o caminho percorrido pela espada.
    function distanceToSegment2D(point, start, end) {
        const dx = end.x - start.x, dz = end.z - start.z, lengthSq = dx * dx + dz * dz;
        const t = lengthSq ? clamp(((point.x - start.x) * dx + (point.z - start.z) * dz) / lengthSq, 0, 1) : 0;
        return Math.hypot(point.x - (start.x + dx * t), point.z - (start.z + dz * t));
    }
    // Confere se a espada alcança o chefe durante o golpe.
    function attackHitsBoss(current) {
        if (!hero.weaponDrawn || !bossActive) return false;
        const grip = hero.sword.localToWorld(new THREE.Vector3(0, .14, 0));
        const tip = hero.sword.localToWorld(new THREE.Vector3(0, -.97, 0));
        const center = boss.root.position;
        let distance = distanceToSegment2D(center, grip, tip);
        if (current.previousGrip && current.previousTip) {
            distance = Math.min(distance, distanceToSegment2D(center, current.previousGrip, current.previousTip));
            distance = Math.min(distance, distanceToSegment2D(center, current.previousTip, tip));
            distance = Math.min(distance, distanceToSegment2D(center, current.previousGrip, grip));
        }
        current.previousGrip = grip.clone(); current.previousTip = tip.clone();
        const dx = center.x - hero.root.position.x, dz = center.z - hero.root.position.z, distanceToHero = Math.hypot(dx, dz);
        const reach = current.heavy ? 4.35 : 3.75;
        const towardX = Math.sin(hero.root.rotation.y), towardZ = Math.cos(hero.root.rotation.y);
        const facingDot = distanceToHero > 0 ? (towardX * dx + towardZ * dz) / distanceToHero : 1;
        return distance <= .95 || (lockOn && distanceToHero <= reach) || (distanceToHero > 0 && distanceToHero <= reach && facingDot > .15);
    }
    function attackHitsEnemy(current, enemy) {
        if (!enemy.alive || !hero.weaponDrawn) return false;
        const dx = enemy.root.position.x - hero.root.position.x, dz = enemy.root.position.z - hero.root.position.z;
        const distance = Math.hypot(dx, dz);
        const reach = current.heavy ? 3.8 : 3.2;
        const facing = (Math.sin(hero.root.rotation.y) * dx + Math.cos(hero.root.rotation.y) * dz) / (distance || 1);
        return distance < reach && (lockOn || facing > .1);
    }
    function hitJourneyEnemy(enemy, damage) {
        if (!enemy.alive) return;
        enemy.health = Math.max(0, enemy.health - damage);
        const healthRatio = enemy.health / enemy.maxHealth;
        enemy.healthFill.scale.x = healthRatio;
        enemy.healthFill.position.x = (healthRatio - 1) * .485;
        enemy.healthBar.visible = true;
        burst(enemy.root.position.clone().add(new THREE.Vector3(0, 1.15, 0)), damage > 40 ? 12 : 7);
        shake = Math.max(shake, damage > 40 ? .3 : .18);
        if (enemy.health <= 0) {
            enemy.alive = false;
            enemy.state = 'dead';
            enemy.root.visible = false;
            const index = journeyEnemies.indexOf(enemy);
            if (index >= 0 && !journey.defeatedEnemies.includes(index)) journey.defeatedEnemies.push(index);
            journey.ashes += enemy.type === 'guard' ? 3 : 1;
            saveProgress();
            toast(enemy.name.toUpperCase() + ' CAIU · CINZAS ' + journey.ashes, 1.2);
        } else {
            enemy.state = 'stagger';
            enemy.timer = .28;
            toast('IMPACTO · ' + damage, .55);
        }
    }
    // Impede o jogador de atravessar o corpo do chefe.
    function resolveActorCollision() {
        if (!bossActive || !boss.alive) return;
        let dx = hero.root.position.x - boss.root.position.x, dz = hero.root.position.z - boss.root.position.z;
        let distance = Math.hypot(dx, dz);
        const minimumDistance = boss.size * 1.3;
        if (distance >= minimumDistance) return;
        if (distance < .001) { dx = Math.sin(hero.root.rotation.y); dz = Math.cos(hero.root.rotation.y); distance = 1 }
        hero.root.position.x = boss.root.position.x + dx / distance * minimumDistance;
        hero.root.position.z = boss.root.position.z + dz / distance * minimumDistance;
    }
    // Inicia a jornada no último ponto salvo ou na fogueira após uma derrota.
    function start(fromCheckpoint = false) {
        running = true; paused = false; last = performance.now(); stamina = 100;
        hp = fromCheckpoint ? maxHealth : journey.hp;
        flasks = fromCheckpoint ? maxFlasks : journey.flasks;
        energyFlasks = fromCheckpoint ? maxEnergyFlasks : journey.energyFlasks;
        dodge = 0; dodgeCooldown = 0; attack = null; bufferedAttack = null; hitStop = 0; cinematicTimer = 0; saveTimer = 0; gateNoticeTimer = 0;
        bossActive = false;
        boss.root.visible = false;
        boss.hp = boss.maxHp; boss.alive = true; boss.state = 'intro'; boss.timer = 1.4; boss.phase = 1; boss.size = 1.35; boss.attackCount = 0; boss.attackKind = 'fire'; boss.attackResolved = false; boss.hitCooldown = 0; boss.fireHitCooldown = 0; boss.infernoHitCooldown = 0; boss.fireStreams.forEach(stream => scene.remove(stream.group)); boss.fireStreams.length = 0; boss.lightningTargets.length = 0; boss.lightningResolved.length = 0; boss.lightning.visible = false; boss.lightningWarnings.forEach(marker => marker.visible = false); boss.fireWarning.visible = false; boss.flightFireWarning.visible = false; boss.infernoWarning.visible = false; boss.infernoSafeSpot.visible = false; boss.warning.visible = false; boss.throat.intensity = 0; boss.jaw.rotation.set(0, 0, 0); boss.arms.forEach(arm => arm.rotation.set(0, 0, 0)); boss.v.rotation.set(0, 0, 0); boss.v.position.y = 0; boss.v.scale.setScalar(.62); boss.root.rotation.set(0, 0, 0); boss.root.position.set(0, 0, -9);
        const spawn = fromCheckpoint ? journey.checkpoint : journey.position;
        hero.root.position.set(spawn.x, 0, spawn.z); hero.root.rotation.y = Math.PI; hero.visual.position.set(0, 0, 0); hero.torso.rotation.set(0, 0, 0); hero.pivot.rotation.set(-.2, 0, .2); hero.rightElbow.rotation.x = -.8; hero.leftArm.shoulder.rotation.set(-.3, 0, -.2); hero.leftArm.elbow.rotation.x = -.6; hero.sword.visible = true; hero.waistSword.visible = false; hero.backShield.visible = true; hero.handShield.visible = false; hero.weaponDrawn = true; hero.shieldDrawn = false; hero.equipmentAction = null; hero.guardImpact = 0;
        questShards.forEach(item => { item.group.visible = !journey.shardsFound[item.index] });
        journeyEnemies.forEach((enemy, index) => {
            enemy.alive = !journey.defeatedEnemies.includes(index);
            enemy.health = enemy.maxHealth;
            enemy.state = 'idle';
            enemy.timer = 0;
            enemy.attackCooldown = 1.1;
            enemy.root.position.set(enemy.x, 0, enemy.z);
            enemy.root.visible = enemy.alive;
            enemy.model.pivot.rotation.set(-.2, 0, .2);
        });
        companion.root.visible = true;
        yaw = 0; lockYawOffset = 0; pitch = .18; lockOn = false; shake = 0; cameraInitialized = false; keys.clear();
        $('menu').style.display = 'none'; $('pause').style.display = 'none'; $('end').style.display = 'none'; $('journal').style.display = 'none'; $('dialogue').style.display = 'none'; $('hud').style.display = 'block'; $('hud').style.visibility = 'visible'; $('bossHud').style.display = 'none'; $('introScene').classList.remove('visible'); $('introScene').style.display = 'none';
        updateCamera(.016);
        setHud();
        $('restart').style.display = 'block';
        $('restart').textContent = 'Ressurgir na fogueira';
        if (journey.bossDefeated) {
            running = false; paused = true; $('restart').style.display = 'none'; $('endTitle').textContent = 'O VALE ESTÁ EM SILÊNCIO'; $('end').style.display = 'flex';
        } else if (fromCheckpoint) {
            saveProgress();
        }
    }
    function respawnAtCheckpoint() {
        if (journey.bossDefeated) return;
        journey.position = { x: journey.checkpoint.x, z: journey.checkpoint.z };
        start(true);
        toast('VOCÊ RETORNOU À ÚLTIMA FOGUEIRA', 1.4);
    }
    // Encerra a cena de entrada e libera o combate.
    function finishIntro() {
        if (!bossActive || (cinematicTimer <= 0 && $('bossHud').style.display === 'block')) return;
        cinematicTimer = 0; boss.state = 'idle'; boss.timer = .8; $('introScene').classList.remove('visible'); setTimeout(() => $('introScene').style.display = 'none', 900); $('hud').style.visibility = 'visible'; $('bossHud').style.display = 'block'; cameraInitialized = false; toast('O DRAGÃO DESPERTA', 1.2);
    }
    function hitBoss(damage) {
        if (!bossActive || !boss.alive || boss.hitCooldown > 0) return;
        boss.hp = Math.max(0, boss.hp - damage); boss.hitCooldown = .12; shake = Math.max(shake, damage > 40 ? .42 : .25);
        burst(boss.root.position.clone().add(new THREE.Vector3(0, 1.8, 0)), damage > 40 ? 16 : 9);
        toast(damage > 40 ? 'GOLPE PESADO · ' + damage : 'IMPACTO · ' + damage, .65);
        if (boss.phase === 1 && boss.hp <= boss.maxHp * .5) { boss.phase = 2; boss.size = 1.35; shake = .65; burst(boss.root.position.clone().add(new THREE.Vector3(0, 2, 0)), 28); toast('A IRA DO DRAGÃO DESPERTA · FASE II', 1.8) }
        if (boss.hp <= 0) { boss.alive = false; boss.state = 'dead'; journey.bossDefeated = true; saveProgress(); boss.warning.visible = false; boss.fireWarning.visible = false; boss.flightFireWarning.visible = false; boss.infernoWarning.visible = false; boss.infernoSafeSpot.visible = false; boss.lightning.visible = false; boss.v.rotation.z = -.9; boss.v.position.y = -.35; $('endTitle').textContent = 'O DRAGÃO CAIU'; $('restart').style.display = 'none'; $('end').style.display = 'flex'; running = false; paused = true; document.exitPointerLock?.() }
        setHud();
    }
    // Inicia um golpe leve ou pesado do jogador.
    function startAttack(heavy = false) {
        if (!running || paused || cinematicTimer > 0 || !hero.root || dodge > 0 || hero.equipmentAction) return;
        if (!hero.weaponDrawn) { toast('SACAR ESPADA · 1', .8); return }
        if (attack) { const remaining = attack.wind + attack.active + attack.recovery - attack.t; if (remaining <= .34) bufferedAttack = heavy; return }
        const cost = heavy ? 28 : 12; if (stamina < cost) { toast('SEM RESISTÊNCIA', .8); return }
        const target = lockOn ? getLockTarget() : null;
        if (target) hero.root.rotation.y = Math.atan2(target.position.x - hero.root.position.x, target.position.z - hero.root.position.z);
        stamina -= cost; attack = { heavy, t: 0, wind: heavy ? .44 : .2, active: heavy ? .26 : .2, recovery: heavy ? .64 : .38, hit: false, previousGrip: null, previousTip: null }; hero.pivot.rotation.x = heavy ? .5 : -.2; hero.pivot.rotation.z = heavy ? -.4 : .2; setHud();
        if (!mouseLocked && location.protocol !== 'file:' && renderer.domElement.requestPointerLock) { try { const request = renderer.domElement.requestPointerLock(); if (request && typeof request.catch === 'function') request.catch(() => toast('Arraste para girar a câmera', 1)) } catch (_) { toast('Arraste para girar a câmera', 1) } }
    }
    // Executa a esquiva e concede invulnerabilidade temporária.
    function doDodge() {
        if (!running || paused || cinematicTimer > 0 || dodge > 0 || dodgeCooldown > 0 || stamina < 22) return;
        stamina -= 22; dodge = .42; dodgeCooldown = .62; invulnerable = .42; attack = null; hero.pivot.rotation.set(-.2, 0, .2); hero.rightElbow.rotation.x = -.8; hero.torso.rotation.set(0, 0, 0); slashEffect(true); toast('ESQUIVA', .45); setHud();
    }
    function toggleEquipment(item) {
        if (!running || paused || cinematicTimer > 0 || attack || dodge || hero.equipmentAction) return;
        const equipped = item === 'sword' ? hero.weaponDrawn : hero.shieldDrawn;
        hero.equipmentAction = { item, equip: !equipped, elapsed: 0 };
        toast(item === 'sword'
            ? (equipped ? 'GUARDANDO A ESPADA AZUL' : 'SACANDO A ESPADA AZUL')
            : (equipped ? 'GUARDANDO O ESCUDO' : 'PEGANDO O ESCUDO'), .9);
    }
    function updateEquipment(dt) {
        const action = hero.equipmentAction;
        if (!action) return;
        action.elapsed += dt;
        const progress = Math.min(1, action.elapsed / (action.equip ? .9 : .85));
        if (action.item === 'sword') {
            if (action.equip) {
                if (progress < .39) {
                    const p = progress / .39;
                    hero.pivot.rotation.x = .8 * p; hero.pivot.rotation.z = -.6 * p;
                    hero.rightElbow.rotation.x = -1.4 * p; hero.torso.rotation.y = -.5 * p;
                } else {
                    if (!hero.weaponDrawn) {
                        hero.waistSword.visible = false; hero.sword.visible = true; hero.weaponDrawn = true;
                    }
                    const p = (progress - .39) / .61;
                    hero.pivot.rotation.x = .8 - p; hero.pivot.rotation.z = -.6 + .8 * p;
                    hero.rightElbow.rotation.x = -1.4 + .6 * p; hero.torso.rotation.y = -.5 + .5 * p;
                }
            } else if (progress < .41) {
                const p = progress / .41;
                hero.pivot.rotation.x = -.2 + p; hero.pivot.rotation.z = .2 - .8 * p;
                hero.rightElbow.rotation.x = -.8 - .6 * p; hero.torso.rotation.y = -.5 * p;
            } else {
                if (hero.weaponDrawn) {
                    hero.sword.visible = false; hero.waistSword.visible = true; hero.weaponDrawn = false;
                }
                const p = (progress - .41) / .59;
                hero.pivot.rotation.x = .8 - p; hero.pivot.rotation.z = -.6 + .8 * p;
                hero.rightElbow.rotation.x = -1.4 + 1.1 * p; hero.torso.rotation.y = -.5 + .5 * p;
            }
            if (progress >= 1) {
                hero.pivot.rotation.set(-.2, 0, .2); hero.rightElbow.rotation.x = hero.weaponDrawn ? -.8 : -.3;
                hero.torso.rotation.y = 0; hero.equipmentAction = null;
            }
        } else if (action.equip) {
            if (progress < .39) {
                const p = progress / .39;
                hero.leftArm.shoulder.rotation.x = .9 * p; hero.leftArm.shoulder.rotation.z = .6 * p;
                hero.leftArm.elbow.rotation.x = -1.5 * p; hero.torso.rotation.y = .4 * p;
            } else {
                if (!hero.shieldDrawn) {
                    hero.backShield.visible = false; hero.handShield.visible = true; hero.shieldDrawn = true;
                }
                const p = (progress - .39) / .61;
                hero.leftArm.shoulder.rotation.x = .9 - 1.2 * p; hero.leftArm.shoulder.rotation.z = .6 - .8 * p;
                hero.leftArm.elbow.rotation.x = -1.5 + .9 * p; hero.torso.rotation.y = .4 - .4 * p;
            }
        } else if (progress < .41) {
            const p = progress / .41;
            hero.leftArm.shoulder.rotation.x = -.3 + 1.2 * p; hero.leftArm.shoulder.rotation.z = -.2 + .8 * p;
            hero.leftArm.elbow.rotation.x = -.6 - .9 * p; hero.torso.rotation.y = .4 * p;
        } else {
            if (hero.shieldDrawn) {
                hero.handShield.visible = false; hero.backShield.visible = true; hero.shieldDrawn = false;
            }
            const p = (progress - .41) / .59;
            hero.leftArm.shoulder.rotation.x = .9 - 1.2 * p; hero.leftArm.shoulder.rotation.z = .6 - .8 * p;
            hero.leftArm.elbow.rotation.x = -1.5 + .9 * p; hero.torso.rotation.y = .4 - .4 * p;
        }
        if (progress >= 1) {
            hero.leftArm.shoulder.rotation.set(-.3, 0, -.2); hero.leftArm.elbow.rotation.x = -.6;
            hero.torso.rotation.y = 0; hero.equipmentAction = null;
        }
    }
    function doLock() {
        if (cinematicTimer > 0) return;
        const target = getLockTarget();
        if (!lockOn && target) {
            const targetYaw = Math.atan2(hero.root.position.x - target.position.x, hero.root.position.z - target.position.z);
            lockYawOffset = Math.atan2(Math.sin(yaw - targetYaw), Math.cos(yaw - targetYaw));
            lockOn = true;
        } else {
            lockOn = false;
        }
        toast(lockOn ? 'ALVO TRAVADO' : target ? 'CÂMERA LIVRE' : 'NENHUM INIMIGO PRÓXIMO', .7);
    }
    function getLockTarget() {
        if (bossActive && boss.alive) return boss.root;
        let closest = null, closestDistance = 22;
        for (const enemy of journeyEnemies) {
            if (!enemy.alive) continue;
            const distance = horizontalDistance(hero.root.position, enemy.root.position);
            if (distance < closestDistance) { closest = enemy.root; closestDistance = distance }
        }
        return closest;
    }
    function useFlask() {
        if (!running || paused || cinematicTimer > 0) return;
        if (hp >= 120) { toast('VIDA COMPLETA', .7); return }
        if (flasks <= 0) { toast('SEM FRASCOS DE VIDA', .8); return }
        flasks--; hp = Math.min(maxHealth, hp + flaskHeal); saveProgress(); toast('FRASCO · VIDA RESTAURADA · ' + flasks + ' RESTANTES', 1); setHud();
    }
    function useEnergyFlask() {
        if (!running || paused || cinematicTimer > 0) return;
        if (stamina >= 100) { toast('ENERGIA COMPLETA', .7); return }
        if (energyFlasks <= 0) { toast('SEM FRASCOS DE ENERGIA', .8); return }
        energyFlasks--; stamina = Math.min(100, stamina + energyFlaskRestore); saveProgress(); toast('FRASCO · ENERGIA RESTAURADA · ' + energyFlasks + ' RESTANTES', 1); setHud();
    }
    function onKeyDown(e) {
        const k = e.key.toLowerCase(); if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'tab'].includes(k)) e.preventDefault();
        if ($('dialogue').style.display === 'flex' && (k === 'escape' || k === 'enter' || k === ' ')) { e.preventDefault(); closeOverlay('dialogue'); return }
        if ($('journal').style.display === 'flex' && (k === 'escape' || k === 'j')) { e.preventDefault(); closeOverlay('journal'); return }
        if (k === 'escape') { if ($('menu').style.display === 'flex') return; if ($('end').style.display === 'flex') return; if (paused) { paused = false; $('pause').style.display = 'none'; last = performance.now() } else { paused = true; $('pause').style.display = 'flex'; document.exitPointerLock?.() } return }
        keys.add(k);
        if (e.repeat) return;
        if (k === ' ') { doDodge() }
        if (k === 'tab') { doLock() }
        if (k === 'r') useFlask();
        if (k === 'e') useEnergyFlask();
        if (k === 'g') interactWithWorld();
        if (k === 'j') openJournal();
        if (k === '1') toggleEquipment('sword');
        if (k === '2') toggleEquipment('shield');
    }
    function onKeyUp(e) { keys.delete(e.key.toLowerCase()) }
    addEventListener('keydown', onKeyDown); addEventListener('keyup', onKeyUp);
    addEventListener('blur', () => { keys.clear(); mobileGuarding = false });
    renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());
    renderer.domElement.addEventListener('mousedown', e => { mouseDragging = true; lastMouseX = e.clientX; lastMouseY = e.clientY; if (e.button === 0) startAttack(false); if (e.button === 2) startAttack(true) });
    addEventListener('mouseup', () => { mouseDragging = false });
    renderer.domElement.addEventListener('pointerlockchange', () => { mouseLocked = document.pointerLockElement === renderer.domElement });
    addEventListener('mousemove', e => { if (mouseLocked || mouseDragging) { const dx = mouseLocked ? e.movementX : e.clientX - lastMouseX, dy = mouseLocked ? e.movementY : e.clientY - lastMouseY; lastMouseX = e.clientX; lastMouseY = e.clientY; if (lockOn && getLockTarget()) lockYawOffset -= dx * .0022; else yaw -= dx * .0022; pitch = clamp(pitch + dy * .0018, -.12, .48) } });
    // Move a câmera e mantém o chefe enquadrado durante a luta.
    function updateCamera(dt) {
        if (cinematicTimer > 0) {
            const progress = 1 - cinematicTimer / 5.8;
            camera.position.set(7.5 - 1.6 * progress, 4.2 + Math.sin(progress * Math.PI) * .45, .2 + progress);
            camera.lookAt(0, 3.05, -8);
            return;
        }
        camTarget.set(hero.root.position.x, hero.root.position.y + 1.4, hero.root.position.z);
        const target = getLockTarget();
        const targetDistance = target ? horizontalDistance(hero.root.position, target.position) : Infinity;
        if (lockOn && target) {
            const targetYaw = Math.atan2(hero.root.position.x - target.position.x, hero.root.position.z - target.position.z) + lockYawOffset;
            const yawDelta = Math.atan2(Math.sin(targetYaw - yaw), Math.cos(targetYaw - yaw));
            yaw += yawDelta * (1 - Math.exp(-5 * dt));
        }
        const dist = lockOn && target ? clamp(9.2 + Math.max(0, targetDistance - 3) * .1, 9.2, 11.8) : 9.2;
        desiredCamera.set(Math.sin(yaw) * dist, 3 + pitch * 7, Math.cos(yaw) * dist).add(camTarget);
        cameraRayDirection.copy(desiredCamera).sub(camTarget);
        const rayLength = cameraRayDirection.length();
        cameraRayDirection.normalize();
        cameraRaycaster.set(camTarget, cameraRayDirection); cameraRaycaster.far = rayLength;
        const obstruction = cameraRaycaster.intersectObjects(cameraBlockers, true)[0];
        if (obstruction) desiredCamera.copy(camTarget).addScaledVector(cameraRayDirection, Math.max(1.3, obstruction.distance - .4));
        if (cameraInitialized) cameraBasePosition.lerp(desiredCamera, 1 - Math.exp(-8 * dt));
        else { cameraBasePosition.copy(desiredCamera); cameraInitialized = true }
        cameraLookTarget.copy(camTarget);
        if (lockOn && target && targetDistance < 24) {
            temp.set(target.position.x, target.position.y + (bossActive ? 2.7 : 1.15), target.position.z);
            cameraLookTarget.lerp(temp, .24);
        }
        camera.position.copy(cameraBasePosition);
        cameraRight.set(Math.cos(yaw), 0, -Math.sin(yaw));
        if (shake > 0) { camera.position.addScaledVector(cameraRight, Math.sin(time * 75) * shake); camera.position.y += Math.cos(time * 61) * shake * .32 }
        camera.lookAt(cameraLookTarget);
    }
    // Processa movimento, colisões e animações do jogador.
    function updatePlayer(dt) {
        updateEquipment(dt);
        let sx = (keys.has('d') ? 1 : 0) - (keys.has('a') ? 1 : 0), sz = (keys.has('s') ? 1 : 0) - (keys.has('w') ? 1 : 0);
        if (activeTouch) { sx = activeTouch.x; sz = activeTouch.y }
        moveDir.set(0, 0, 0);
        forward.set(-Math.sin(yaw), 0, -Math.cos(yaw)); right.set(Math.cos(yaw), 0, -Math.sin(yaw));
        moveDir.addScaledVector(right, sx).addScaledVector(forward, -sz);
        if (moveDir.lengthSq() > 1) moveDir.normalize();
        const moving = moveDir.lengthSq() > .01, sprinting = keys.has('shift') && moving && stamina > 0 && !dodge;
        if (sprinting) stamina = Math.max(0, stamina - dt * 18); else if (!attack && !dodge) stamina = Math.min(100, stamina + dt * 20);
        const speed = (sprinting ? 8.8 : 6.2) * (attack ? .78 : 1);
        if (dodge > 0) { const u = dodge / .42; hero.root.position.addScaledVector(moveDir.lengthSq() > .01 ? moveDir : forward, speed * 2.15 * dt * (.4 + u)); dodge = Math.max(0, dodge - dt) }
        else if (moving) { hero.root.position.addScaledVector(moveDir, speed * dt); hero.root.rotation.y = Math.atan2(moveDir.x, moveDir.z) }
        if (bossActive) {
            const arenaDistance = Math.hypot(hero.root.position.x, hero.root.position.z);
            if (arenaDistance > arenaBoundaryRadius) {
                hero.root.position.x *= arenaBoundaryRadius / arenaDistance;
                hero.root.position.z *= arenaBoundaryRadius / arenaDistance;
            }
        } else {
            hero.root.position.x = clamp(hero.root.position.x, -32, 32);
            hero.root.position.z = clamp(hero.root.position.z, -30, 55);
            if (hero.root.position.z < 3 && !journey.rewarded) {
                hero.root.position.z = 3;
                if (time - gateNoticeTimer > 2) {
                    toast('O ARCO ESTÁ SELADO · AJUDE MAELIS E ENCONTRE OS VESTÍGIOS', 1.4);
                    gateNoticeTimer = time;
                }
            } else if (hero.root.position.z < 3 && journey.rewarded) {
                hero.root.position.z = 3;
                beginBossIntro();
            }
        }
        for (const obstacle of worldColliders) {
            const dx = hero.root.position.x - obstacle.x, dz = hero.root.position.z - obstacle.z;
            const distance = Math.hypot(dx, dz), minimum = obstacle.radius + .42;
            if (distance < minimum && distance > .001) {
                hero.root.position.x = obstacle.x + dx / distance * minimum;
                hero.root.position.z = obstacle.z + dz / distance * minimum;
            }
        }
        for (const p of pillars) { const dx = hero.root.position.x - p.x, dz = hero.root.position.z - p.z, d = Math.hypot(dx, dz), min = p.r + .42; if (d < min && d > 0) { hero.root.position.x = p.x + dx / d * min; hero.root.position.z = p.z + dz / d * min } }
        for (const g of graveMarkers) { const dx = hero.root.position.x - g.marker.position.x, dz = hero.root.position.z - g.marker.position.z, d = Math.hypot(dx, dz), min = .72; if (d < min && d > 0) { hero.root.position.x = g.marker.position.x + dx / d * min; hero.root.position.z = g.marker.position.z + dz / d * min } }
        walkPhase += dt * (sprinting ? 13 : moving ? 9 : 2);
        hero.visual.position.y = moving ? Math.abs(Math.sin(walkPhase)) * .045 : Math.sin(time * 1.8) * .018;
        hero.legs.forEach(leg => {
            const swing = moving ? Math.sin(walkPhase + (leg.userData.legSide > 0 ? Math.PI : 0)) * .48 : 0;
            leg.rotation.x = swing;
            leg.userData.knee.rotation.x = moving ? Math.max(0, -swing) * .7 : 0;
        });
        hero.cape.rotation.x = moving ? Math.sin(walkPhase) * .12 : Math.sin(time * 1.6) * .035;
        if (attack) {
            attack.t += dt;
            const total = attack.wind + attack.active + attack.recovery;
            if (attack.t < attack.wind) {
                const u = attack.t / attack.wind;
                hero.pivot.rotation.x = attack.heavy ? .5 * u : -.2 - .15 * u;
                hero.pivot.rotation.z = attack.heavy ? .2 - .4 * u : .2;
                hero.rightElbow.rotation.x = attack.heavy ? -.3 - .5 * u : -.8 - .2 * u;
                hero.torso.rotation.y = attack.heavy ? -.8 * u : -.15 * u;
            }
            else if (attack.t < attack.wind + attack.active) {
                const u = (attack.t - attack.wind) / attack.active, eased = u * u * (3 - 2 * u);
                if (attack.heavy) {
                    if (u < .35) {
                        const load = u / .35;
                        hero.pivot.rotation.x = .5 * load; hero.pivot.rotation.z = .2 - .4 * load;
                        hero.torso.rotation.y = -.8 * load;
                    } else {
                        const strike = (u - .35) / .65, motion = Math.sin(strike * Math.PI);
                        hero.pivot.rotation.x = -.2 - 1.6 * motion; hero.pivot.rotation.z = .2 + .15 * motion;
                        hero.torso.rotation.y = -.8 + 1.1 * strike;
                    }
                    hero.rightElbow.rotation.x = -.3 - .6 * eased;
                } else {
                    const thrust = Math.sin(eased * Math.PI);
                    hero.pivot.rotation.x = -.2 - 1.35 * thrust; hero.pivot.rotation.z = .2;
                    hero.rightElbow.rotation.x = -.8 + .5 * thrust;
                    hero.torso.rotation.y = .3 * thrust;
                }
                if (!attack.hit) {
                    if (bossActive && boss.alive && attackHitsBoss(attack)) {
                        attack.hit = true;
                        slashEffect(attack.heavy);
                        hitBoss((attack.heavy ? 45 : 30) * (journey.weaponUpgrade ? 1.18 : 1));
                    } else {
                        const enemy = journeyEnemies.find(candidate => attackHitsEnemy(attack, candidate));
                        if (enemy) {
                            attack.hit = true;
                            slashEffect(attack.heavy);
                            hitJourneyEnemy(enemy, (attack.heavy ? 45 : 30) * (journey.weaponUpgrade ? 1.18 : 1));
                        }
                    }
                }
            } else {
                const u = clamp((attack.t - attack.wind - attack.active) / attack.recovery, 0, 1), settle = u * u * (3 - 2 * u);
                hero.pivot.rotation.x = (attack.heavy ? -1.8 : -1.55) * (1 - settle) - .2 * settle;
                hero.pivot.rotation.z = .2 + (attack.heavy ? .15 : 0) * (1 - settle);
                hero.rightElbow.rotation.x = (attack.heavy ? -.9 : -.3) * (1 - settle) + (hero.weaponDrawn ? -.8 : -.3) * settle;
                hero.torso.rotation.y = (attack.heavy ? .3 : .3) * (1 - settle);
            }
            if (attack.t >= total) { attack = null; hero.pivot.rotation.set(-.2, 0, .2); hero.rightElbow.rotation.x = hero.weaponDrawn ? -.8 : -.3; hero.torso.rotation.set(0, 0, 0) }
        }
        hero.guardImpact = Math.max(0, hero.guardImpact - dt);
        if (!hero.equipmentAction) {
            const guarding = hero.shieldDrawn && (keys.has('f') || mobileGuarding) && !attack && dodge <= 0;
            const blend = 1 - Math.exp(-14 * dt);
            if (guarding) {
                const impact = hero.guardImpact > 0 ? Math.sin((1 - hero.guardImpact / .28) * Math.PI) : 0;
                hero.leftArm.shoulder.rotation.x += (-.42 - hero.leftArm.shoulder.rotation.x) * blend;
                hero.leftArm.shoulder.rotation.y += (-.08 - hero.leftArm.shoulder.rotation.y) * blend;
                hero.leftArm.shoulder.rotation.z += (.82 + impact * .16 - hero.leftArm.shoulder.rotation.z) * blend;
                hero.leftArm.elbow.rotation.x += (-1.12 - impact * .2 - hero.leftArm.elbow.rotation.x) * blend;
                hero.torso.rotation.y += (-.12 - impact * .08 - hero.torso.rotation.y) * blend;
            } else if (!attack) {
                hero.leftArm.shoulder.rotation.x += (-.3 - hero.leftArm.shoulder.rotation.x) * blend;
                hero.leftArm.shoulder.rotation.y += -hero.leftArm.shoulder.rotation.y * blend;
                hero.leftArm.shoulder.rotation.z += (-.2 - hero.leftArm.shoulder.rotation.z) * blend;
                hero.leftArm.elbow.rotation.x += (-.6 - hero.leftArm.elbow.rotation.x) * blend;
                hero.torso.rotation.y += -hero.torso.rotation.y * blend;
            }
        }
        if (!attack && bufferedAttack !== null) { const next = bufferedAttack; bufferedAttack = null; startAttack(next) }
        if (dodgeCooldown > 0) dodgeCooldown = Math.max(0, dodgeCooldown - dt);
        if (invulnerable > 0) invulnerable = Math.max(0, invulnerable - dt);
    }
    function updateJourney(dt) {
        companion.visual.position.y = Math.sin(time * 1.5) * .018;
        if (horizontalDistance(hero.root.position, companion.root.position) < 12 && !paused) {
            companion.root.rotation.y = Math.atan2(hero.root.position.x - companion.root.position.x, hero.root.position.z - companion.root.position.z);
        }
        for (const item of questShards) {
            if (!item.group.visible) continue;
            item.shard.rotation.y += dt * .7;
            item.shard.position.y = .8 + Math.sin(time * 2 + item.phase) * .11;
            if (horizontalDistance(hero.root.position, item.group.position) < 1.55) {
                journey.shardsFound[item.index] = true;
                journey.shardCount = journey.shardsFound.filter(Boolean).length;
                item.group.visible = false;
                toast('VESTÍGIO ANTIGO ENCONTRADO · ' + journey.shardCount + ' / 3', 1.15);
                saveProgress();
            }
        }
        routeCampFlame.rotation.y = Math.sin(time * 3) * .22;
        routeCampFlame.scale.y = 1.2 + Math.sin(time * 8) * .12;
        routeCampLight.intensity = 1.8 + Math.sin(time * 5) * .3;
        for (const ember of routeEmbers) {
            ember.mesh.position.set(
                routeCamp.position.x + Math.cos(ember.angle + time * .42) * ember.radius,
                .75 + (ember.height + time * ember.radius) % 2.2,
                routeCamp.position.z + Math.sin(ember.angle + time * .42) * ember.radius
            );
        }
        if (!bossActive) {
            for (const enemy of journeyEnemies) {
                if (!enemy.alive) continue;
                const dx = hero.root.position.x - enemy.root.position.x, dz = hero.root.position.z - enemy.root.position.z;
                const distance = Math.hypot(dx, dz) || .001;
                enemy.root.rotation.y = Math.atan2(dx, dz);
                enemy.healthBar.visible = distance < 16 || enemy.state !== 'idle';
                enemy.healthBar.rotation.y = yaw - enemy.root.rotation.y;
                const healthRatio = enemy.health / enemy.maxHealth;
                enemy.healthFill.scale.x = healthRatio;
                enemy.healthFill.position.x = (healthRatio - 1) * .485;
                enemy.warning.visible = enemy.state === 'windup';
                enemy.warning.material.opacity = .35 + .45 * (.5 + .5 * Math.sin(time * 13));
                enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
                if (enemy.state === 'idle') {
                    if (distance < 16 && distance > 2.1) {
                        enemy.root.position.x += dx / distance * enemy.speed * dt;
                        enemy.root.position.z += dz / distance * enemy.speed * dt;
                        enemy.model.legs.forEach((leg, index) => {
                            leg.rotation.x = Math.sin(time * 8 + index * Math.PI) * .28;
                        });
                    } else if (distance <= (enemy.type === 'guard' ? 2.9 : 2.35) && enemy.attackCooldown <= 0) {
                        enemy.state = 'windup';
                        enemy.timer = enemy.type === 'shade' ? .48 : .7;
                        enemy.model.pivot.rotation.x = -1.05;
                    }
                } else if (enemy.state === 'windup') {
                    enemy.timer -= dt;
                    if (enemy.timer <= 0) {
                        const reach = enemy.type === 'guard' ? 3.2 : 2.7;
                        const currentDistance = horizontalDistance(hero.root.position, enemy.root.position);
                        const facing = (Math.sin(enemy.root.rotation.y) * (hero.root.position.x - enemy.root.position.x) + Math.cos(enemy.root.rotation.y) * (hero.root.position.z - enemy.root.position.z)) / (currentDistance || 1);
                        if (currentDistance < reach && facing > .35) damagePlayer(enemy.damage, enemy.name.toUpperCase() + ' ATINGIU VOCÊ · ESQUIVE', enemy.root.position);
                        enemy.state = 'recover';
                        enemy.timer = .85;
                        enemy.attackCooldown = enemy.type === 'shade' ? 1.05 : 1.35;
                        enemy.model.pivot.rotation.x = .55;
                    }
                } else {
                    enemy.timer -= dt;
                    if (enemy.timer <= 0) {
                        enemy.state = 'idle';
                        enemy.model.pivot.rotation.set(-.2, 0, .2);
                    }
                }
            }
        }
        saveTimer += dt;
        if (saveTimer >= 12 && running && !bossActive) {
            saveTimer = 0;
            saveProgress();
        }
    }
    // Controla patrulha, sopro, raios, voo e recuperação do dragão.
    function updateBoss(dt) {
        boss.hitCooldown = Math.max(0, boss.hitCooldown - dt);
        const scale = boss.phase === 2 ? .7 : .62;
        boss.v.scale.lerp(new THREE.Vector3(scale, scale, scale), 1 - Math.exp(-8 * dt));
        if (!bossActive) return;
        if (!boss.alive) return;

        const dx = hero.root.position.x - boss.root.position.x, dz = hero.root.position.z - boss.root.position.z;
        const distance = Math.hypot(dx, dz);
        if (boss.state !== 'attack' || (boss.attackKind !== 'flight' && boss.attackKind !== 'fire')) boss.root.rotation.y = Math.atan2(dx, dz);
        boss.warning.visible = boss.state === 'windup' && (boss.attackKind === 'flight' || boss.attackKind === 'claw');
        boss.warning.material.opacity = .35 + .35 * (.5 + .5 * Math.sin(time * 16));
        boss.fireWarning.visible = boss.attackKind === 'fire' && (boss.state === 'windup' || boss.state === 'attack');
        boss.fireWarning.material.opacity = .28 + .3 * (.5 + .5 * Math.sin(time * 18));
        const infernoActive = boss.attackKind === 'inferno' && (boss.state === 'windup' || boss.state === 'attack');
        boss.infernoWarning.visible = infernoActive;
        boss.infernoWarning.material.opacity = boss.state === 'attack' ? .16 + .045 * Math.sin(time * 9) : .035 + .025 * Math.sin(time * 15);
        boss.infernoSafeSpot.visible = infernoActive;
        boss.flightFireWarning.visible = boss.alive && boss.attackKind === 'flight'
            && (boss.state === 'windup' || (boss.state === 'attack' && boss.timer / boss.flightDuration > .2));
        boss.flightFireWarning.position.x = boss.attackTarget.x;
        boss.flightFireWarning.position.z = boss.attackTarget.z;
        boss.flightFireWarning.material.opacity = .35 + .35 * (.5 + .5 * Math.sin(time * 18));
        const lightningElapsed = boss.state === 'attack' && boss.attackKind === 'lightning' ? boss.lightningDuration - boss.timer : 0;
        const lightningInterval = boss.lightningDuration / boss.lightningStrikeCount;
        const activeLightningIndex = boss.state === 'attack' ? Math.min(boss.lightningStrikeCount - 1, Math.floor(lightningElapsed / lightningInterval)) : -1;
        boss.lightningWarnings.forEach((marker, index) => {
            marker.visible = (boss.state === 'windup' || boss.state === 'attack') && boss.attackKind === 'lightning' && index < boss.lightningTargets.length;
            if (marker.visible) {
                marker.position.x = boss.lightningTargets[index].x;
                marker.position.z = boss.lightningTargets[index].z;
                marker.material.opacity = boss.state === 'attack' && index === activeLightningIndex ? .95 : .35 + .2 * (.5 + .5 * Math.sin(time * 12 + index));
                marker.material.color.setHex(boss.state === 'attack' && index === activeLightningIndex ? 0xff3322 : 0xffa52f);
            }
        });

        if (boss.state === 'idle') {
            boss.root.position.y = 0;
            if (distance > 5.3) {
                const speed = boss.phase === 2 ? 3.7 : 2.9;
                boss.root.position.x += dx / (distance || 1) * dt * speed;
                boss.root.position.z += dz / (distance || 1) * dt * speed;
            }
            boss.timer -= dt;
            if (boss.timer <= 0 && distance < 15) {
                const patterns = ['fire', 'lightning', 'claw', 'flight', 'inferno'];
                boss.attackKind = patterns[boss.attackCount++ % patterns.length];
                boss.state = 'windup';
                boss.attackResolved = false;
                boss.windupDuration = boss.attackKind === 'fire'
                    ? (boss.phase === 2 ? 1.25 : 1.5)
                    : boss.attackKind === 'inferno' ? 2.5
                        : boss.attackKind === 'lightning' ? (boss.phase === 2 ? 1.5 : 1.8)
                            : (boss.phase === 2 ? .78 : 1.05) + (boss.attackKind === 'flight' ? .2 : 0);
                boss.timer = boss.windupDuration;
                boss.attackTarget.copy(hero.root.position);
                boss.lightningTargets.length = 0;
                if (boss.attackKind === 'lightning') {
                    for (let i = 0; i < boss.lightningStrikeCount; i++) {
                        let target;
                        for (let attempt = 0; attempt < 40; attempt++) {
                            const angle = Math.random() * Math.PI * 2, radius = 5 + Math.sqrt(Math.random()) * (arenaBoundaryRadius - 8);
                            const x = Math.cos(angle) * radius, z = Math.sin(angle) * radius;
                            target = new THREE.Vector3(x, 0, z);
                            if (boss.lightningTargets.every(existing => horizontalDistance(existing, target) > 5.5)) break;
                        }
                        boss.lightningTargets.push(target);
                    }
                    boss.lightningResolved = boss.lightningTargets.map(() => false);
                    toast('RAIOS SE ESPALHAM PELO VALE · FUJA DAS MARCAS', 1.8);
                } else if (boss.attackKind === 'fire') toast('O DRAGÃO CARREGA O SOPRO DE FOGO', 1.1);
                else if (boss.attackKind === 'flight') toast('O DRAGÃO VAI SOPRAR NO AR E MERGULHAR · SAIA DA MARCA', 1.5);
                else if (boss.attackKind === 'inferno') toast('FOGO POR TODO O VALE · ABRIGUE-SE JUNTO AO BRASEIRO', 2);
                else toast('O DRAGÃO PREPARA UM GOLPE DE GARRA', 1);
            } else if (boss.timer <= 0) boss.timer = .25;
        } else if (boss.state === 'windup') {
            boss.timer -= dt;
            if (boss.attackKind === 'fire' || boss.attackKind === 'inferno') {
                boss.jaw.rotation.x = .2 + (1 - boss.timer / boss.windupDuration) * .42;
                boss.throat.intensity = 2 + (1 - boss.timer / boss.windupDuration) * 6;
            } else if (boss.attackKind === 'lightning') {
                boss.arms[1].rotation.x = -.9 * Math.sin((1 - boss.timer / boss.windupDuration) * Math.PI);
            } else if (boss.attackKind === 'flight') {
                boss.warning.scale.setScalar(1 + .18 * Math.sin(time * 16));
            } else {
                boss.arms[0].rotation.x = -1.1 * (1 - boss.timer / boss.windupDuration);
                boss.arms[1].rotation.x = -1.1 * (1 - boss.timer / boss.windupDuration);
            }
            if (boss.timer <= 0) {
                boss.state = 'attack';
                boss.timer = boss.attackKind === 'fire' ? 1.65 : boss.attackKind === 'lightning' ? boss.lightningDuration : boss.attackKind === 'flight' ? boss.flightDuration : boss.attackKind === 'inferno' ? boss.infernoDuration : .38;
                boss.attackStart.copy(boss.root.position);
                boss.attackDirection.set(Math.sin(boss.root.rotation.y), 0, Math.cos(boss.root.rotation.y));
                boss.attackResolved = false;
                boss.nextFire = time + .1; boss.fireHitCooldown = 0; boss.infernoHitCooldown = boss.attackKind === 'inferno' ? .55 : 0;
                shake = Math.max(shake, .18);
            }
        } else if (boss.state === 'attack') {
            boss.timer -= dt;
            const duration = boss.attackKind === 'fire' ? 1.65 : boss.attackKind === 'lightning' ? boss.lightningDuration : boss.attackKind === 'flight' ? boss.flightDuration : boss.attackKind === 'inferno' ? boss.infernoDuration : .38;
            const progress = clamp(1 - boss.timer / duration, 0, 1);
            const damageScale = boss.phase === 2 ? 1.25 : 1;
            if (boss.attackKind === 'fire') {
                const targetYaw = Math.atan2(dx, dz);
                const currentYaw = Math.atan2(boss.attackDirection.x, boss.attackDirection.z);
                const yawDelta = Math.atan2(Math.sin(targetYaw - currentYaw), Math.cos(targetYaw - currentYaw));
                const turnRate = boss.phase === 2 ? .85 : .65;
                const fireYaw = currentYaw + clamp(yawDelta, -turnRate * dt, turnRate * dt);
                boss.attackDirection.set(Math.sin(fireYaw), 0, Math.cos(fireYaw));
                boss.root.rotation.y = fireYaw;
                boss.jaw.rotation.x = .62;
                boss.throat.intensity = 7;
                if (time >= boss.nextFire) {
                    const spread = (Math.random() - .5) * .15;
                    const direction = boss.attackDirection.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), spread).normalize();
                    emitDragonFire(direction);
                    boss.nextFire = time + .055;
                }
                boss.fireHitCooldown = Math.max(0, boss.fireHitCooldown - dt);
                if (boss.fireHitCooldown <= 0 && distance < 9 && boss.attackDirection.x * dx / (distance || 1) + boss.attackDirection.z * dz / (distance || 1) > .82) {
                    boss.fireHitCooldown = .42;
                    damagePlayer(18 * damageScale, 'ATINGIDO PELO SOPRO · ESQUIVE PARA O LADO');
                }
            } else if (boss.attackKind === 'inferno') {
                boss.jaw.rotation.x = .62;
                boss.throat.intensity = 7;
                boss.infernoHitCooldown = Math.max(0, boss.infernoHitCooldown - dt);
                if (boss.infernoHitCooldown <= 0 && horizontalDistance(hero.root.position, boss.infernoSafeSpot.position) > 2.65) {
                    boss.infernoHitCooldown = .65;
                    damagePlayer(24 * damageScale, 'AS CHAMAS COBRIRAM O VALE · CORRA PARA O BRASEIRO');
                    shake = Math.max(shake, .22);
                }
            } else if (boss.attackKind === 'lightning') {
                const elapsed = duration - boss.timer;
                const strikeInterval = duration / boss.lightningStrikeCount;
                const strikeIndex = Math.min(boss.lightningStrikeCount - 1, Math.floor(elapsed / strikeInterval));
                const strikeProgress = elapsed - strikeIndex * strikeInterval;
                const target = boss.lightningTargets[strikeIndex];
                const attribute = boss.lightning.geometry.attributes.position, points = attribute.array;
                points.fill(0);
                boss.lightning.visible = strikeProgress < .2;
                if (boss.lightning.visible && target) {
                    let x = target.x, y = 9, z = target.z, offset = 0;
                    for (let segment = 0; segment < 8; segment++) {
                        const nextY = y - 1.12, nextX = x + (Math.random() - .5) * .48, nextZ = z + (Math.random() - .5) * .48;
                        points[offset++] = x; points[offset++] = y; points[offset++] = z;
                        points[offset++] = nextX; points[offset++] = nextY; points[offset++] = nextZ;
                        x = nextX; y = nextY; z = nextZ;
                    }
                    if (!boss.lightningResolved[strikeIndex]) {
                        boss.lightningResolved[strikeIndex] = true;
                        if (horizontalDistance(target, hero.root.position) < 2.1) damagePlayer(22 * damageScale, 'RAIO ATINGIU VOCÊ · DESVIE DA MARCA');
                        else if (invulnerable > 0) toast('ESQUIVA PERFEITA', .7);
                        shake = Math.max(shake, .5);
                    }
                }
                attribute.needsUpdate = true;
            } else if (boss.attackKind === 'flight') {
                const targetYaw = Math.atan2(dx, dz);
                const currentYaw = Math.atan2(boss.attackDirection.x, boss.attackDirection.z);
                const yawDelta = Math.atan2(Math.sin(targetYaw - currentYaw), Math.cos(targetYaw - currentYaw));
                const turnRate = boss.phase === 2 ? 2.5 : 2;
                const flightYaw = currentYaw + clamp(yawDelta, -turnRate * dt, turnRate * dt);
                boss.attackDirection.set(Math.sin(flightYaw), 0, Math.cos(flightYaw));
                boss.root.rotation.y = flightYaw;
                boss.root.position.x += boss.attackDirection.x * (boss.phase === 2 ? 9.2 : 8.2) * dt;
                boss.root.position.z += boss.attackDirection.z * (boss.phase === 2 ? 9.2 : 8.2) * dt;
                const flightDistance = Math.hypot(boss.root.position.x, boss.root.position.z);
                if (flightDistance > arenaBoundaryRadius - 1) {
                    boss.root.position.x *= (arenaBoundaryRadius - 1) / flightDistance;
                    boss.root.position.z *= (arenaBoundaryRadius - 1) / flightDistance;
                }
                boss.root.position.y = Math.sin(progress * Math.PI) * 4.4;
                boss.v.rotation.x = .12 + Math.sin(progress * Math.PI) * .12;
                boss.jaw.rotation.x = .56;
                boss.throat.intensity = 6.5;
                if (progress >= .18 && progress <= .78) {
                    if (time >= boss.nextFire) {
                        boss.head.updateWorldMatrix(true, false);
                        const mouth = boss.head.localToWorld(new THREE.Vector3(0, -.12, 1.25));
                        const target = new THREE.Vector3(hero.root.position.x, .65, hero.root.position.z);
                        emitDragonFire(target.sub(mouth).normalize());
                        boss.nextFire = time + .11;
                    }
                    boss.fireHitCooldown = Math.max(0, boss.fireHitCooldown - dt);
                    const flightDx = hero.root.position.x - boss.root.position.x, flightDz = hero.root.position.z - boss.root.position.z;
                    const flightDistanceToHero = Math.hypot(flightDx, flightDz);
                    const flightFacing = (flightDx * boss.attackDirection.x + flightDz * boss.attackDirection.z) / (flightDistanceToHero || 1);
                    if (boss.fireHitCooldown <= 0 && flightDistanceToHero < 8 && flightFacing > .8) {
                        boss.fireHitCooldown = .42;
                        damagePlayer(16 * damageScale, 'ATINGIDO PELO FOGO AÉREO · CORRA PARA O LADO');
                    }
                }
                if (!boss.attackResolved && progress >= .72) {
                    boss.attackResolved = true;
                    if (horizontalDistance(boss.root.position, hero.root.position) < 3.3) damagePlayer(42 * damageScale, 'ATINGIDO PELO MERGULHO · ESQUIVE');
                    else if (invulnerable > 0) toast('ESQUIVA PERFEITA', .7);
                    shake = Math.max(shake, .42);
                }
            } else {
                boss.arms[0].rotation.x = .65 + Math.sin(progress * Math.PI) * .35;
                boss.arms[1].rotation.x = .65 + Math.sin(progress * Math.PI) * .35;
                if (!boss.attackResolved && boss.timer <= 0) {
                    boss.attackResolved = true;
                    const facing = (dx * boss.attackDirection.x + dz * boss.attackDirection.z) / (distance || 1);
                    if (distance < 4.6 && facing > .4) damagePlayer(34 * damageScale, 'GARRAS DO DRAGÃO · ESQUIVE');
                    else if (invulnerable > 0) toast('ESQUIVA PERFEITA', .7);
                }
            }
            if (boss.timer <= 0) finishBossAttack();
        } else if (boss.state === 'recover') {
            boss.timer -= dt;
            boss.root.position.y += (0 - boss.root.position.y) * Math.min(1, dt * 7);
            boss.v.rotation.x += (0 - boss.v.rotation.x) * Math.min(1, dt * 7);
            boss.jaw.rotation.x += (0 - boss.jaw.rotation.x) * Math.min(1, dt * 7);
            boss.throat.intensity += (0 - boss.throat.intensity) * Math.min(1, dt * 7);
            boss.arms.forEach(arm => { arm.rotation.x += (0 - arm.rotation.x) * Math.min(1, dt * 7) });
            if (boss.timer <= 0) { boss.state = 'idle'; boss.timer = boss.phase === 2 ? .28 : .62 }
        }

        const bob = Math.sin(time * 1.8) * .06;
        for (let i = 0; i < boss.neckCount; i++) {
            const u = i / (boss.neckCount - 1);
            boss.neck[i].position.set(0, 2.1 + u * 1.3 + bob, 1.3 + u * 1.7);
            boss.neck[i].scale.setScalar(.4 - .17 * u);
        }
        boss.head.position.copy(boss.neck[boss.neckCount - 1].position);
        boss.head.rotation.y = 0;
        for (let i = 0; i < boss.tail.length; i++) {
            const u = i / boss.tail.length;
            boss.tail[i].position.set(Math.sin(i * .28 - time * 1.5) * (.1 + i * .07), 1.7 - i * .04 + u * u * 1.5, -1.5 - i * .55);
            boss.tail[i].scale.setScalar(.45 * (1 - u) + .06);
        }
        const wingBeat = boss.state === 'attack' && boss.attackKind === 'flight' ? Math.sin(time * 8) * .55 : Math.sin(time * 1.8) * .22;
        boss.wings[1].position.set(.65, 2.6 + bob, .1); boss.wings[0].position.set(-.65, 2.6 + bob, .1);
        boss.wings[1].rotation.set(.15 + wingBeat * .2, -wingBeat * .15, .15 + wingBeat);
        boss.wings[0].rotation.set(.15 + wingBeat * .2, wingBeat * .15, -.15 - wingBeat);
        for (let index = boss.fireStreams.length - 1; index >= 0; index--) {
            const stream = boss.fireStreams[index];
            stream.age += dt;
            stream.group.position.addScaledVector(stream.direction, 15 * dt);
            stream.group.scale.setScalar(.12 + stream.age * 2.7);
            if (stream.age > .72) { scene.remove(stream.group); boss.fireStreams.splice(index, 1) }
        }
    }
    function emitDragonFire(direction) {
        const chunk = new THREE.Group();
        boss.fireMaterials.forEach((material, index) => { const flame = new THREE.Mesh(boss.fireGeometry, material); flame.scale.setScalar(index === 0 ? .42 : index === 1 ? .7 : 1); chunk.add(flame) });
        boss.head.updateWorldMatrix(true, false);
        chunk.position.copy(boss.head.localToWorld(new THREE.Vector3(0, -.12, 1.25)));
        const normalizedDirection = direction.clone().normalize();
        chunk.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normalizedDirection);
        scene.add(chunk); boss.fireStreams.push({ group: chunk, direction: normalizedDirection, age: 0 });
    }
    // Controla saque, aproximação, golpes e recuperação do cavaleiro inimigo.
    function updateKnightBoss(dt) {
        boss.hitCooldown = Math.max(0, boss.hitCooldown - dt);
        const targetScale = boss.modelScale;
        boss.v.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 1 - Math.exp(-8 * dt));
        if (!boss.alive) return;

        const dx = hero.root.position.x - boss.root.position.x;
        const dz = hero.root.position.z - boss.root.position.z;
        const distance = Math.hypot(dx, dz);
        boss.root.rotation.y = Math.atan2(dx, dz);
        boss.warning.visible = boss.state === 'windup';
        boss.warning.material.opacity = .35 + .4 * (.5 + .5 * Math.sin(time * 16));

        if (boss.state === 'idle') {
            if (distance > 3.2) {
                const speed = boss.phase === 2 ? 4.2 : 3.1;
                boss.root.position.x += dx / (distance || 1) * dt * speed;
                boss.root.position.z += dz / (distance || 1) * dt * speed;
            }
            boss.timer -= dt;
            if (boss.timer <= 0 && distance < 9) {
                if (!boss.weaponDrawn) {
                    boss.state = 'draw';
                    boss.drawTimer = .82;
                    boss.sword.visible = true;
                    boss.sheath.visible = true;
                    toast('O CAVALEIRO SACA A ESPADA', 1.1);
                } else {
                    const patterns = boss.phase === 2
                        ? ['cleave', 'sweep', 'slam', 'charge', 'whirl']
                        : ['cleave', 'sweep', 'slam', 'charge'];
                    boss.attackKind = patterns[boss.attackCount++ % patterns.length];
                    boss.state = 'windup';
                    boss.timer = boss.phase === 2 ? .58 : .82;
                    boss.attackResolved = false;
                    boss.attackDirection.set(dx, 0, dz).normalize();
                    boss.attackStart.copy(boss.root.position);
                    boss.attackDuration = boss.attackKind === 'charge' ? .68 : boss.attackKind === 'whirl' ? .72 : .48;
                    const warningScale = { cleave: 1.15, sweep: 1.55, slam: 1.3, charge: .9, whirl: 1.8 };
                    boss.warning.scale.setScalar(warningScale[boss.attackKind]);
                    const warnings = {
                        cleave: 'O CAVALEIRO ARMA UM CORTE PESADO',
                        sweep: 'UM GOLPE LATERAL SE APROXIMA',
                        slam: 'O CAVALEIRO ERGUE A ESPADA',
                        charge: 'ELE VEM EM INVESTIDA',
                        whirl: 'PREPARE-SE PARA O GIRO DA ESPADA'
                    };
                    toast(warnings[boss.attackKind], 1);
                }
            } else if (boss.timer <= 0) boss.timer = .22;
        } else if (boss.state === 'draw') {
            boss.drawTimer -= dt;
            const progress = clamp(1 - boss.drawTimer / .82, 0, 1);
            const eased = progress * progress * (3 - 2 * progress);
            boss.pivot.position.lerpVectors(boss.drawPosition, boss.handPosition, eased);
            boss.pivot.rotation.set(-Math.PI / 2 * (1 - eased), 0, -.2 * (1 - eased));
            if (progress >= .78) boss.sheath.visible = false;
            if (boss.drawTimer <= 0) {
                boss.weaponDrawn = true;
                boss.pivot.position.copy(boss.handPosition);
                boss.pivot.rotation.set(0, 0, 0);
                boss.state = 'idle';
                boss.timer = .35;
            }
        } else if (boss.state === 'windup') {
            boss.timer -= dt;
            const progress = clamp(1 - boss.timer / (boss.phase === 2 ? .58 : .82), 0, 1);
            if (boss.attackKind === 'sweep' || boss.attackKind === 'whirl') {
                boss.pivot.rotation.y = -.8 - progress * .45;
                boss.v.rotation.z = .1;
            } else {
                boss.pivot.rotation.x = -.35 - progress * .75;
                boss.pivot.rotation.y = -.3;
            }
            if (boss.timer <= 0) {
                boss.state = 'attack';
                boss.timer = boss.attackDuration;
                boss.attackResolved = false;
                boss.attackStart.copy(boss.root.position);
                shake = Math.max(shake, .2);
            }
        } else if (boss.state === 'attack') {
            boss.timer -= dt;
            const progress = clamp(1 - boss.timer / boss.attackDuration, 0, 1);
            const damageScale = boss.phase === 2 ? 1.2 : 1;
            if (boss.attackKind === 'sweep') {
                boss.pivot.rotation.y = -1.25 + progress * 2.5;
                boss.pivot.rotation.x = .18;
            } else if (boss.attackKind === 'slam') {
                boss.pivot.rotation.x = -1.1 + progress * 2.35;
                boss.v.rotation.x = .06;
            } else if (boss.attackKind === 'charge') {
                boss.root.position.addScaledVector(boss.attackDirection, (boss.phase === 2 ? 10 : 8) * dt);
                boss.pivot.rotation.x = .55;
            } else if (boss.attackKind === 'whirl') {
                boss.pivot.rotation.y = -1 + progress * Math.PI * 2;
                boss.pivot.rotation.x = .15;
            } else {
                boss.pivot.rotation.y = -1.2 + progress * 2.45;
                boss.pivot.rotation.x = .22;
            }

            if (!boss.attackResolved && progress >= .62) {
                boss.attackResolved = true;
                const hitDx = hero.root.position.x - boss.root.position.x;
                const hitDz = hero.root.position.z - boss.root.position.z;
                const hitDistance = Math.hypot(hitDx, hitDz);
                const facing = (hitDx * boss.attackDirection.x + hitDz * boss.attackDirection.z) / (hitDistance || 1);
                const ranges = { cleave: 4.1, sweep: 5.1, slam: 4.3, charge: 3.8, whirl: 5.2 };
                const damage = { cleave: 28, sweep: 22, slam: 36, charge: 32, whirl: 30 };
                if (hitDistance < ranges[boss.attackKind] && (boss.attackKind === 'whirl' || facing > .25)) {
                    damagePlayer(damage[boss.attackKind] * damageScale, 'ATINGIDO PELA ESPADA · ESQUIVE');
                    shake = Math.max(shake, .38);
                } else if (invulnerable > 0) toast('ESQUIVA PERFEITA', .7);
            }
            if (boss.timer <= 0) finishBossAttack();
        } else if (boss.state === 'recover') {
            boss.timer -= dt;
            boss.v.rotation.x += (0 - boss.v.rotation.x) * Math.min(1, dt * 8);
            boss.v.rotation.z += (0 - boss.v.rotation.z) * Math.min(1, dt * 8);
            boss.pivot.rotation.x += (0 - boss.pivot.rotation.x) * Math.min(1, dt * 9);
            boss.pivot.rotation.y += (0 - boss.pivot.rotation.y) * Math.min(1, dt * 9);
            if (boss.timer <= 0) {
                boss.state = 'idle';
                boss.timer = boss.phase === 2 ? .25 : .48;
                boss.pivot.rotation.set(0, 0, 0);
            }
        }
        boss.v.position.y = boss.state === 'idle' ? Math.sin(time * 2) * .015 : 0;
        boss.cape.rotation.x = -.13 + Math.sin(time * 3) * .04;
    }

    // Aplica dano ao jogador e encerra a partida se necessário.
    function damagePlayer(damage, message, source = boss.root.position) {
        if (!running) return;
        if (invulnerable > 0) { toast('ESQUIVA PERFEITA', .7); return }
        const toBossX = source.x - hero.root.position.x, toBossZ = source.z - hero.root.position.z;
        const toBossDistance = Math.hypot(toBossX, toBossZ) || 1;
        const facing = (Math.sin(hero.root.rotation.y) * toBossX + Math.cos(hero.root.rotation.y) * toBossZ) / toBossDistance;
        if (hero.shieldDrawn && (keys.has('f') || mobileGuarding) && facing > .25) {
            damage *= .15;
            hero.guardImpact = .28;
            shake = .18;
            burst(hero.handShield.getWorldPosition(new THREE.Vector3()), 5);
            message = 'GOLPE BLOQUEADO · DEFESA COM ESCUDO';
        }
        hp = Math.max(0, hp - damage); shake = .48; toast(message, 1); setHud();
        if (hp <= 0) {
            hero.root.position.set(journey.checkpoint.x, 0, journey.checkpoint.z);
            hp = maxHealth; stamina = 100; flasks = maxFlasks; energyFlasks = maxEnergyFlasks;
            saveProgress();
            running = false; paused = true; $('pause').style.display = 'none'; $('end').style.display = 'flex'; $('endTitle').textContent = 'VOCÊ CAIU'; $('restart').style.display = 'block'; $('restart').textContent = 'Ressurgir na fogueira'; document.exitPointerLock?.()
        } else saveProgress();
    }
    function finishBossAttack() {
        boss.state = 'recover'; boss.timer = boss.phase === 2 ? .42 : .7; boss.warning.visible = false; boss.lightning.visible = false;
    }
    // Atualiza a simulação de cada quadro do jogo.
    function update(dt) {
        if (!running || paused) return;
        time += dt; toastTimer = Math.max(0, toastTimer - dt); if (toastTimer <= 0) $('toast').style.opacity = '0'; updateAmbience(dt);
        if (hitStop > 0) { hitStop -= dt; return }
        if (cinematicTimer > 0) {
            cinematicTimer = Math.max(0, cinematicTimer - dt); updateBoss(dt); updateCamera(dt);
            if (cinematicTimer <= 0) finishIntro();
            return;
        }
        updatePlayer(dt); updateJourney(dt); updateBoss(dt); resolveActorCollision(); updateCamera(dt); setHud(); shake = Math.max(0, shake - dt * 1.4);
    }
    // Desenha a cena continuamente.
    function frame(now) {
        requestAnimationFrame(frame); const dt = Math.min(.04, Math.max(0, (now - last) / 1000)); last = now;
        if (!paused) update(dt); else { time += dt * .15; updateAmbience(dt * .15) }
        renderer.render(scene, camera);
    }
    addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); renderer.setSize(innerWidth, innerHeight) });
    $('start').addEventListener('click', () => start()); $('skipIntro').addEventListener('click', finishIntro); $('resume').addEventListener('click', () => { paused = false; $('pause').style.display = 'none'; last = performance.now() }); $('backMenu').addEventListener('click', () => { saveProgress(); running = false; paused = true; cinematicTimer = 0; $('introScene').classList.remove('visible'); $('introScene').style.display = 'none'; $('pause').style.display = 'none'; $('hud').style.display = 'none'; $('menu').style.display = 'flex'; document.exitPointerLock?.() });
    $('restart').addEventListener('click', respawnAtCheckpoint); $('endMenu').addEventListener('click', () => { $('end').style.display = 'none'; $('hud').style.display = 'none'; $('menu').style.display = 'flex'; running = false; paused = true });
    $('controlsBtn').addEventListener('click', () => $('controlsPanel').style.display = 'flex'); $('controlsClose').addEventListener('click', () => $('controlsPanel').style.display = 'none');
    $('dialogueClose').addEventListener('click', () => closeOverlay('dialogue'));
    $('journalClose').addEventListener('click', () => closeOverlay('journal'));
    addEventListener('keydown', e => { if (running && cinematicTimer > 0 && [' ', 'enter'].includes(e.key.toLowerCase())) finishIntro() });
    document.querySelectorAll('[data-action]').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); if (b.dataset.action === 'attack') startAttack(); if (b.dataset.action === 'heavy') startAttack(true); if (b.dataset.action === 'dodge') doDodge(); if (b.dataset.action === 'lock') doLock(); if (b.dataset.action === 'flask') useFlask(); if (b.dataset.action === 'energyFlask') useEnergyFlask(); if (b.dataset.action === 'sword') toggleEquipment('sword'); if (b.dataset.action === 'shield') toggleEquipment('shield'); if (b.dataset.action === 'guard') mobileGuarding = true; if (b.dataset.action === 'interact') interactWithWorld() }));
    addEventListener('pointerup', () => { mobileGuarding = false });
    addEventListener('pointercancel', () => { mobileGuarding = false });
    const stick = $('stick'), knob = $('knob');
    stick.addEventListener('pointerdown', e => { activeTouch = { x: 0, y: 0 }; touchX = e.clientX; touchY = e.clientY; stick.setPointerCapture(e.pointerId) });
    stick.addEventListener('pointermove', e => { if (!activeTouch) return; const r = stick.getBoundingClientRect(), dx = clamp(e.clientX - touchX, -42, 42), dy = clamp(e.clientY - touchY, -42, 42); activeTouch = { x: dx / 42, y: dy / 42 }; knob.style.transform = `translate(${dx}px,${dy}px)` });
    function endTouch() { activeTouch = null; knob.style.transform = 'translate(0,0)' }
    stick.addEventListener('pointerup', endTouch); stick.addEventListener('pointercancel', endTouch);
    setInterval(() => { if (running && !paused && hp < 65 && Math.random() < .08) toast('VIGOR BAIXO · LEIA O PRÓXIMO GOLPE', 1) }, 2400);
    updateCamera(.016); requestAnimationFrame(frame);
})();
