import React from 'react';
import T from 'prop-types';
import styled from 'styled-components';
import PageHeader from './page-header';

import PageLocalNav from '$components/common/page-local-nav';
import useScrollDirection from '$utils/use-scroll-direction';
import { render } from '@testing-library/react';

const NavWrapper = styled.div`
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const AnimatedPageHeader = styled(PageHeader)`
  transition: margin-top 0.32s ease-out;
  margin-top: 0;
  &.up {
    margin-top: 0;
  }
  &.down {
    margin-top: calc(
      -2.5rem - (1rem * var(--base-space-multiplier, 1) * 0.75 * 2)
    );
  }
`;

function MultipleNav({ localNavProps }) {
  const scrollDir = useScrollDirection();

  return (
    <NavWrapper>
      <AnimatedPageHeader className={scrollDir} />
      <PageLocalNav {...localNavProps} />
    </NavWrapper>
  );
}

function PageNavWrapper({ localNavProps }) {
  const renderLocalNav = !!localNavProps;

  // Not all the pages have multiple navs.
  // We do not need to use scroll direction/animation if there is a single nav
  return (
    <>
      {renderLocalNav && <PageHeader />}
      {!renderLocalNav && <MultipleNav />}
    </>
  );
}

MultipleNav.propTypes = {
  localNavProps: T.object
};

PageNavWrapper.propTypes = {
  localNavProps: T.object
};

export default PageNavWrapper;
