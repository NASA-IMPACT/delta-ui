import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { Link, NavLink } from 'react-router-dom';

import {
  glsp,
  listReset,
  media,
  themeVal,
  truncated
} from '@devseed-ui/theme-provider';
import { reveal } from '@devseed-ui/animation';
import { Heading, Overline } from '@devseed-ui/typography';
import { Dropdown, DropMenu, DropMenuItem } from '@devseed-ui/dropdown';
import { ShadowScrollbar } from '@devseed-ui/shadow-scrollbar';
import { Button } from '@devseed-ui/button';
import {
  CollecticonChevronDownSmall,
  CollecticonChevronUpSmall,
  CollecticonHamburgerMenu
} from '@devseed-ui/collecticons';

import deltaThematics from 'delta/thematics';
import NasaLogo from './nasa-logo';
import { variableGlsp } from '$styles/variable-utils';
import { useThematicArea } from '$utils/thematics';
import {
  thematicAboutPath,
  thematicDatasetsPath,
  thematicDiscoveriesPath,
  thematicRootPath
} from '$utils/routes';
import GlobalMenuLinkCSS from '$styles/menu-link';

import useScrollDirection, { SCROLL_DOWN } from '$utils/use-scroll-direction';

import { useMediaQuery } from '$utils/use-media-query';
import UnscrollableBody from './unscrollable-body';
import GoogleForm from './google-form';
import { Tip } from './tip';

const appTitle = process.env.APP_TITLE;
const appVersion = process.env.APP_VERSION;

const scrollDownMargin = css`calc(-2.5rem - (${variableGlsp(0.75)} * 2))`;

const PageHeaderSelf = styled.header`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  gap: ${variableGlsp()};
  padding: ${variableGlsp(0.75, 1)};
  background: ${themeVal('color.primary')};
  animation: ${reveal} 0.32s ease 0s 1;

  &,
  &:visited {
    color: ${themeVal('color.surface')};
  }

  /* 
    nav animation (show/hide depending on scroll direction) related style
    value for scroll down should cover the total height of global nav
    2.5rem : height of the nav derived from svg logo height of the nav
    variableGlsp(0.75) * 2 : padding of top and bottom derived from variableGlsp (0.75) 
  */
  transition: margin-top 0.32s ease-out;
  margin-top: ${({ scrollDir }) =>
    scrollDir == SCROLL_DOWN ? scrollDownMargin : '0'};
`;

const Brand = styled.div`
  display: flex;
  flex-shrink: 0;

  a {
    display: grid;
    align-items: center;
    gap: ${glsp(0, 0.5)};

    &,
    &:visited {
      color: inherit;
      text-decoration: none;
    }

    #nasa-logo-neg-mono {
      opacity: 1;
      transition: all 0.32s ease 0s;
    }

    #nasa-logo-pos {
      opacity: 0;
      transform: translate(0, -100%);
      transition: all 0.32s ease 0s;
    }

    &:hover {
      opacity: 1;

      #nasa-logo-neg-mono {
        opacity: 0;
      }

      #nasa-logo-pos {
        opacity: 1;
      }
    }

    svg {
      grid-row: 1 / span 2;
      height: 2.5rem;
      width: auto;

      ${media.largeUp`
        transform: scale(1.125);
      `}
    }

    span:first-of-type {
      font-size: 0.875rem;
      line-height: 1rem;
      font-weight: ${themeVal('type.base.extrabold')};
      text-transform: uppercase;
    }

    span:last-of-type {
      grid-row: 2;
      font-size: 1.25rem;
      line-height: 1.5rem;
      font-weight: ${themeVal('type.base.regular')};
      letter-spacing: -0.025em;
    }
  }
`;

const PageTitleSecLink = styled(Link)`
  align-self: end;
  font-size: 0.75rem;
  font-weight: ${themeVal('type.base.bold')};
  line-height: 1rem;
  text-transform: uppercase;
  background: ${themeVal('color.surface')};
  padding: ${glsp(0, 0.25)};
  border-radius: ${themeVal('shape.rounded')};
  margin: ${glsp(0.125, 0.5)};

  &&,
  &&:visited {
    color: ${themeVal('color.primary')};
  }

  ${media.largeUp`
    margin: ${glsp(0, 0.5)};
    font-size: 0.875rem;
    line-height: 1.25rem;
    padding: 0 ${glsp(0.5)};
  `}
`;

