import React from 'react';

import { LayoutProps } from '../common/layout-root';
import { PageMainContent } from '../../styles/page';

import PageHero from '../common/page-hero';
import { FoldProse } from '../common/fold';

function RootAbout() {
  return (
    <PageMainContent>
      <LayoutProps title='Thematic about' />
      <PageHero
        title='About the Dashboard'
        description='Visualization, Exploration, and Data Analysis (VEDA): Scalable and Interactive System for Science Data.'
      />
      <FoldProse>
        <p>
          The VEDA Dashboard is one of several user interfaces in the VEDA
          project. It also is aligned with VEDA’s goal of advancing interactive
          visualization and exploratory visual data analysis. This dashboard
          constitutes:
        </p>
        <ul>
          <li>
            an evolution of COVID-19 dashboard to provide the interactive
            storytelling for various environmental changes using Earth
            observation data;
          </li>
          <li>
            a transformation of high-valued NASA datasets to dynamic
            visualization, enabling users to perform on-the-fly visual analysis;
          </li>
          <li>
            support for environmental justice initiatives through the
            integration of NASA Earth observation data and socio-economic data;
          </li>
          <li>
            a tool by which users can visually explore and localize data, and
            perform independent analysis; data-driven stories that are
            exportable in GIS formats;
          </li>
          <li>
            and a situational awareness system that brings together Earth
            observation datasets such as greenhouse gasses, air quality, and sea
            level rise, among others.
          </li>
        </ul>
        <p>
          As an interactive visual interface for storytelling, the dashboard
          provides a number of capabilities including sharing and interacting
          with datasets and their respective stories. Through visualizations,
          trend analyses, and comparative analyses of datasets users can explore
          the applications and implications of those data. VEDA Dashboard will
          improve the usability of the Earth science data and enable faster
          science – one of the goals of the NASA open source science initiative.
          Please submit any feedback or questions using the Feedback button in
          the top right of the dashboard.
        </p>
      </FoldProse>
    </PageMainContent>
  );
}

export default RootAbout;
