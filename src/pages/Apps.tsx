import styled from 'styled-components';
import { ContainerPadding } from '../assets/styles/global';
import React, { useMemo } from 'react';
import { Col, Row, Tab, Tabs } from 'react-bootstrap';
import DeschoolIcon from '../assets/images/apps/deschool.png';
import AaanyIcon from '../assets/images/apps/AAAny.svg';
import Cascad3Icon from '../assets/images/apps/cascad3.svg';
import DaolinkIcon from '../assets/images/apps/daolink.svg';
import Wormhole3Icon from '../assets/images/apps/wormhole3.svg';
import MetaforoIcon from '../assets/images/apps/metaforo.png';
import { Calendar, Grid1x2 } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-bootstrap';
import Links from 'utils/links';
import AppCard, { AppIcon, EmptyAppCard } from 'components/common/appCard';

const OuterBox = styled.div`
  min-height: 100%;
  ${ContainerPadding};
`;

const InnerBox = styled.div`
  background: #fff;
  padding: 20px;
  min-height: 100%;
`;

const TitBox = styled.div`
  font-weight: bold;
  font-size: 1.5rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  .titLft {
    width: 100%;
  }
`;

const RhtBoxT = styled.div`
  position: absolute;
  right: 0;
  top: 0;
`;

export default function Apps() {
  const { t } = useTranslation();

  const events = useMemo(() => {
    return [
      {
        id: 'Deschool',
        name: 'Deschool',
        link: 'https://deschool.app/origin/plaza',
        icon: <AppIcon src={DeschoolIcon} alt="" />,
      },
      {
        id: 'AAAny',
        name: 'AAAny',
        link: 'https://apps.apple.com/ca/app/aaany-ask-anyone-anything/id6450619356',
        icon: <AppIcon src={AaanyIcon} alt="" />,
      },
      {
        id: 'Cascad3',
        name: 'Cascad3',
        link: 'https://www.cascad3.com/',
        icon: <AppIcon src={Cascad3Icon} alt="" style={{ height: '20px' }} />,
      },
      {
        id: 'DAOLink',
        name: 'DAOLink',
        link: 'https://m.daolink.space',
        icon: <AppIcon src={DaolinkIcon} alt="" />,
      },
      {
        id: 'Wormhole3',
        name: 'Wormhole3',
        link: 'https://alpha.wormhole3.io',
        icon: <AppIcon src={Wormhole3Icon} alt="" style={{ height: '20px' }} />,
      },
      {
        id: 'Metaforo',
        name: 'Metaforo',
        link: 'https://www.metaforo.io',
        icon: <AppIcon src={MetaforoIcon} alt="" />,
      },
      {
        id: 'online',
        name: t('Home.OnlineEvent'),
        link: 'https://calendar.google.com/calendar/u/4?cid=YzcwNGNlNTA5ODUxMmIwYjBkNzA3MjJlNjQzMGFmNDIyMWUzYzllYmM2ZDFlNzJhYTcwYjgyYzgwYmI2OTk5ZkBncm91cC5jYWxlbmRhci5nb29nbGUuY29t',
        icon: <Calendar />,
      },
      {
        id: 'offline',
        name: t('Home.OfflineEvent'),
        link: 'https://seeu.network/',
        icon: <Grid1x2 />,
      },
    ];
  }, [t]);

  return (
    <OuterBox>
      <InnerBox>
        <TitBox>
          <div className="titLft">
            <Tabs defaultActiveKey={0}>
              <Tab title={t('resources.all')} eventKey={0} />
            </Tabs>
          </div>
          <RhtBoxT>
            <Button onClick={() => window.open(Links.applyAppLink, '_target')}>{t('general.apply')}</Button>
          </RhtBoxT>
        </TitBox>
        <AppBox>
          {events.map((item, idx) => (
            <Col key={idx} sm={12} md={6} lg={4} xl={3}>
              <AppCard {...item} />
            </Col>
          ))}
          <Col sm={12} md={6} lg={4} xl={3}>
            <EmptyAppCard />
          </Col>
        </AppBox>
      </InnerBox>
    </OuterBox>
  );
}

const AppBox = styled(Row)`
  padding: 20px;
`;