import React from 'react';
import T from 'prop-types';

import {
  Figure,
  Figcaption,
  FigcaptionInner,
  FigureAttribution
} from '$components/common/figure';

import { captionDisplayName } from '$components/common/blocks/block-constant';
import { useThematicAreaDiscovery } from '$utils/thematics';

export const Caption = function ({ children, attrAuthor, attrUrl }) {
  return (
    <Figcaption>
      {children && <FigcaptionInner>{children}</FigcaptionInner>}
      <FigureAttribution author={attrAuthor} url={attrUrl} forwardedAs='span' />
    </Figcaption>
  );
};

Caption.displayName = captionDisplayName;

Caption.propTypes = {
  attrAuthor: T.string,
  attrUrl: T.string,
  children: T.node
};

const Image = function (props) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  const { align, attr, attrAuthor, attrUrl, embedded, ...propsWithoutAttrs } =
    props;
  const imageAlign = align ? align : 'center';

  function getImage() {
    if (embedded) {
      const discovery = useThematicAreaDiscovery();
      const { embeddedLocal } = discovery.data;
      return (
        <img
          loading='lazy'
          src={embeddedLocal[embedded].src}
          alt={embeddedLocal[embedded].alt}
          {...propsWithoutAttrs}
        />
      );
    } else return <img loading='lazy' {...propsWithoutAttrs} />;
  }

  return attr || attrAuthor ? (
    // if it is an inline image with a caption
    <Figure className={`align-${imageAlign}`}>
      {getImage()}
      <Caption attrAuthor={attrAuthor} attrUrl={props.attrUrl}>
        {attr}
      </Caption>
    </Figure>
  ) : (
    <img loading='lazy' {...propsWithoutAttrs} />
  );
};
Image.propTypes = {
  src: T.string,
  alt: T.string,
  align: T.string,
  attr: T.string,
  attrAuthor: T.string,
  attrUrl: T.string
};

export default Image;
