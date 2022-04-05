import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import T from 'prop-types';
import styled from 'styled-components';
import dateFns from 'date-fns';
import scrollama from 'scrollama';

import { SimpleMap } from '$components/common/mapbox/map';
import {
  getLayerComponent,
  resolveConfigFunctions
} from '$components/common/mapbox/layers/utils';
import Hug from '$styles/hug';
import { AsyncDatasetLayer, useAsyncLayers } from '$context/layer-data';
import { chapterDisplayName, ChapterProps, ScrollyChapter } from './chapter';
import { userTzDate2utcString, utcString2userTzDate } from '$utils/date';

type ResolvedLayer = {
  layer: AsyncDatasetLayer['baseLayer']['data'];
  Component: React.FunctionComponent<any>;
  runtimeData: { datetime: Date; id: string };
} | null;

const ScrollyMapWrapper = styled.div``;

const TheMap = styled.div`
  height: calc(100vh - 4rem);
  position: sticky;
  top: 4rem;
  z-index: -1;
`;

/**
 * Get's the chapter props from the scrollytelling block's children.
 * Converts the props to the correct format. (like the datetime).
 *
 * @throws Error if any children is not a Chapter
 *
 * @param children ScrollytellingBlock children elements
 */
function useChapterPropsFromChildren(children): ScrollyChapter[] {
  return useMemo(() => {
    const chapters = React.Children.toArray(children) as React.ReactElement<
      ChapterProps,
      any
    >[];

    if (chapters.some((c) => c.type.displayName !== chapterDisplayName)) {
      throw new Error('Found a non Chapter in a ScrollytellingBlock');
    }
    // Extract the props from the chapters.
    return chapters.map((c) => ({
      ...c.props,
      datetime: c.props.datetime && utcString2userTzDate(c.props.datetime)
    }));
  }, [children]);
}

/**
 * Get a key that uniquely identifies the layer.
 *
 * @param ch The chapter
 * @returns string
 */
function getChapterLayerKey(ch: ScrollyChapter) {
  return `${ch.datasetId}-${ch.layerId}-${userTzDate2utcString(ch.datetime)}`;
}

/**
 *
 * @param {array} chList List of chapters
 */
function useMapLayersFromChapters(chList: ScrollyChapter[]) {
  // The layers are unique based on the dataset, layer id and datetime.
  const uniqueChapterLayers = useMemo(() => {
    const unique = chList.reduce(
      (acc, ch) => acc.set(getChapterLayerKey(ch), ch),
      new Map<string, ScrollyChapter>()
    );
    return Array.from(unique.values());
  }, [chList]);

  // Create an array of datasetId & layerId to pass useAsyncLayers so that the
  // layers can be loaded. The skipCompare prevents the compare layer to be
  // loaded, since it will never be used.
  const uniqueLayerRefs = useMemo(() => {
    return uniqueChapterLayers.map(({ datasetId, layerId }) => ({
      datasetId,
      layerId,
      skipCompare: true
    }));
  }, [uniqueChapterLayers]);

  const asyncLayers = useAsyncLayers(uniqueLayerRefs);

  // Create a ref to cache each of the async layers.
  // After the async layer data is loaded from STAC, the layer functions have
  // to be resolved by the `resolveConfigFunctions`. This function will return a
  // new object every time causing useEffects that depend on this data to fire
  // multiple times, even though the data didn't actually change. An example of
  // this is the `sourceParams` in `MapLayerRasterTimeseries`.
  // Since the these values only have to be computed once, when the layer loads,
  // we can use this cache. On every hook run the asyncLayers.map below will
  // return the cached value if it exists or compute and cache.
  const resolvedLayersCache = useRef<ResolvedLayer[]>([]);

  // Each resolved layer will be an object with:
  // layer: The resolved layerData
  // Component: The component to render the layer
  // runtimeData: The runtime data for the layer
  //
  // The difference between runtimeData and layer is that the layer has the
  // layer definition data, the runtimeData belongs to the application and not
  // the layer. For example the datetime, results from a user action (picking
  // on the calendar or in this case setting it in the MDX).
  return asyncLayers.map(({ baseLayer }, index) => {
    if (baseLayer?.status !== 'succeeded') return null;

    if (resolvedLayersCache.current[index]) {
      return resolvedLayersCache.current[index];
    }

    // Some properties defined in the dataset layer config may be functions
    // that need to be resolved before rendering them. These functions accept
    // data to return the correct value. Include access to raw data.
    const datetime = uniqueChapterLayers[index].datetime;
    const bag = {
      datetime,
      dateFns,
      raw: baseLayer.data
    };
    const data = resolveConfigFunctions(baseLayer.data, bag);

    const resolved = {
      layer: data,
      Component: getLayerComponent(!!data.timeseries, data.type),
      runtimeData: {
        datetime,
        id: getChapterLayerKey(uniqueChapterLayers[index])
      }
    };

    resolvedLayersCache.current[index] = resolved;

    return resolved;
  });
}

