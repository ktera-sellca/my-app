"use client";

import type * as CesiumType from "cesium";
import type { Viewer } from "cesium";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    CESIUM_BASE_URL: string;
  }
}

export interface GlobeControls {
  viewer: Viewer;
  toggleSatellite: (show: boolean) => void;
  toggleTerrain: (show: boolean) => void;
  toggleBuildings: (show: boolean) => void;
  toggleAtmosphere: (show: boolean) => void;
  toggleNightLights: (show: boolean) => void;
  flyHome: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  flyTo: (lng: number, lat: number, height?: number) => void;
}

interface GlobeMapProps {
  onReady: (controls: GlobeControls) => void;
  onLocationClick: (lat: number, lng: number, height: number) => void;
}

export function GlobeMap({ onReady, onLocationClick }: GlobeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const onReadyRef = useRef(onReady);
  const onLocationClickRef = useRef(onLocationClick);

  useEffect(() => {
    onReadyRef.current = onReady;
  });
  useEffect(() => {
    onLocationClickRef.current = onLocationClick;
  });

  useEffect(() => {
    if (initializedRef.current || !containerRef.current) return;
    initializedRef.current = true;

    let viewerInstance: Viewer | null = null;

    const init = async () => {
      window.CESIUM_BASE_URL = "/cesiumStatic";

      const Cesium = await import("cesium");

      const token = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
      const hasToken = Boolean(token && token.length > 0);

      if (hasToken && token) {
        Cesium.Ion.defaultAccessToken = token;
      }

      let terrainProvider: CesiumType.TerrainProvider;
      if (hasToken) {
        try {
          terrainProvider =
            await Cesium.CesiumTerrainProvider.fromIonAssetId(1);
        } catch {
          terrainProvider = new Cesium.EllipsoidTerrainProvider();
        }
      } else {
        terrainProvider = new Cesium.EllipsoidTerrainProvider();
      }

      const viewer = new Cesium.Viewer(containerRef.current as HTMLElement, {
        terrainProvider,
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        infoBox: false,
        selectionIndicator: false,
        creditContainer: document.createElement("div"),
      });

      viewerInstance = viewer;

      // Keep clock ticking so sun position updates (required for dayAlpha/nightAlpha)
      viewer.clock.shouldAnimate = true;

      // Imagery setup
      viewer.imageryLayers.removeAll();
      let satelliteLayer: CesiumType.ImageryLayer | null = null;

      if (hasToken) {
        try {
          const provider = await Cesium.IonImageryProvider.fromAssetId(2);
          satelliteLayer = new Cesium.ImageryLayer(provider);
          viewer.imageryLayers.add(satelliteLayer);
        } catch {
          const osmProvider = new Cesium.OpenStreetMapImageryProvider({
            url: "https://tile.openstreetmap.org/",
          });
          satelliteLayer = viewer.imageryLayers.addImageryProvider(osmProvider);
        }
      } else {
        const osmProvider = new Cesium.OpenStreetMapImageryProvider({
          url: "https://tile.openstreetmap.org/",
        });
        satelliteLayer = viewer.imageryLayers.addImageryProvider(osmProvider);
      }

      // OSM 3D Buildings
      let osmBuildings: CesiumType.Cesium3DTileset | null = null;
      if (hasToken) {
        try {
          osmBuildings = await Cesium.createOsmBuildingsAsync();
          viewer.scene.primitives.add(osmBuildings);
        } catch {
          // Buildings not available
        }
      }

      // Black Marble night lights (Ion Asset 3812)
      let nightLightsLayer: CesiumType.ImageryLayer | null = null;
      if (hasToken) {
        try {
          const nightProvider = await Cesium.IonImageryProvider.fromAssetId(3812);
          nightLightsLayer = new Cesium.ImageryLayer(nightProvider, {
            dayAlpha: 0.0,
            nightAlpha: 1.0,
            show: false,
          });
          viewer.imageryLayers.add(nightLightsLayer);
        } catch {
          // Night lights not available
        }
      }

      // Scene settings
      viewer.scene.globe.enableLighting = true;
      if (viewer.scene.skyAtmosphere) {
        viewer.scene.skyAtmosphere.show = true;
      }
      viewer.scene.fog.enabled = true;

      // Fly to Japan on load
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(139.6917, 35.6895, 1800000),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-45),
          roll: 0,
        },
        duration: 3,
      });

      // Click handler
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction((event: { position: CesiumType.Cartesian2 }) => {
        const pickedPosition = viewer.scene.pickPosition(event.position);
        if (Cesium.defined(pickedPosition)) {
          const cartographic =
            Cesium.Cartographic.fromCartesian(pickedPosition);
          const lat = Cesium.Math.toDegrees(cartographic.latitude);
          const lng = Cesium.Math.toDegrees(cartographic.longitude);
          const height = Math.max(0, cartographic.height);
          onLocationClickRef.current(lat, lng, height);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // Layer control functions
      const toggleSatellite = (show: boolean) => {
        if (satelliteLayer) {
          satelliteLayer.show = show;
        }
      };

      const toggleTerrain = async (show: boolean) => {
        if (show && hasToken) {
          try {
            const tp = await Cesium.CesiumTerrainProvider.fromIonAssetId(1);
            viewer.terrainProvider = tp;
          } catch {
            /* ignore */
          }
        } else {
          viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
        }
      };

      const toggleBuildings = (show: boolean) => {
        if (osmBuildings) {
          osmBuildings.show = show;
        }
      };

      const toggleNightLights = (show: boolean) => {
        if (nightLightsLayer) nightLightsLayer.show = show;
      };

      const toggleAtmosphere = (show: boolean) => {
        if (viewer.scene.skyAtmosphere) {
          viewer.scene.skyAtmosphere.show = show;
        }
        viewer.scene.fog.enabled = show;
      };

      const flyHome = () => {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            139.6917,
            35.6895,
            1800000,
          ),
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-45),
            roll: 0,
          },
          duration: 2,
        });
      };

      const zoomIn = () => {
        const height = viewer.camera.positionCartographic.height;
        viewer.camera.zoomIn(height * 0.4);
      };

      const zoomOut = () => {
        const height = viewer.camera.positionCartographic.height;
        viewer.camera.zoomOut(height * 0.5);
      };

      const flyTo = (lng: number, lat: number, height = 50000) => {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(lng, lat, height),
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-45),
            roll: 0,
          },
          duration: 2,
        });
      };

      onReadyRef.current({
        viewer,
        toggleSatellite,
        toggleTerrain,
        toggleBuildings,
        toggleAtmosphere,
        toggleNightLights,
        flyHome,
        zoomIn,
        zoomOut,
        flyTo,
      });
    };

    init().catch(console.error);

    return () => {
      if (viewerInstance && !viewerInstance.isDestroyed()) {
        viewerInstance.destroy();
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
