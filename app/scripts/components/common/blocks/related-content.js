import React from 'react';
import { useThematicArea } from '$utils/thematics';
import { thematicDatasetsPath } from '$utils/routes';
import { Card, CardList } from '$components/common/card';
import { Fold, FoldHeader, FoldTitle } from '$components/common/fold';
const blockNum = 3;
function formatBlock({ id, name, description, media }, parent) {
  return { id, name, description, media, parent };
}

export default function RelatedContent() {
  const thematic = useThematicArea();

  // How should we pick the contents?
  const relatedContents = [
    formatBlock(thematic.data, 'thematic'),
    ...thematic.data.datasets.map((e) => formatBlock(e, 'dataset')),
    ...thematic.data.discoveries.map((e) => formatBlock(e, 'discovery'))
  ].filter((e, idx) => idx < blockNum);

  return (
    <Fold>
      <FoldHeader>
        <FoldTitle> Related Content </FoldTitle>
      </FoldHeader>

      <CardList>
        {relatedContents.map((t) => (
          <li key={t.id}>
            <Card
              cardType='cover'
              linkLabel='View more'
              linkTo={t.id}
              title={t.name}
              parentName={t.parent}
              parentTo={thematicDatasetsPath(thematic)}
              imgSrc={t.media.src}
              imgAlt={t.media.alt}
            />
          </li>
        ))}
      </CardList>
    </Fold>
  );
}
