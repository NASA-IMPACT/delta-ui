import React from 'react';
import styled from 'styled-components';
import { glsp, listReset, themeVal } from '@devseed-ui/theme-provider';
import { Link } from 'react-router-dom';

import { LayoutProps } from '../../common/layout-root';
import PageHero from '../../common/page-hero';

import Constrainer from '../../../styles/constrainer';
import { PageMainContent } from '../../../styles/page';
import { resourceNotFound } from '../../uhoh';

import { useThematicArea } from '../../../utils/thematics';

const List = styled.ul`
  ${listReset()}
  display: flex;
  gap: ${glsp(2)};
  margin-top: ${glsp(3)};

  li {
    padding: ${glsp()};
    border-radius: ${themeVal('shape.rounded')};
    box-shadow: ${themeVal('boxShadow.elevationC')};
  }
`;

function DiscoveriesHub() {
  const thematic = useThematicArea();
  if (!thematic) return resourceNotFound();

  return (
    <PageMainContent>
      <LayoutProps title='Discoveries' />
      <PageHero
        title='Discoveries'
        description='Explore the guided narratives below to discover how NASA satellites and other Earth observing resources reveal a changing planet.'
      />
      <Constrainer>
        <List>
          {thematic.data.discoveries.map((t) => (
            <li key={t.id}>
              <Link to={`${t.id}`}>
                <h2>{t.name}</h2>
              </Link>
            </li>
          ))}
        </List>
      </Constrainer>
    </PageMainContent>
  );
}

export default DiscoveriesHub;
