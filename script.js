(() => {
    'use strict';
    const $ = id => document.getElementById(id);
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
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), mats.ground); ground.rotation.x = -Math.PI / 2; ground.position.y = -.12; ground.receiveShadow = true; scene.add(ground);
    const grid = new THREE.GridHelper(88, 44, 0x342c28, 0x292522); grid.position.y = -.105; grid.material.transparent = true; grid.material.opacity = .055; scene.add(grid);
    // Espalha pedras decorativas ao redor da arena.
    let seed = 79; const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 };
    const cameraBlockers = [];
    const stonePalette = [0x8a8278, 0x73706c, 0x999083, 0x706b66, 0x62615e].map(color => new THREE.MeshStandardMaterial({ color, map: mats.stone.map, bumpMap: mats.stone.map, bumpScale: .028, roughness: .96 }));
    for (let i = 0; i < 115; i++) { const x = (random() - .5) * 68, z = (random() - .5) * 68; if (Math.hypot(x, z) < 8) continue; const s = .4 + random() * 1.8, p = box(scene, stonePalette[Math.floor(random() * stonePalette.length)], [x, -.01 + random() * .08, z], [s, .08 + random() * .12, s * (.6 + random())], false, true); p.rotation.y = random() * Math.PI; p.rotation.x = (random() - .5) * .05 }
    const pillars = [];
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, r = 15 + (i % 3) * 1.3, x = Math.cos(a) * r, z = Math.sin(a) * r; const p = new THREE.Group(); p.position.set(x, 0, z); cylinder(p, mats.darkStone, [0, 1.4, 0], .72, .92, 2.8, 7); cylinder(p, mats.stone, [0, 2.7, 0], 1.05, 1, .32, 7); cylinder(p, mats.gold, [0, .12, 0], 1, .92, .22, 7); scene.add(p); cameraBlockers.push(p); pillars.push({ x, z, r: .95 }) }
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
        const a = i / 8 * Math.PI * 2, r = 25 + (i % 3) * 1.2, x = Math.cos(a) * r, z = Math.sin(a) * r;
        const group = new THREE.Group(); group.position.set(x, 0, z);
        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(.8 + (i % 3) * .18, 0), i % 2 ? mats.cyan : mats.violet); crystal.position.y = .95; crystal.scale.set(.72, 1.7, .72); crystal.rotation.y = a; crystal.castShadow = true; group.add(crystal);
        const base = cylinder(group, mats.darkStone, [0, .12, 0], .72, .88, .25, 6);
        const glint = new THREE.Mesh(new THREE.OctahedronGeometry(.28, 0), mats.gold); glint.position.set(.35, .52, 0); group.add(glint);
        scene.add(group); crystals.push({ group, crystal, phase: random() * Math.PI * 2, base });
    }
    const graveMarkers = [];
    for (let i = 0; i < 7; i++) {
        const a = i / 7 * Math.PI * 2, r = 23 + (i % 2) * 2, x = Math.cos(a) * r, z = Math.sin(a) * r;
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
    // Monta o personagem e prende a espada ao braço.
    function makeHero() {
        const root = new THREE.Group(), visual = new THREE.Group(); root.add(visual); scene.add(root);
        const torso = new THREE.Group(); torso.position.y = 1.12; visual.add(torso);
        const armor = new THREE.Group(); torso.add(armor);
        cylinder(armor, mats.cloth, [0, -.04, 0], .42, .38, .9, 7);
        cylinder(armor, mats.metal, [0, .05, 0], .39, .38, .57, 7);
        const head = new THREE.Mesh(new THREE.IcosahedronGeometry(.31, 1), mats.metal); head.position.set(0, .8, .02); head.castShadow = true; torso.add(head);
        const visor = box(torso, mats.darkStone, [0, .82, .27], [.39, .1, .09]); visor.castShadow = true;
        for (const x of [-.42, .42]) { const shoulder = cylinder(torso, mats.metal, [x, .36, 0], .25, .3, .28, 6); shoulder.rotation.z = x < 0 ? -.2 : .2 }
        const cape = new THREE.Mesh(new THREE.ConeGeometry(.48, .95, 5, 1, true), mats.red); cape.position.set(0, 1.04, -.32); cape.rotation.x = -.14; cape.castShadow = true; visual.add(cape);
        for (const x of [-.19, .19]) { const leg = cylinder(visual, mats.darkStone, [x, .42, 0], .14, .18, .66, 6); leg.userData.legSide = x }
        const pivot = new THREE.Group(); pivot.position.set(.5, .29, .03); torso.add(pivot);
        const arm = cylinder(torso, mats.metal, [.48, .04, -.015], .12, .15, .55, 6); arm.rotation.z = -.12;
        makeSword(pivot, .78);
        box(torso, mats.gold, [-.48, .06, .1], [.09, .55, .35]);
        return { root, visual, torso, pivot, legs: visual.children.filter(x => x.userData.legSide !== undefined), cape, head };
    }
    const hero = makeHero(); hero.root.position.set(0, 0, 3);
    // Monta o chefe, a arma e os indicadores de seus ataques.
    function makeBoss() {
        const root = new THREE.Group(), v = new THREE.Group(); root.add(v); scene.add(root);
        const cloak = new THREE.Mesh(new THREE.ConeGeometry(.92, 1.95, 7, 1, true), mats.red); cloak.position.set(0, 1.28, -.38); cloak.rotation.x = -.08; cloak.castShadow = true; v.add(cloak);
        cylinder(v, mats.enemy, [0, 1.35, 0], .73, .63, 1.65, 7);
        const chest = cylinder(v, mats.metal, [0, 1.55, .02], .77, .68, .68, 7);
        cylinder(v, mats.darkStone, [0, 1.08, .04], .7, .64, .2, 7);
        const head = new THREE.Mesh(new THREE.IcosahedronGeometry(.48, 1), mats.darkStone); head.position.set(0, 2.42, .05); head.castShadow = true; v.add(head);
        const visor = box(v, mats.metal, [0, 2.39, .47], [.62, .16, .12]); visor.rotation.z = -.05;
        for (const x of [-.55, .55]) {
            const horn = new THREE.Mesh(new THREE.ConeGeometry(.14, .92, 5), mats.darkStone); horn.position.set(x, 2.88, -.02); horn.rotation.z = x < 0 ? -.48 : .48; horn.castShadow = true; v.add(horn);
            const pauldron = cylinder(v, mats.enemy, [x * 1.55, 1.98, 0], .38, .46, .58, 6); pauldron.rotation.z = x < 0 ? -.28 : .28;
            const spike = new THREE.Mesh(new THREE.ConeGeometry(.13, .5, 5), mats.metal); spike.position.set(x * 1.8, 2.35, 0); spike.rotation.z = x < 0 ? -.62 : .62; v.add(spike);
            const arm = cylinder(v, mats.darkStone, x > 0 ? [.82, 1.48, .18] : [x * 1.14, 1.32, .08], .2, .26, .85, 6); arm.rotation.z = x > 0 ? -.35 : (x < 0 ? -.12 : .12);
        }
        cylinder(v, mats.gold, [-.55, 2.05, .05], .23, .38, .34, 5).rotation.z = .45;
        cylinder(v, mats.gold, [.55, 2.05, .05], .23, .38, .34, 5).rotation.z = -.45;
        for (const x of [-.23, .23]) { const eye = new THREE.Mesh(new THREE.SphereGeometry(.07, 6, 5), mats.eye); eye.position.set(x, 2.45, .46); v.add(eye) }
        const seal = new THREE.Mesh(new THREE.RingGeometry(.19, .28, 8), new THREE.MeshBasicMaterial({ color: 0x9a4930, transparent: true, opacity: .8, side: THREE.DoubleSide })); seal.position.set(0, 1.57, .72); v.add(seal);
        const weapon = new THREE.Group(); weapon.position.set(.94, 1.47, .24); v.add(weapon); makeSword(weapon, 1.25);
        const warning = new THREE.Mesh(new THREE.RingGeometry(3.05, 3.3, 64), new THREE.MeshBasicMaterial({ color: 0xff554b, transparent: true, opacity: .8, side: THREE.DoubleSide, depthWrite: false })); warning.rotation.x = -Math.PI / 2; warning.position.y = .025; warning.visible = false; root.add(warning);
        const shockwave = new THREE.Mesh(new THREE.RingGeometry(.72, .92, 64), new THREE.MeshBasicMaterial({ color: 0xc34b36, transparent: true, opacity: .85, side: THREE.DoubleSide, depthWrite: false })); shockwave.rotation.x = -Math.PI / 2; shockwave.position.y = .04; shockwave.visible = false; root.add(shockwave);
        root.position.set(0, 0, -8); v.scale.setScalar(1.82); return { root, v, weapon, warning, shockwave, size: 1.82, hp: 860, maxHp: 860, state: 'idle', timer: 1.8, phase: 1, alive: true, hitCooldown: 0, attackCount: 0, attackKind: 'cleave', attackResolved: false, comboStep: 0, attackDirection: new THREE.Vector3() };
    }
    const boss = makeBoss();
    const lantern = new THREE.PointLight(0x8c6441, .22, 7, 2); lantern.position.set(0, 1.8, 0); hero.root.add(lantern);
    const keys = new Set(); let yaw = 0, lockYawOffset = 0, pitch = .18, mouseLocked = false, mouseDragging = false, lastMouseX = 0, lastMouseY = 0, paused = true, running = false, last = performance.now(), time = 0, stamina = 100, hp = 120, attack = null, bufferedAttack = null, dodge = 0, dodgeCooldown = 0, lockOn = true, invulnerable = 0, shake = 0, toastTimer = 0, hitStop = 0, walkPhase = 0, cinematicTimer = 0;
    const camTarget = new THREE.Vector3(), desiredCamera = new THREE.Vector3(), cameraBasePosition = new THREE.Vector3(), cameraLookTarget = new THREE.Vector3(), cameraRayDirection = new THREE.Vector3(), cameraRight = new THREE.Vector3(), forward = new THREE.Vector3(), right = new THREE.Vector3(), moveDir = new THREE.Vector3(), temp = new THREE.Vector3(), cameraRaycaster = new THREE.Raycaster(), clock = new THREE.Clock();
    let cameraInitialized = false;
    let activeTouch = null, touchX = 0, touchY = 0;
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
    function setHud() { const h = Math.max(0, hp / 120 * 100), s = Math.max(0, stamina); $('hp').firstElementChild.style.width = h + '%'; $('stamina').firstElementChild.style.width = s + '%'; $('hpText').textContent = Math.ceil(hp) + ' / 120'; $('stText').textContent = Math.ceil(stamina) + ' / 100'; $('bossBar').firstElementChild.style.width = Math.max(0, boss.hp / boss.maxHp * 100) + '%'; $('bossName').textContent = boss.phase === 2 ? 'CAVALEIRO DO LUTO · IRA DESPERTA' : 'CAVALEIRO DO LUTO' }
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
        const grip = hero.pivot.localToWorld(new THREE.Vector3(0, -.03, .1));
        const tip = hero.pivot.localToWorld(new THREE.Vector3(0, -.03, 1.58));
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
    // Impede o jogador de atravessar o corpo do chefe.
    function resolveActorCollision() {
        if (!boss.alive) return;
        let dx = hero.root.position.x - boss.root.position.x, dz = hero.root.position.z - boss.root.position.z;
        let distance = Math.hypot(dx, dz);
        const minimumDistance = boss.size * 1.3;
        if (distance >= minimumDistance) return;
        if (distance < .001) { dx = Math.sin(hero.root.rotation.y); dz = Math.cos(hero.root.rotation.y); distance = 1 }
        hero.root.position.x = boss.root.position.x + dx / distance * minimumDistance;
        hero.root.position.z = boss.root.position.z + dz / distance * minimumDistance;
    }
    // Reinicia os atributos e inicia a apresentação da luta.
    function start() {
        running = true; paused = false; last = performance.now(); hp = 120; stamina = 100; dodge = 0; dodgeCooldown = 0; attack = null; bufferedAttack = null; hitStop = 0; cinematicTimer = 5.8;
        boss.hp = boss.maxHp; boss.alive = true; boss.state = 'intro'; boss.timer = 1.4; boss.phase = 1; boss.size = 1.82; boss.attackCount = 0; boss.attackKind = 'cleave'; boss.attackResolved = false; boss.comboStep = 0; boss.v.rotation.set(0, 0, 0); boss.v.position.y = 0; boss.v.scale.setScalar(boss.size); boss.weapon.rotation.set(0, 0, 0); boss.warning.visible = false; boss.shockwave.visible = false; boss.root.position.set(0, 0, -8); hero.root.position.set(0, 0, 4); hero.root.rotation.y = Math.PI; hero.torso.rotation.set(0, 0, 0); hero.pivot.rotation.set(0, 0, 0); yaw = 0; lockYawOffset = 0; pitch = .18; lockOn = true; shake = 0; cameraInitialized = false;
        $('menu').style.display = 'none'; $('pause').style.display = 'none'; $('end').style.display = 'none'; $('hud').style.display = 'block'; $('hud').style.visibility = 'hidden'; $('bossHud').style.display = 'none'; $('introScene').style.display = 'flex'; requestAnimationFrame(() => $('introScene').classList.add('visible')); updateCamera(1); setHud();
    }
    // Encerra a cena de entrada e libera o combate.
    function finishIntro() {
        if (cinematicTimer <= 0) return;
        cinematicTimer = 0; boss.state = 'idle'; boss.timer = .42; $('introScene').classList.remove('visible'); setTimeout(() => $('introScene').style.display = 'none', 900); $('hud').style.visibility = 'visible'; $('bossHud').style.display = 'block'; cameraInitialized = false; toast('A LUTA COMEÇA', 1.2);
    }
    function hitBoss(damage) {
        if (!boss.alive || boss.hitCooldown > 0) return;
        boss.hp = Math.max(0, boss.hp - damage); boss.hitCooldown = .12; shake = Math.max(shake, damage > 40 ? .42 : .25); boss.v.scale.set(boss.size * 1.08, boss.size * .94, boss.size * 1.08);
        burst(boss.root.position.clone().add(new THREE.Vector3(0, 1.5, 0)), damage > 40 ? 16 : 9);
        toast(damage > 40 ? 'GOLPE PESADO · ' + damage : 'IMPACTO · ' + damage, .65);
        if (boss.phase === 1 && boss.hp <= boss.maxHp * .5) { boss.phase = 2; boss.size = 1.96; boss.v.scale.setScalar(boss.size * 1.16); shake = .65; burst(boss.root.position.clone().add(new THREE.Vector3(0, 2, 0)), 28); toast('A IRA DESPERTA · FASE II', 1.8) }
        if (boss.hp <= 0) { boss.alive = false; boss.state = 'dead'; boss.warning.visible = false; boss.shockwave.visible = false; boss.v.rotation.z = -.9; boss.v.position.y = -.35; $('end').style.display = 'flex'; document.exitPointerLock?.() }
        setHud();
    }
    // Inicia um golpe leve ou pesado do jogador.
    function startAttack(heavy = false) {
        if (!running || paused || cinematicTimer > 0 || !hero.root || dodge > 0) return;
        if (attack) { const remaining = attack.wind + attack.active + attack.recovery - attack.t; if (remaining <= .34) bufferedAttack = heavy; return }
        const cost = heavy ? 28 : 12; if (stamina < cost) { toast('SEM RESISTÊNCIA', .8); return }
        if (lockOn && boss.alive) hero.root.rotation.y = Math.atan2(boss.root.position.x - hero.root.position.x, boss.root.position.z - hero.root.position.z);
        stamina -= cost; attack = { heavy, t: 0, wind: heavy ? .44 : .2, active: heavy ? .26 : .2, recovery: heavy ? .64 : .38, hit: false, previousGrip: null, previousTip: null }; hero.pivot.rotation.y = heavy ? -1.45 : -1.05; setHud();
        if (!mouseLocked && location.protocol !== 'file:' && renderer.domElement.requestPointerLock) { try { const request = renderer.domElement.requestPointerLock(); if (request && typeof request.catch === 'function') request.catch(() => toast('Arraste para girar a câmera', 1)) } catch (_) { toast('Arraste para girar a câmera', 1) } }
    }
    // Executa a esquiva e concede invulnerabilidade temporária.
    function doDodge() {
        if (!running || paused || cinematicTimer > 0 || dodge > 0 || dodgeCooldown > 0 || stamina < 22) return;
        stamina -= 22; dodge = .42; dodgeCooldown = .62; invulnerable = .42; attack = null; hero.pivot.rotation.set(0, 0, 0); hero.torso.rotation.set(0, 0, 0); slashEffect(true); toast('ESQUIVA', .45); setHud();
    }
    function doLock() {
        if (cinematicTimer > 0) return;
        if (!lockOn && boss.alive) lockYawOffset = Math.atan2(Math.sin(yaw - Math.atan2(hero.root.position.x - boss.root.position.x, hero.root.position.z - boss.root.position.z)), Math.cos(yaw - Math.atan2(hero.root.position.x - boss.root.position.x, hero.root.position.z - boss.root.position.z)));
        lockOn = !lockOn; toast(lockOn ? 'ALVO TRAVADO' : 'CÂMERA LIVRE', .7)
    }
    function onKeyDown(e) {
        const k = e.key.toLowerCase(); if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'tab'].includes(k)) e.preventDefault();
        if (k === 'escape') { if ($('menu').style.display === 'flex') return; if ($('end').style.display === 'flex') return; if (paused) { paused = false; $('pause').style.display = 'none'; last = performance.now() } else { paused = true; $('pause').style.display = 'flex'; document.exitPointerLock?.() } return }
        if (e.repeat) return; keys.add(k); if (k === ' ') { doDodge() } if (k === 'tab') { doLock() } if (k === 'f') { if (hp < 120) { hp = Math.min(120, hp + 42); toast('FRASCO · VIDA RESTAURADA', 1); setHud() } else toast('VIDA COMPLETA', .7) }
    }
    function onKeyUp(e) { keys.delete(e.key.toLowerCase()) }
    addEventListener('keydown', onKeyDown); addEventListener('keyup', onKeyUp);
    renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());
    renderer.domElement.addEventListener('mousedown', e => { mouseDragging = true; lastMouseX = e.clientX; lastMouseY = e.clientY; if (e.button === 0) startAttack(false); if (e.button === 2) startAttack(true) });
    addEventListener('mouseup', () => { mouseDragging = false });
    renderer.domElement.addEventListener('pointerlockchange', () => { mouseLocked = document.pointerLockElement === renderer.domElement });
    addEventListener('mousemove', e => { if (mouseLocked || mouseDragging) { const dx = mouseLocked ? e.movementX : e.clientX - lastMouseX, dy = mouseLocked ? e.movementY : e.clientY - lastMouseY; lastMouseX = e.clientX; lastMouseY = e.clientY; if (lockOn && boss.alive) lockYawOffset -= dx * .0022; else yaw -= dx * .0022; pitch = clamp(pitch + dy * .0018, -.12, .48) } });
    // Move a câmera e mantém o chefe enquadrado durante a luta.
    function updateCamera(dt) {
        if (cinematicTimer > 0) {
            const progress = 1 - cinematicTimer / 5.8;
            camera.position.set(7.5 - 1.6 * progress, 4.2 + Math.sin(progress * Math.PI) * .45, .2 + progress);
            camera.lookAt(0, 3.05, -8);
            return;
        }
        camTarget.set(hero.root.position.x, hero.root.position.y + 1.4, hero.root.position.z);
        const bossDistance = horizontalDistance(hero.root.position, boss.root.position);
        if (lockOn && boss.alive) {
            const targetYaw = Math.atan2(hero.root.position.x - boss.root.position.x, hero.root.position.z - boss.root.position.z) + lockYawOffset;
            const yawDelta = Math.atan2(Math.sin(targetYaw - yaw), Math.cos(targetYaw - yaw));
            yaw += yawDelta * (1 - Math.exp(-5 * dt));
        }
        const dist = lockOn && boss.alive ? clamp(11.2 + Math.max(0, bossDistance - 3) * .1, 11.2, 12.8) : 9.2;
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
        if (lockOn && boss.alive && bossDistance < 24) {
            temp.set(boss.root.position.x, boss.root.position.y + 3.05, boss.root.position.z);
            cameraLookTarget.lerp(temp, .24);
        }
        camera.position.copy(cameraBasePosition);
        cameraRight.set(Math.cos(yaw), 0, -Math.sin(yaw));
        if (shake > 0) { camera.position.addScaledVector(cameraRight, Math.sin(time * 75) * shake); camera.position.y += Math.cos(time * 61) * shake * .32 }
        camera.lookAt(cameraLookTarget);
    }
    // Processa movimento, colisões e animações do jogador.
    function updatePlayer(dt) {
        let sx = (keys.has('d') ? 1 : 0) - (keys.has('a') ? 1 : 0), sz = (keys.has('s') ? 1 : 0) - (keys.has('w') ? 1 : 0);
        if (activeTouch) { sx = activeTouch.x; sz = activeTouch.y }
        moveDir.set(0, 0, 0);
        forward.set(-Math.sin(yaw), 0, -Math.cos(yaw)); right.set(Math.cos(yaw), 0, -Math.sin(yaw));
        moveDir.addScaledVector(right, sx).addScaledVector(forward, -sz);
        if (moveDir.lengthSq() > 1) moveDir.normalize();
        const moving = moveDir.lengthSq() > .01, sprinting = keys.has('shift') && moving && stamina > 0 && !dodge;
        if (sprinting) stamina = Math.max(0, stamina - dt * 20); else if (!attack && !dodge) stamina = Math.min(100, stamina + dt * 23);
        const speed = (sprinting ? 8.8 : 6.2) * (attack ? .78 : 1);
        if (dodge > 0) { const u = dodge / .42; hero.root.position.addScaledVector(moveDir.lengthSq() > .01 ? moveDir : forward, speed * 2.15 * dt * (.4 + u)); dodge = Math.max(0, dodge - dt) }
        else if (moving) { hero.root.position.addScaledVector(moveDir, speed * dt); hero.root.rotation.y = Math.atan2(moveDir.x, moveDir.z) }
        // Mantém o jogador dentro da arena e longe dos pilares.
        hero.root.position.x = clamp(hero.root.position.x, -39, 39); hero.root.position.z = clamp(hero.root.position.z, -39, 39);
        for (const p of pillars) { const dx = hero.root.position.x - p.x, dz = hero.root.position.z - p.z, d = Math.hypot(dx, dz), min = p.r + .42; if (d < min && d > 0) { hero.root.position.x = p.x + dx / d * min; hero.root.position.z = p.z + dz / d * min } }
        for (const g of graveMarkers) { const dx = hero.root.position.x - g.marker.position.x, dz = hero.root.position.z - g.marker.position.z, d = Math.hypot(dx, dz), min = .72; if (d < min && d > 0) { hero.root.position.x = g.marker.position.x + dx / d * min; hero.root.position.z = g.marker.position.z + dz / d * min } }
        walkPhase += dt * (sprinting ? 13 : moving ? 9 : 2);
        hero.visual.position.y = moving ? Math.abs(Math.sin(walkPhase)) * .045 : Math.sin(time * 1.8) * .018;
        hero.legs.forEach(leg => { leg.rotation.x = moving ? Math.sin(walkPhase + (leg.userData.legSide > 0 ? Math.PI : 0)) * .48 : 0 });
        hero.cape.rotation.x = -.13 + (moving ? Math.sin(walkPhase) * .12 : Math.sin(time * 1.6) * .035);
        if (attack) {
            attack.t += dt;
            const total = attack.wind + attack.active + attack.recovery;
            if (attack.t < attack.wind) {
                const u = attack.t / attack.wind; hero.pivot.rotation.y = (attack.heavy ? -1.55 : -1.18) + u * (attack.heavy ? .16 : .22);
                hero.pivot.rotation.x = attack.heavy ? -.18 * u : -.1 * u; hero.torso.rotation.x = -.07 * u; hero.torso.rotation.z = -.035 * u;
            }
            else if (attack.t < attack.wind + attack.active) {
                const u = (attack.t - attack.wind) / attack.active, eased = u * u * (3 - 2 * u);
                hero.pivot.rotation.y = (attack.heavy ? -1.39 : -.96) + eased * (attack.heavy ? 2.85 : 2.18);
                hero.pivot.rotation.x = -.12 + Math.sin(u * Math.PI) * .17; hero.torso.rotation.x = .1 + Math.sin(u * Math.PI) * .08; hero.torso.rotation.z = Math.sin(u * Math.PI) * .045;
                if (!attack.hit && boss.alive && attackHitsBoss(attack)) { attack.hit = true; slashEffect(attack.heavy); hitBoss(attack.heavy ? 45 : 30) }
            } else {
                const u = clamp((attack.t - attack.wind - attack.active) / attack.recovery, 0, 1), settle = u * u * (3 - 2 * u);
                hero.pivot.rotation.y = (attack.heavy ? 1.46 : 1.22) * (1 - settle); hero.pivot.rotation.x = (attack.heavy ? .05 : .025) * (1 - settle);
                hero.torso.rotation.x = .12 * (1 - settle); hero.torso.rotation.z = .035 * (1 - settle);
            }
            if (attack.t >= total) { attack = null; hero.pivot.rotation.set(0, 0, 0); hero.torso.rotation.set(0, 0, 0) }
        }
        if (!attack && bufferedAttack !== null) { const next = bufferedAttack; bufferedAttack = null; startAttack(next) }
        if (dodgeCooldown > 0) dodgeCooldown = Math.max(0, dodgeCooldown - dt);
        if (invulnerable > 0) invulnerable = Math.max(0, invulnerable - dt);
    }
    // Controla aproximação, fases, ataques e recuperação do chefe.
    function updateBoss(dt) {
        boss.warning.visible = boss.alive && boss.state === 'windup';
        boss.warning.material.opacity = .38 + (.42 * (.5 + .5 * Math.sin(time * 18)));
        if (!boss.alive) return;
        boss.hitCooldown = Math.max(0, boss.hitCooldown - dt);
        boss.v.scale.lerp(new THREE.Vector3(boss.size, boss.size, boss.size), 1 - Math.exp(-8 * dt));
        const d = horizontalDistance(boss.root.position, hero.root.position), dx = hero.root.position.x - boss.root.position.x, dz = hero.root.position.z - boss.root.position.z;
        boss.root.rotation.y = Math.atan2(dx, dz);
        if (boss.state === 'idle') {
            if (d > 3.25) { const n = Math.hypot(dx, dz) || 1, speed = boss.phase === 2 ? 4.05 : 3.05; boss.root.position.x += dx / n * dt * speed; boss.root.position.z += dz / n * dt * speed }
            boss.timer -= dt;
            if (boss.timer <= 0 && d < 8) {
                const patterns = boss.phase === 2 ? ['cleave', 'sweep', 'slam', 'charge', 'ashwave', 'combo'] : ['cleave', 'sweep', 'slam', 'charge'];
                boss.attackCount++; boss.attackKind = patterns[(boss.attackCount - 1) % patterns.length]; boss.state = 'windup';
                boss.timer = (boss.phase === 2 ? .62 : .88) + (boss.attackKind === 'charge' ? .12 : 0);
                boss.attackDuration = boss.attackKind === 'ashwave' ? .62 : boss.attackKind === 'charge' ? .58 : .34;
                boss.attackResolved = false; boss.comboStep = 0;
                const warningScale = { cleave: 1.15, sweep: 1.55, slam: 1.35, charge: .9, ashwave: 2, combo: 1.4 };
                boss.warning.scale.setScalar(warningScale[boss.attackKind] || 1);
                boss.weapon.rotation.x = boss.attackKind === 'sweep' ? .3 : -1.25;
                toast(({ cleave: 'O CAVALEIRO ARMA UM CORTE PESADO', sweep: 'UM ARCO DE AÇO SE APROXIMA', slam: 'O GOLPE VAI RACHAR O CHÃO', charge: 'ELE VEM EM INVESTIDA', ashwave: 'AS CINZAS SE ERGUEM AO REDOR', combo: 'ELE PREPARA UM COMBO' })[boss.attackKind], 1);
            } else if (boss.timer <= 0) boss.timer = .2;
        } else if (boss.state === 'windup') {
            boss.timer -= dt;
            boss.weapon.rotation.x = (boss.attackKind === 'charge' ? -1.35 : -1.55) + Math.sin(time * 12) * .045;
            boss.v.rotation.z = boss.attackKind === 'sweep' ? .16 : 0;
            if (boss.timer <= 0) {
                boss.state = 'attack'; boss.timer = boss.attackDuration; boss.attackResolved = false;
                boss.attackDirection.set(dx, 0, dz).normalize(); boss.weapon.rotation.z = 0; shake = .28;
                boss.shockwave.visible = boss.attackKind === 'slam' || boss.attackKind === 'ashwave';
                boss.shockwave.scale.setScalar(.25); boss.shockwave.material.opacity = .9;
            }
        } else if (boss.state === 'attack') {
            boss.timer -= dt;
            const progress = clamp(1 - boss.timer / boss.attackDuration, 0, 1);
            if (boss.attackKind === 'sweep') { boss.weapon.rotation.z = -1.1 + progress * 2.2; boss.weapon.rotation.x = .25 }
            else if (boss.attackKind === 'slam') { boss.weapon.rotation.x = -1.2 + progress * 2.65; boss.v.rotation.x = .08 }
            else if (boss.attackKind === 'charge') {
                boss.root.position.addScaledVector(boss.attackDirection, (boss.phase === 2 ? 13 : 10.5) * dt);
                boss.weapon.rotation.x = .45; boss.v.position.y = Math.sin(progress * Math.PI) * .35;
            } else if (boss.attackKind === 'ashwave') {
                boss.weapon.rotation.x = 1.05 + Math.sin(time * 16) * .08;
                boss.shockwave.scale.setScalar(.25 + progress * 2.1); boss.shockwave.material.opacity = Math.max(0, .9 - progress * .65);
            } else if (boss.attackKind === 'combo') { boss.weapon.rotation.z = Math.sin(progress * Math.PI * 2) * .85; boss.weapon.rotation.x = .45 }
            else { boss.weapon.rotation.x = .5; boss.weapon.rotation.z = Math.sin(progress * Math.PI) * .85 }
            const attackRanges = { cleave: 4.3, sweep: 5.1, slam: 4.7, charge: 3.4, ashwave: 6.4, combo: 4.4 };
            const attackDamage = { cleave: 24, sweep: 19, slam: 30, charge: 27, ashwave: 23, combo: 15 };
            if (boss.attackKind === 'combo') {
                if (boss.timer <= 0) {
                    if (horizontalDistance(boss.root.position, hero.root.position) < attackRanges.combo) damagePlayer(attackDamage.combo * (boss.phase === 2 ? 1.15 : 1), 'COMBO · ESQUIVE O PRÓXIMO CORTE');
                    boss.comboStep++;
                    if (boss.comboStep < 2) { boss.timer = .34; boss.attackDuration = .34; boss.weapon.rotation.z = -boss.weapon.rotation.z }
                    else finishBossAttack();
                }
            } else if (boss.timer <= 0 && !boss.attackResolved) {
                boss.attackResolved = true;
                if (horizontalDistance(boss.root.position, hero.root.position) < attackRanges[boss.attackKind]) damagePlayer(attackDamage[boss.attackKind] * (boss.phase === 2 ? 1.18 : 1), 'ATINGIDO · ESQUIVE NO TEMPO CERTO');
                else if (invulnerable > 0) toast('ESQUIVA PERFEITA', .7);
                finishBossAttack();
            }
        } else if (boss.state === 'recover') {
            boss.timer -= dt; boss.v.rotation.x += (0 - boss.v.rotation.x) * Math.min(1, dt * 8); boss.v.rotation.z += (0 - boss.v.rotation.z) * Math.min(1, dt * 8); boss.v.position.y += (0 - boss.v.position.y) * Math.min(1, dt * 8);
            if (boss.timer <= 0) { boss.state = 'idle'; boss.timer = boss.phase === 2 ? .28 : .5; boss.weapon.rotation.set(0, 0, 0) }
        }
    }
    // Aplica dano ao jogador e encerra a partida se necessário.
    function damagePlayer(damage, message) {
        if (!running) return;
        if (invulnerable > 0) { toast('ESQUIVA PERFEITA', .7); return }
        hp = Math.max(0, hp - damage); shake = .48; toast(message, 1); setHud();
        if (hp <= 0) { running = false; paused = true; $('pause').style.display = 'none'; $('end').style.display = 'flex'; $('endTitle').textContent = 'VOCÊ CAIU'; document.exitPointerLock?.() }
    }
    function finishBossAttack() {
        boss.state = 'recover'; boss.timer = boss.phase === 2 ? .5 : .82; boss.weapon.rotation.z = 0; boss.warning.visible = false; boss.shockwave.visible = false;
    }
    // Atualiza a simulação de cada quadro do jogo.
    function update(dt) {
        if (!running || paused) return;
        time += dt; toastTimer = Math.max(0, toastTimer - dt); if (toastTimer <= 0) $('toast').style.opacity = '0'; updateAmbience(dt);
        if (hitStop > 0) { hitStop -= dt; return }
        if (cinematicTimer > 0) {
            cinematicTimer = Math.max(0, cinematicTimer - dt); updateCamera(dt);
            if (cinematicTimer <= 0) finishIntro();
            return;
        }
        updatePlayer(dt); updateBoss(dt); resolveActorCollision(); updateCamera(dt); setHud(); shake = Math.max(0, shake - dt * 1.4);
    }
    // Desenha a cena continuamente.
    function frame(now) {
        requestAnimationFrame(frame); const dt = Math.min(.04, Math.max(0, (now - last) / 1000)); last = now;
        if (!paused) update(dt); else { time += dt * .15; updateAmbience(dt * .15) }
        renderer.render(scene, camera);
    }
    addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); renderer.setSize(innerWidth, innerHeight) });
    $('start').addEventListener('click', start); $('skipIntro').addEventListener('click', finishIntro); $('resume').addEventListener('click', () => { paused = false; $('pause').style.display = 'none'; last = performance.now() }); $('backMenu').addEventListener('click', () => { running = false; paused = true; cinematicTimer = 0; $('introScene').classList.remove('visible'); $('introScene').style.display = 'none'; $('pause').style.display = 'none'; $('hud').style.display = 'none'; $('menu').style.display = 'flex'; document.exitPointerLock?.() });
    $('restart').addEventListener('click', start); $('endMenu').addEventListener('click', () => { $('end').style.display = 'none'; $('hud').style.display = 'none'; $('menu').style.display = 'flex'; running = false; paused = true });
    $('controlsBtn').addEventListener('click', () => $('controlsPanel').style.display = 'flex'); $('controlsClose').addEventListener('click', () => $('controlsPanel').style.display = 'none');
    addEventListener('keydown', e => { if (running && cinematicTimer > 0 && e.key !== 'Escape') finishIntro(); if (e.key === 'Escape' && running && !paused) { e.preventDefault(); paused = true; $('pause').style.display = 'flex'; document.exitPointerLock?.() } });
    document.querySelectorAll('[data-action]').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); if (b.dataset.action === 'attack') startAttack(); if (b.dataset.action === 'heavy') startAttack(true); if (b.dataset.action === 'dodge') doDodge(); if (b.dataset.action === 'lock') doLock() }));
    const stick = $('stick'), knob = $('knob');
    stick.addEventListener('pointerdown', e => { activeTouch = { x: 0, y: 0 }; touchX = e.clientX; touchY = e.clientY; stick.setPointerCapture(e.pointerId) });
    stick.addEventListener('pointermove', e => { if (!activeTouch) return; const r = stick.getBoundingClientRect(), dx = clamp(e.clientX - touchX, -42, 42), dy = clamp(e.clientY - touchY, -42, 42); activeTouch = { x: dx / 42, y: dy / 42 }; knob.style.transform = `translate(${dx}px,${dy}px)` });
    function endTouch() { activeTouch = null; knob.style.transform = 'translate(0,0)' }
    stick.addEventListener('pointerup', endTouch); stick.addEventListener('pointercancel', endTouch);
    setInterval(() => { if (running && !paused && hp < 65 && Math.random() < .08) toast('VIGOR BAIXO · LEIA O PRÓXIMO GOLPE', 1) }, 2400);
    updateCamera(.016); requestAnimationFrame(frame);
})();