const GlobalNav = styled.nav`
  position: fixed;
  inset: 0 0 0 auto;
  z-index: 900;
  display: flex;
  flex-flow: column nowrap;
  width: 20rem;
  margin-right: -20rem;
  transition: margin 0.24s ease 0s;

  ${({ revealed }) =>
    revealed &&
    css`
      & {
        margin-right: 0;
      }
    `}

  ${media.xlargeUp`
    position: static;
    flex: 1;
    margin: 0;
  }

    &:before {
      content: '';
    }
  `}

  /* Show page nav backdrop on small screens */

  &::after {
    content: '';
    position: absolute;
    inset: 0 0 0 auto;
    z-index: -1;
    background: transparent;
    width: 0;
    transition: background 0.64s ease 0s;

    ${({ revealed }) =>
      revealed &&
      css`
        ${media.largeDown`
          background: ${themeVal('color.base-400a')};
          width: 200vw;
        `}
      `}
  }
`;

const GlobalNavInner = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: ${themeVal('color.primary')};

  ${media.largeDown`
    box-shadow: ${themeVal('boxShadow.elevationD')};
  `}
`;

const GlobalNavHeader = styled.div`
  padding: ${variableGlsp()};
  box-shadow: inset 0 -1px 0 0 ${themeVal('color.surface-200a')};
`;

const GlobalNavTitle = styled(Heading).attrs({
  as: 'span',
  size: 'small'
})`
  /* styled-component */
`;

export const GlobalNavActions = styled.div`
  /* styled-component */
`;

export const GlobalNavToggle = styled(Button)`
  z-index: 2000;
`;

const GlobalNavBody = styled(ShadowScrollbar).attrs({
  topShadowVariation: 'dark',
  bottomShadowVariation: 'dark'
})`
  display: flex;
  flex: 1;

  .shadow-top {
    background: linear-gradient(
      to top,
      ${themeVal('color.primary-600')}00 0%,
      ${themeVal('color.primary-600')} 100%
    );
  }

  .shadow-bottom {
    background: linear-gradient(
      to bottom,
      ${themeVal('color.primary-600')}00 0%,
      ${themeVal('color.primary-600')} 100%
    );
  }
`;

const GlobalNavBodyInner = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  ${media.xlargeUp`
    flex-direction: row;
    gap: ${variableGlsp()};
  `}
`;

const NavBlock = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: ${glsp(0.25)};

  ${media.xlargeUp`
    flex-direction: row;
    align-items: center;
    gap: ${glsp(1.5)};
  `}
`;

const SectionsNavBlock = styled(NavBlock)`
  ${media.xlargeUp`
    margin-left: auto;
  `}
`;

const ThemesNavBlock = styled(NavBlock)`
  ${media.largeDown`
    order: 2;
  `}

  ${media.xlargeUp`
    padding-left: ${variableGlsp()};
    box-shadow: -1px 0 0 0 ${themeVal('color.surface-200a')};
  `}
`;

const GlobalNavBlockTitle = styled(Overline).attrs({
  as: 'span'
})`
  display: block;
  padding: ${variableGlsp(1, 1, 0.25, 1)};
  color: currentColor;
  opacity: 0.64;

  ${media.xlargeUp`
    padding: 0;
  `}
`;

const GlobalMenu = styled.ul`
  ${listReset()}
  display: flex;
  flex-flow: column nowrap;
  gap: ${glsp(0.5)};

  ${media.xlargeUp`
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: ${glsp(1.5)};
  `}
`;

const GlobalMenuLink = styled(NavLink)`
  ${GlobalMenuLinkCSS}
`;

const ThemeToggle = styled(GlobalMenuLink)`
  /* stylelint-disable-next-line no-descending-specificity */
  > span {
    ${truncated()}
    max-width: 8rem;
  }
