import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { glsp, themeVal } from '@devseed-ui/theme-provider';
import { Button } from '@devseed-ui/button';

import deltaThematics from 'delta/thematics';

import { LayoutProps } from '$components/common/layout-root';
import { Fold } from '$components/common/fold';
import { PageLead, PageMainContent, PageMainTitle } from '$styles/page';
import { GridTemplateFull, GridTemplateHalf } from '$styles/grid';
import { Card, CardList } from '$components/common/card';

import { resourceNotFound } from '$components/uhoh';
import { useThematicArea } from '$utils/thematics';
import { thematicDatasetsPath, thematicDiscoveriesPath } from '$utils/routes';

const IntroFold = styled(Fold)`
  background: ${themeVal('color.base-50')};
`;

const FeatureCard = styled.div`
  padding: ${glsp(1)};
  background: ${themeVal('color.base-50')};
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const IntroFoldActions = styled.div`
  display: flex;
  flex-flow: row nowrap;
  gap: ${glsp(0.75)};
  align-items: center;
`;

function Home() {
  const thematic = useThematicArea();
  if (!thematic) throw resourceNotFound();

  const otherThematicAreas = deltaThematics.filter(
    (t) => t.id !== thematic.data.id
  );

  const featuredDatasets = thematic.data.datasets.filter((d) => d.featured);
  const featuredDiscoveries = thematic.data.discoveries.filter(
    (d) => d.featured
  );

  return (
    <PageMainContent>
      <LayoutProps title={thematic.data.name} />
      <IntroFold>
        <GridTemplateHalf>
          <div>
            <img src='https://via.placeholder.com/350x150' />
          </div>
          <div>
            <PageMainTitle>
              Welcome to the {thematic.data.name} dashboard
            </PageMainTitle>
            <PageLead>{thematic.data.description}</PageLead>
            <IntroFoldActions>
              <Button
                forwardedAs={Link}
                to='about'
                size='large'
                variation='primary-fill'
              >
                Learn more
              </Button>
            </IntroFoldActions>
          </div>
        </GridTemplateHalf>
      </IntroFold>

      {!!featuredDiscoveries.length && (
        <Fold>
          <h2>Featured discoveries</h2>
          <CardList>
            {featuredDiscoveries.map((t) => (
              <li key={t.id}>
                <Card
                  linkLabel='View more'
                  linkTo={t.id}
                  title={t.name}
                  parentName='Discovery'
                  parentTo={thematicDiscoveriesPath(thematic)}
                  description={t.description}
                  date={t.pubDate ? new Date(t.pubDate) : null}
                  imgSrc={t.media.src}
                  imgAlt={t.media.alt}
                />
              </li>
            ))}
          </CardList>
        </Fold>
      )}

      {!!featuredDatasets.length && (
        <Fold>
          <h2>Featured datasets</h2>
          <CardList>
            {featuredDatasets.map((t) => (
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
      )}

      <Fold>
        <GridTemplateFull>
          <h3> Featured discoveries</h3>
        </GridTemplateFull>
        <GridTemplateFull>
          <FeatureCard>
            <img src='https://via.placeholder.com/750x100' />
          </FeatureCard>
        </GridTemplateFull>
      </Fold>
      <Fold>
        <GridTemplateFull>
          <h3> Featured Datasets</h3>
        </GridTemplateFull>
        <GridTemplateHalf>
          <FeatureCard>
            <h4> Nitrogen Dioxide</h4>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Suspendisse facilisis sollicitudin magna, eget accumsan dolor
              molestie quis. Aliquam sit amet erat nec risus dapibus efficitur.
              Sed tristique ultrices libero eu pulvinar. Pellentesque ac auctor
              felis. Vestibulum varius mattis lectus, at dignissim nulla
              interdum.
            </p>
            <Button
              forwardedAs={Link}
              to='about'
              size='large'
              variation='primary-fill'
            >
              Learn more
            </Button>
          </FeatureCard>
          <FeatureCard>
            <h4> Get air quality data</h4>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Suspendisse facilisis sollicitudin magna, eget accumsan dolor
              molestie quis. Aliquam sit amet erat nec risus dapibus efficitur.
              Sed tristique ultrices libero eu pulvinar. Pellentesque ac auctor
              felis. Vestibulum varius mattis lectus, at dignissim nulla
              interdum.
            </p>
          </FeatureCard>
        </GridTemplateHalf>
      </Fold>
      {!!otherThematicAreas.length && (
        <Fold>
          <h2>Other thematic areas</h2>
          <CardList>
            {otherThematicAreas.map((t) => (
              <li key={t.id}>
                <Card
                  cardType='cover'
                  linkLabel='View more'
                  linkTo={`/${t.id}`}
                  title={t.name}
                  parentName='Area'
                  parentTo='/'
                  description={t.description}
                  overline={`has ${t.datasets.length} datasets & ${t.discoveries.length} discoveries`}
                  imgSrc={t.media.src}
                  imgAlt={t.media.alt}
                />
              </li>
            ))}
          </CardList>
        </Fold>
      )}
    </PageMainContent>
  );
}

export default Home;
