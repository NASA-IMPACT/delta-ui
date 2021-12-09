import React from 'react';
import styled from 'styled-components';

import { add, glsp, media, themeVal } from '@devseed-ui/theme-provider';
import { Prose } from '@devseed-ui/typography';

import App from '../../../common/app';
import PageLocalNav from '../../../common/page-local-nav';
import Constrainer from '../../../../styles/constrainer';
import { PageMainContent } from '../../../../styles/page';

export const IntroFold = styled.div`
  position: relative;
  padding: ${glsp(2, 0)};

  ${media.mediumUp`
    padding: ${glsp(3, 0)};
  `}

  ${media.largeUp`
    padding: ${glsp(4, 0)};
  `}
`;

export const IntroFoldInner = styled(Constrainer)`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${glsp(
    add(themeVal('layout.gap.xsmall'), 1),
    themeVal('layout.gap.xsmall')
  )};
  max-width: ${themeVal('layout.max')};
  margin: 0 auto;

  ${media.smallUp`
    gap: ${glsp(
      add(themeVal('layout.gap.small'), 1),
      themeVal('layout.gap.small')
    )};
  `}

  ${media.mediumUp`
    grid-template-columns: repeat(8, 1fr);
    gap: ${glsp(
      add(themeVal('layout.gap.medium'), 1),
      themeVal('layout.gap.medium')
    )};
  `}

  ${media.largeUp`
    grid-template-columns: repeat(12, 1fr);
    gap: ${glsp(
      add(themeVal('layout.gap.large'), 1),
      themeVal('layout.gap.large')
    )};
  `}

  ${media.xlargeUp`
    gap: ${glsp(
      add(themeVal('layout.gap.xlarge'), 1),
      themeVal('layout.gap.xlarge')
    )};
  `}

  > * {
    grid-column: 1 / -1;
  }
`;

export const IntroFoldCopy = styled.div`
  grid-column: 1 / span 8;
  display: flex;
  flex-direction: column;
  gap: ${glsp(2)};
`;

export const IntroFoldActions = styled.div`
  display: flex;
  flex-flow: row nowrap;
  gap: ${glsp(0.75)};
  align-items: center;
`;

function DatasetOverview() {
  return (
    <App pageTitle='Dataset overview'>
      <PageLocalNav title='Dataset title example' />
      <PageMainContent>
        <IntroFold>
          <IntroFoldInner>
            <IntroFoldCopy>
              <Prose>
                <h1>Overview</h1>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  gravida sem quis ultrices vulputate. Ut eu pretium eros, eu
                  molestie augue. Etiam risus justo, consectetur at erat vel,
                  fringilla commodo felis. Suspendisse rutrum tortor ac nulla
                  volutpat lobortis. Phasellus tempus nunc risus, eu mollis erat
                  ullamcorper a.
                </p>
              </Prose>
            </IntroFoldCopy>
          </IntroFoldInner>
        </IntroFold>
      </PageMainContent>
    </App>
  );
}

export default DatasetOverview;