`;

function PageHeader() {
  const thematic = useThematicArea();

  const { isLargeDown } = useMediaQuery();

  const [globalNavRevealed, setGlobalNavRevealed] = useState(false);

  const globalNavBodyRef = useRef(null);
  // Click listener for the whole global nav body so we can close it when clicking
  // the overlay on medium down media query.
  const onGlobalNavClick = useCallback((e) => {
    if (!globalNavBodyRef.current?.contains(e.target)) {
      setGlobalNavRevealed(false);
    }
  }, []);

  useEffect(() => {
    // Close global nav when media query changes.
    if (!isLargeDown) setGlobalNavRevealed(false);
  }, [isLargeDown]);

  // Detect scroll direction to show/hide global nav
  const scrollDir = useScrollDirection();

  const closeNavOnClick = useCallback(() => setGlobalNavRevealed(false), []);

  return (
    <PageHeaderSelf scrollDir={scrollDir}>
      {globalNavRevealed && isLargeDown && <UnscrollableBody />}
      <Brand>
        <Link
          to={
            deltaThematics.length > 1 && thematic ? `/${thematic.data.id}` : '/'
          }
        >
          <NasaLogo />
          <span>Earthdata</span> <span>{appTitle}</span>
        </Link>
        <Tip content={`v${appVersion}`}>
          <PageTitleSecLink to='/development'>Beta</PageTitleSecLink>
        </Tip>
      </Brand>
      {isLargeDown && (
        <GlobalNavActions>
          <GlobalNavToggle
            aria-label={
              globalNavRevealed
                ? 'Close Global Navigation'
                : 'Open Global Navigation'
            }
            variation='achromic-text'
            fitting='skinny'
            onClick={() => setGlobalNavRevealed((v) => !v)}
            active={globalNavRevealed}
          >
            <CollecticonHamburgerMenu />
          </GlobalNavToggle>
        </GlobalNavActions>
      )}
      <GlobalNav
        aria-label='Global Navigation'
        role='navigation'
        revealed={globalNavRevealed}
        onClick={onGlobalNavClick}
      >
        <GlobalNavInner ref={globalNavBodyRef}>
          {isLargeDown && (
            <>
              <GlobalNavHeader>
                <GlobalNavTitle aria-hidden='true'>Browse</GlobalNavTitle>
              </GlobalNavHeader>
            </>
          )}
          <GlobalNavBody as={isLargeDown ? undefined : 'div'}>
            <GlobalNavBodyInner>
              {thematic && deltaThematics.length > 1 && (
                <ThemesNavBlock>
                  <GlobalNavBlockTitle>Area</GlobalNavBlockTitle>
                  {isLargeDown ? (
                    <GlobalMenu id='themes-nav-block'>
                      {deltaThematics.map((t) => (
                        <li key={t.id}>
                          <GlobalMenuLink
                            to={`/${t.id}`}
                            aria-current={null}
                            onClick={closeNavOnClick}
                          >
                            {t.name}
                          </GlobalMenuLink>
                        </li>
                      ))}
                    </GlobalMenu>
                  ) : (
                    <Dropdown
                      alignment='left'
                      // eslint-disable-next-line no-unused-vars
                      triggerElement={({ active, className, ...rest }) => (
                        <ThemeToggle {...rest} as='button'>
                          <span>{thematic.data.name}</span>{' '}
                          {active ? (
                            <CollecticonChevronUpSmall />
                          ) : (
                            <CollecticonChevronDownSmall />
                          )}
                        </ThemeToggle>
                      )}
                    >
                      <DropMenu id='themes-nav-block'>
                        {deltaThematics.map((t) => (
                          <li key={t.id}>
                            <DropMenuItem
                              as={NavLink}
                              to={`/${t.id}`}
                              aria-current={null}
                              active={t.id === thematic.data.id}
                              data-dropdown='click.close'
                            >
                              {t.name}
                            </DropMenuItem>
                          </li>
                        ))}
                      </DropMenu>
                    </Dropdown>
                  )}
                </ThemesNavBlock>
              )}
              <SectionsNavBlock>
                <GlobalNavBlockTitle>Section</GlobalNavBlockTitle>
                {thematic ? (
                  <GlobalMenu>
                    <li>
                      <GlobalMenuLink
                        to={thematicRootPath(thematic)}
                        end
                        onClick={closeNavOnClick}
                      >
                        Welcome
                      </GlobalMenuLink>
                    </li>
                    <li>
                      <GlobalMenuLink
                        to={thematicDiscoveriesPath(thematic)}
                        onClick={closeNavOnClick}
                      >
                        Discoveries
                      </GlobalMenuLink>
                    </li>
                    <li>
                      <GlobalMenuLink
                        to={thematicDatasetsPath(thematic)}
                        onClick={closeNavOnClick}
                      >
                        Datasets
                      </GlobalMenuLink>
                    </li>
                    <li>
                      <GoogleForm />
                    </li>
                    <li>
                      <GlobalMenuLink
                        to={thematicAboutPath(thematic)}
                        end
                        onClick={closeNavOnClick}
                      >
                        About
                      </GlobalMenuLink>
                    </li>
                  </GlobalMenu>
                ) : (
                  <GlobalMenu>
                    <li>
                      <GlobalMenuLink to='/' onClick={closeNavOnClick}>
                        Welcome
                      </GlobalMenuLink>
                    </li>
                    <li>
                      <GoogleForm />
                    </li>
                    <li>
                      <GlobalMenuLink to='/about' onClick={closeNavOnClick}>
                        About
                      </GlobalMenuLink>
                    </li>
                  </GlobalMenu>
                )}
              </SectionsNavBlock>
            </GlobalNavBodyInner>
          </GlobalNavBody>
        </GlobalNavInner>
      </GlobalNav>
    </PageHeaderSelf>
  );
}

export default PageHeader;