/**
 * Returns a tuple of [areAllLayersAddedToTheMap, onLoadCb]. All layers will be
 * considered added when the onLoadCb is called `count` times with the
 * "succeeded" status.
 *
 * @param count Total count to reach.
 * @returns [areAllLayersAddedToTheMap, onLoadCb]
 */
function useAllLayersAdded(count) {
  const succeededCount = useRef(0);
  const [allAdded, setAdded] = useState(false);

  const onLoadCb = useCallback(
    (status) => {
      if (status === 'succeeded' && ++succeededCount.current >= count) {
        setAdded(true);
      }
    },
    [count]
  );

  return [allAdded, onLoadCb];
}

const mapOptions = {
  style: process.env.MAPBOX_STYLE_URL,
  interactive: false,
  trackResize: true
};

//
// Scrollytelling Block React Component
//
export function ScrollytellingBlock(props) {
  const { children } = props;

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setMapLoaded] = useState(false);

  // Extract the props from the chapters.
  const chapterProps = useChapterPropsFromChildren(children);

  const resolvedLayers = useMapLayersFromChapters(chapterProps);

  // All layers must be loaded, resolved, and added to the map before we
  // initialize scrollama. This is needed because in a scrollytelling map we
  // need to preload everything so smooth transitions can be applied.
  const [areAllLayersLoaded, onLayerStatusChange] = useAllLayersAdded(
    resolvedLayers.length
  );

  useEffect(() => {
    if (!areAllLayersLoaded) return;

    // Setup initial map state which will be the values on the first chapter.
    const initialCh = chapterProps[0];
    mapRef.current.setZoom(initialCh.zoom);
    mapRef.current.setCenter(initialCh.center);
    const id = getChapterLayerKey(initialCh);
    if (mapRef.current.getLayer(id)) {
      mapRef.current.setPaintProperty(id, 'raster-opacity', 1);
    }

    const scroller = scrollama();

    // setup the instance, pass callback functions
    scroller
      .setup({
        step: '[data-step]'
        // ,debug: true
      })
      .onStepEnter((response) => {
        const { index } = response;

        const chapter = chapterProps[index];
        const id = getChapterLayerKey(chapter);

        // Hide all other layers except this one.
        chapterProps.forEach((c) => {
          const otherLayerId = getChapterLayerKey(c);
          if (mapRef.current.getLayer(otherLayerId)) {
            mapRef.current.setPaintProperty(
              otherLayerId,
              'raster-opacity',
              otherLayerId === id ? 1 : 0
            );
          }
        });

        mapRef.current.flyTo({
          center: chapter.center,
          zoom: chapter.zoom
        });
      });

    return () => {
      scroller.destroy();
    };
  }, [chapterProps, areAllLayersLoaded]);

  return (
    <ScrollyMapWrapper>
      <TheMap>
        {isMapLoaded &&
          resolvedLayers.map((resolvedLayer) => {
            if (!resolvedLayer) return null;

            const { runtimeData, Component: LayerCmp, layer } = resolvedLayer;

            // Each layer type is added to the map through a component. This
            // component has all the logic needed to add/update/remove the
            // layer. Which component to use will depend on the characteristics
            // of the layer and dataset.
            // The function getLayerComponent() should be used to get the
            // correct component.
            return (
              <LayerCmp
                key={runtimeData.id}
                id={runtimeData.id}
                mapInstance={mapRef.current}
                layerId={layer.id}
                date={runtimeData.datetime}
                sourceParams={layer.sourceParams}
                zoomExtent={layer.zoomExtent}
                onStatusChange={onLayerStatusChange}
              />
            );
          })}
        <SimpleMap
          className='root'
          mapRef={mapRef}
          containerRef={mapContainer}
          onLoad={() => setMapLoaded(true)}
          mapOptions={mapOptions}
        />
      </TheMap>
      <Hug>{children}</Hug>
    </ScrollyMapWrapper>
  );
}

ScrollytellingBlock.propTypes = {
  children: T.node
};