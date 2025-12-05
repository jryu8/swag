"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function buildMannequin(params: {
  height: number;
  weight: number;
  bodyType: "slim" | "average" | "athletic" | "full";
  topColor: string;
  bottomColor: string;
}) {
  const { height, weight, bodyType, topColor, bottomColor } = params;
  const scaleY = height / 170;
  const mass = weight / 70;
  const torsoWidth =
    bodyType === "slim"
      ? 0.9
      : bodyType === "athletic"
      ? 1.1
      : bodyType === "full"
      ? 1.25
      : 1.0;
  const limbScale =
    bodyType === "athletic"
      ? 1.1
      : bodyType === "full"
      ? 1.15
      : bodyType === "slim"
      ? 0.9
      : 1.0;

  const group = new THREE.Group();
  group.scale.set(1 * mass, scaleY, 1 * mass);

  const topMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(topColor),
    roughness: 0.6,
    metalness: 0.05,
  });
  const bottomMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(bottomColor),
    roughness: 0.6,
    metalness: 0.05,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#f5d1b5"),
    roughness: 0.8,
  });

  // Torso
  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.28 * torsoWidth, 0.7, 8, 16),
    topMat,
  );
  torso.position.set(0, 1.3, 0);
  group.add(torso);

  // Hips/legs upper
  const hips = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.25 * torsoWidth, 0.6, 8, 16),
    bottomMat,
  );
  hips.position.set(0, 0.5, 0);
  group.add(hips);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), skinMat);
  head.position.set(0, 1.9, 0);
  group.add(head);

  // Arms
  const armL = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.08 * limbScale, 0.5, 8, 16),
    topMat,
  );
  armL.position.set(-0.42 * torsoWidth, 1.35, 0);
  armL.rotation.set(0, 0, Math.PI / 2);
  group.add(armL);
  const armR = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.08 * limbScale, 0.5, 8, 16),
    topMat,
  );
  armR.position.set(0.42 * torsoWidth, 1.35, 0);
  armR.rotation.set(0, 0, Math.PI / 2);
  group.add(armR);

  // Legs
  const legL = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.1 * limbScale, 0.7, 8, 16),
    bottomMat,
  );
  legL.position.set(-0.16 * torsoWidth, 0.1, 0);
  group.add(legL);
  const legR = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.1 * limbScale, 0.7, 8, 16),
    bottomMat,
  );
  legR.position.set(0.16 * torsoWidth, 0.1, 0);
  group.add(legR);

  return group;
}

