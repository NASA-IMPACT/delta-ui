import React from 'react';
import T from 'prop-types';
import { MDXProvider } from '@mdx-js/react';

import { useMdxPageLoader } from '$utils/thematics';
import Block from '$components/common/blocks';
import ContentBlockFigure from '$components/common/blocks/figure';
import { ContentBlockProse } from '$styles/content-block';
import Chart from '$components/common/blocks/chart';
import Image, { Caption } from '$components/common/blocks/images';
import Map from '$components/common/blocks/block-map';

function MdxContent(props) {
  const pageMdx = useMdxPageLoader(props.loader);

  if (pageMdx.status === 'loading') {
    return <p>Loading page content</p>;
  }

  if (pageMdx.status === 'success') {
    return (
      <MDXProvider
        components={{
          Block,
          Prose: ContentBlockProse,
          Figure: ContentBlockFigure,
          Caption,
          Image,
          Chart,
          Map
        }}
      >
        <pageMdx.MdxContent />
      </MDXProvider>
    );
  }

  return null;
}

MdxContent.propTypes = {
  loader: T.func
};

export default MdxContent;