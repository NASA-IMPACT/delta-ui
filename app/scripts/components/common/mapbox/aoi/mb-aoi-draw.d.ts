import { DefaultTheme } from 'styled-components';
import { AoiChangeListener, AoiState } from '$components/common/aoi/types';

export const aoiCursorStyles: FlattenInterpolation<ThemeProps>;

type useMbDrawParams = {
  mapRef: MutableRefObject<mapboxgl.Map | null>;
  theme: DefaultTheme;
  onChange?: AoiChangeListener;
} & Partial<Pick<AoiState, 'feature' | 'drawing' | 'selected'>>;

export const useMbDraw: (params: useMbDrawParams) => void;
