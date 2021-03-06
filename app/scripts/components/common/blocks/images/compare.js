import React from 'react';
import styled from 'styled-components';
import ReactCompareImage from 'react-compare-image';
import T from 'prop-types';

import { glsp, themeVal } from '@devseed-ui/theme-provider';

export const MediaCompare = styled.figure`
  /* Style for plugin (react compare image) */
  /* handle */
  > div {
    > div:nth-child(3) > div:nth-child(2) {
      background-color: ${themeVal('color.primary')};
      width: 3rem;
      height: 3rem;
    }
    /* label */
    > div:nth-child(4) > div:nth-child(1),
    > div:nth-child(5) > div:nth-child(1) {
      border-radius: ${themeVal('shape.rounded')};
    }
  }

  /* stylelint-disable-next-line */
  > *:not(:last-child) {
    margin-bottom: ${glsp()};
  }
`;

function CompareImage({
  leftImageSrc,
  leftImageAlt,
  leftImageLabel,
  rightImageSrc,
  rightImageAlt,
  rightImageLabel
}) {
  return (
    <MediaCompare>
      <ReactCompareImage
        leftImage={leftImageSrc}
        leftImageAlt={leftImageAlt}
        leftImageLabel={leftImageLabel}
        rightImage={rightImageSrc}
        rightImageAlt={rightImageAlt}
        rightImageLabel={rightImageLabel}
      />
    </MediaCompare>
  );
}

CompareImage.propTypes = {
  leftImageSrc: T.string.isRequired,
  leftImageAlt: T.string.isRequired,
  leftImageLabel: T.string,
  rightImageSrc: T.string.isRequired,
  rightImageAlt: T.string.isRequired,
  rightImageLabel: T.string
};

export default CompareImage;