export default function TryOnPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null);
  const mannequinRef = useRef<THREE.Group | null>(null);
  const gltfRef = useRef<THREE.Group | null>(null);
  const initializedRef = useRef<boolean>(false);

  const [token, setToken] = useState<string | null>(null);
  // UI units
  const [heightFeet, setHeightFeet] = useState(5);
  const [heightInches, setHeightInches] = useState(7);
  const [weightLbs, setWeightLbs] = useState(154);
  const [bodyType, setBodyType] = useState<
    "slim" | "average" | "athletic" | "full"
  >("average");
  const [topColor, setTopColor] = useState("#1d4ed8");
  const [bottomColor, setBottomColor] = useState("#f97316");
  const [useGltf, setUseGltf] = useState(false);
  const [gltfUrl, setGltfUrl] = useState<string>("");

  useEffect(() => {
    const t =
      typeof window !== "undefined" ? localStorage.getItem("vc_token") : null;
    if (t) setToken(t);
  }, []);

  // Initialize three scene
  useEffect(() => {
    if (!containerRef.current) return;
    if (initializedRef.current) return; // guard against double-init in Strict Mode
    initializedRef.current = true;

    const width = containerRef.current.clientWidth;
    const heightPx = containerRef.current.clientHeight;

    // Clear any previous canvases (e.g., after HMR) to avoid stacked graphs
    while (containerRef.current.firstChild) {
      try {
        containerRef.current.removeChild(containerRef.current.firstChild);
      } catch {}
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#ffffff");
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / heightPx, 0.1, 100);
    camera.position.set(2.8, 2.2, 3.2);
    cameraRef.current = camera;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(3, 5, 2);
    dir.castShadow = true;
    scene.add(dir);

    // Grid
    const grid = new THREE.GridHelper(10, 20, 0xd1d5db, 0xe5e7eb);
    scene.add(grid);

    // Controls (lazy import)
    (async () => {
      const { OrbitControls } = await import(
        "three/examples/jsm/controls/OrbitControls.js"
      );
      controlsRef.current = new OrbitControls(camera, renderer.domElement);
    })();

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      controlsRef.current?.update?.();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (
        !containerRef.current ||
        !cameraRef.current ||
        !rendererRef.current
      )
        return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      controlsRef.current?.dispose?.();
      renderer.dispose();
      try {
        containerRef.current?.removeChild(renderer.domElement);
      } catch {}
      // reset refs so re-entry can init cleanly
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
      mannequinRef.current = null;
      gltfRef.current = null;
      initializedRef.current = false;
    };
  }, []);

  // Derived physical metrics (cm/kg)
  const heightCm = (heightFeet * 12 + heightInches) * 2.54;
  const weightKg = weightLbs * 0.45359237;

  // Build or update mannequin when params change (only if not using GLTF)
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (useGltf) return; // skip when GLTF is active
    if (mannequinRef.current) {
      scene.remove(mannequinRef.current);
      mannequinRef.current.traverse((o: any) => {
        if (o.geometry) o.geometry.dispose?.();
        if (o.material) {
          if (Array.isArray(o.material))
            o.material.forEach((m: any) => m.dispose?.());
          else o.material.dispose?.();
        }
      });
    }
    const g = buildMannequin({
      height: heightCm,
      weight: weightKg,
      bodyType,
      topColor,
      bottomColor,
    });
    mannequinRef.current = g;
    scene.add(g);
  }, [heightCm, weightKg, bodyType, topColor, bottomColor, useGltf]);

  // Load or unload GLTF when toggled / url changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const cleanupGltf = () => {
      if (gltfRef.current) {
        scene.remove(gltfRef.current);
        gltfRef.current.traverse((o: any) => {
          if (o.geometry) o.geometry.dispose?.();
          if (o.material) {
            if (Array.isArray(o.material))
              o.material.forEach((m: any) => m.dispose?.());
            else o.material.dispose?.();
          }
          if (o.texture) o.texture.dispose?.();
        });
        gltfRef.current = null;
      }
    };

    if (!useGltf) {
      // Ensure mannequin visible
      if (
        mannequinRef.current &&
        !scene.children.includes(mannequinRef.current)
      )
        scene.add(mannequinRef.current);
      cleanupGltf();
      return;
    }

    // Hide mannequin
    if (mannequinRef.current) scene.remove(mannequinRef.current);
    cleanupGltf();
    if (!gltfUrl) return;

    let cancelled = false;
    (async () => {
      try {
        const { GLTFLoader } = await import(
          "three/examples/jsm/loaders/GLTFLoader.js"
        );
        const loader = new GLTFLoader();
        loader.load(
          gltfUrl,
          (gltf) => {
            if (cancelled) return;
            const model = gltf.scene || gltf.scenes?.[0];
            if (!model) return;
            // Normalize model size roughly around mannequin height
            model.traverse((n: any) => {
              if (n.isMesh) {
                n.castShadow = true;
                n.receiveShadow = true;
              }
            });
            // Center and scale: compute bbox
            const box = new THREE.Box3().setFromObject(model);
            const size = new THREE.Vector3();
            box.getSize(size);
            const targetHeight = (heightCm / 170) * 2.1; // approx display height in scene units
            const scale = targetHeight / (size.y || 1);
            model.scale.setScalar(scale);
            // Recenter
            const center = new THREE.Vector3();
            box.getCenter(center);
            model.position.sub(center.setY(center.y - size.y / 2));

            gltfRef.current = model;
            scene.add(model);
          },
          undefined,
          () => {
            /* ignore errors */
          },
        );
      } catch {}
    })();

    return () => {
      cancelled = true;
    };
  }, [useGltf, gltfUrl, heightCm]);

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f6eadf]">
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        {/* Header / hero */}
        <header className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start">
          <div>
            <h1 className="mb-3 text-3xl font-semibold text-[#1f130a]">
              3D Try-On
            </h1>
            <p className="mb-4 max-w-md text-sm text-[#6c5a4a]">
              Adjust height, weight, body type, and colors to see a simple
              mannequin that roughly matches your proportions. Later, this can
              be connected to real garments and avatars.
            </p>
            <p className="text-xs text-[#8f7a66]">
              This is a prototype view only. It doesn&apos;t affect your saved
              closet items.
            </p>
            {!token && (
              <p className="mt-3 text-[11px] text-[#b0463c]">
                You&apos;re not logged in. In a future version, try-on presets
                could be saved to your account.
              </p>
            )}
          </div>

          {/* Side card */}
          <div className="relative rounded-[32px] bg-[#e0cbb3] p-3">
            <div className="flex h-48 flex-col justify-between rounded-[28px] bg-[#f9f1e6] px-6 py-5 shadow-md">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.16em] text-[#a08975]">
                  Fit preview
                </p>
                <h2 className="mb-2 text-xl font-semibold text-[#1f130a]">
                  See proportions, not perfection
                </h2>
                <p className="text-sm text-[#6c5a4a]">
                  The mannequin gives a quick sense of length and overall shape.
                  It&apos;s not a perfect avatar, but it can help compare
                  silhouettes.
                </p>
              </div>
              <p className="text-[11px] text-[#8f7a66]">
                Tip: keep your height and weight close to reality so outfits
                feel more grounded.
              </p>
            </div>
          </div>
        </header>

        {/* Controls */}
        <section className="grid gap-4 rounded-3xl bg-white/90 p-5 shadow-sm md:grid-cols-6">
          <div>
            <label className="mb-1 block text-xs text-[#4f3c2c]">Height</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={3}
                max={7}
                value={heightFeet}
                onChange={(e) =>
                  setHeightFeet(Math.max(0, Number(e.target.value) || 0))
                }
                className="w-full rounded-2xl border border-[#e1d2c3] bg-[#f9f1e6] px-3 py-2 text-sm text-[#1f130a]"
              />
              <span className="text-xs text-[#8f7a66]">ft</span>
              <input
                type="number"
                min={0}
                max={11}
                value={heightInches}
                onChange={(e) =>
                  setHeightInches(
                    Math.min(11, Math.max(0, Number(e.target.value) || 0)),
                  )
                }
                className="w-full rounded-2xl border border-[#e1d2c3] bg-[#f9f1e6] px-3 py-2 text-sm text-[#1f130a]"
              />
              <span className="text-xs text-[#8f7a66]">in</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#4f3c2c]">Weight</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={60}
                max={400}
                value={weightLbs}
                onChange={(e) =>
                  setWeightLbs(Math.max(0, Number(e.target.value) || 0))
                }
                className="w-full rounded-2xl border border-[#e1d2c3] bg-[#f9f1e6] px-3 py-2 text-sm text-[#1f130a]"
              />
              <span className="text-xs text-[#8f7a66]">lb</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#4f3c2c]">
              Body type
            </label>
            <select
              value={bodyType}
              onChange={(e) => setBodyType(e.target.value as any)}
              className="w-full rounded-2xl border border-[#e1d2c3] bg-[#f9f1e6] px-3 py-2 text-sm text-[#1f130a]"
            >
              <option value="slim">Slim</option>
              <option value="average">Average</option>
              <option value="athletic">Athletic</option>
              <option value="full">Full</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#4f3c2c]">
              Top color
            </label>
            <input
              type="color"
              value={topColor}
              onChange={(e) => setTopColor(e.target.value)}
              className="h-10 w-full rounded-2xl border border-[#e1d2c3] bg-[#f9f1e6]"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#4f3c2c]">
              Bottom color
            </label>
            <input
              type="color"
              value={bottomColor}
              onChange={(e) => setBottomColor(e.target.value)}
              className="h-10 w-full rounded-2xl border border-[#e1d2c3] bg-[#f9f1e6]"
            />
          </div>

          <div className="md:col-span-6 grid gap-2 md:grid-cols-[auto,minmax(0,1.5fr)]">
            <label className="flex items-center gap-2 text-sm text-[#4f3c2c]">
              <input
                type="checkbox"
                checked={useGltf}
                onChange={(e) => setUseGltf(e.target.checked)}
              />
              Use GLTF avatar (optional)
            </label>
            <input
              placeholder="GLTF/GLB URL (public)"
              value={gltfUrl}
              onChange={(e) => setGltfUrl(e.target.value)}
              className="rounded-2xl border border-[#e1d2c3] bg-[#f9f1e6] px-3 py-2 text-sm text-[#1f130a]"
            />
            <p className="md:col-span-2 text-[11px] text-[#8f7a66]">
              When enabled, the simple mannequin is hidden and the GLTF model is
              displayed instead.
            </p>
          </div>
        </section>

        {/* 3D viewer – core kept the same */}
        <section className="rounded-3xl bg-white/90 p-3 shadow-sm">
          <div ref={containerRef} className="h-[60vh] w-full" />
        </section>

        <p className="text-[11px] text-[#8f7a66]">
          Prototype: shows an adjustable mannequin with garment color overlays.
          In future versions, this can connect directly to your saved pieces and
          AI outfit suggestions.
        </p>
      </div>
    </main>
  );
}
