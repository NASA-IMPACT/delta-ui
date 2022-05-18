import React from 'react';
import styled from 'styled-components';

import {  
  thematics,
  discoveries,
  datasets, 
  Media, 
  ThematicData,
  RelatedContentData } from 'delta/thematics';
import { thematicRootPath, thematicDatasetsPath, thematicDiscoveriesPath } from '$utils/routes';
import { Card, CardList } from '$components/common/card';
import { FoldHeader, FoldTitle } from '$components/common/fold';
import { variableGlsp } from '$styles/variable-utils';

import Block from '$components/common/blocks/';
import ContentBlockFigure from '$components/common/blocks/figure';

const thematicString = 'thematic';
const datasetString = 'dataset';
const discoveryString = 'discovery';

const contentCategory = {
  [thematicString]: thematics,
  [datasetString]: datasets,
  [discoveryString]: discoveries
};

const TwoColumnCardList = styled(CardList)`
  grid-template-columns: repeat(2, 1fr);
  margin-top: ${variableGlsp(1)};
`;

export type ParentType = 'thematic' | 'dataset' | 'discovery';

interface FormatBlock {
  id: string;
  name: string;
  link: string;
  parentLink: string;
  media: Media;
  parent: ParentType;
}

function formatUrl(id: string, thematic: ThematicData, parent: string) {
  switch(parent) {
    case thematicString:
      return  {
        parentLink: thematicRootPath(thematic),
        link: thematicRootPath(thematic)
      };
    case datasetString:
      return  {
        parentLink: thematicDatasetsPath(thematic),
        link: `${thematicDatasetsPath(thematic)}/${id}`
      };
    case discoveryString:
      return {
        parentLink: thematicDiscoveriesPath(thematic),
        link: `${thematicDiscoveriesPath(thematic)}/${id}`
      };
    default:
      throw Error('Something went wrong with parent data of related content.');
  }

}

function formatBlock({ id, name, thematic, media, parent }): FormatBlock {
  return { id, name, ...formatUrl(id, thematic, parent), media, parent };
}

function formatContents(relatedData: Array<RelatedContentData>) {
  const rData = relatedData.map(relatedContent => {
    const { type, id } = relatedContent;
    
    const matchingContent = contentCategory[type][id].data;
    
    if (!matchingContent) throw Error('Something went wrong. Check the related content frontmatter.');
    
    const {name, media } = matchingContent;
    const  thematicId = (!matchingContent.thematics)? matchingContent.id : matchingContent.thematics[0];

    return formatBlock({ id , name, thematic: contentCategory[thematicString][thematicId], media, parent: type });
  });
  
  return rData;
}


interface RelatedContentProps {
  related: Array<RelatedContentData>;
}

export default function RelatedContent(props: RelatedContentProps): JSX.Element {
  const { related } = props;
  const relatedContents = formatContents(related);

  if(!relatedContents.length) throw Error('There is no related content defined.');
  
  return (
    <Block>
      <ContentBlockFigure>
      <FoldHeader>
        <FoldTitle> 
          Related Content 
        </FoldTitle>
      </FoldHeader>
      <TwoColumnCardList>
        {relatedContents.map((t) => (
          <li key={t.id}>
            <Card
              cardType={t.parent === discoveryString? 'default': 'cover'}
              linkLabel={`View ${t.parent} ${t.name}`}
              linkTo={t.link}
              title={t.name}
              parentName={t.parent}
              parentTo={t.parentLink}
              imgSrc={t.media.src}
              imgAlt={t.media.alt}
            />
          </li>
        ))}
      </TwoColumnCardList>
      </ContentBlockFigure>
    </Block>
    
  );
}