import React from 'react';

import { LayoutProps } from '$components/common/layout-root';
import PageHero from '$components/common/page-hero';
import { Fold } from '$components/common/fold';
import { Card, CardList } from '$components/common/card';
import { resourceNotFound } from '$components/uhoh';

import { PageMainContent } from '$styles/page';
import { useThematicArea } from '$utils/thematics';
import { thematicDatasetsPath } from '$utils/routes';

function DatasetsHub() {
  const thematic = useThematicArea();
  if (!thematic) throw resourceNotFound();

  return (
    <PageMainContent>
      <LayoutProps title='Datasets' />
      <PageHero
        title='Datasets'
        description='This dashboard explores key indicators to track and compare changes over time.'
      />
      <Fold>
        <h2>Browse</h2>
        <CardList>
          {thematic.data.datasets.map((t) => (
            <li key={t.id}>
              <Card
                cardType='cover'
                linkLabel='View more'
                linkTo={t.id}
                title={t.name}
                parentName='Dataset'
                parentTo={thematicDatasetsPath(thematic)}
                description={t.description}
                imgSrc={t.media.src}
                imgAlt={t.media.alt}
              />
            </li>
          ))}
        </CardList>
      </Fold>
    </PageMainContent>
  );
}

export default DatasetsHub;
