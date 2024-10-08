import { useEffect, useState } from 'react';
import styled from 'styled-components';
import CreateImg from '../../assets/Imgs/proposal/creatIcon.svg';
import VoteImg from '../../assets/Imgs/proposal/voteIcon.svg';
import ShareImg from '../../assets/Imgs/proposal/shareIcon.svg';
import CommentImg from '../../assets/Imgs/proposal/commentIcon.svg';

import { getUserActions } from 'requests/proposalV2';
import { AppActionType, useAuthContext } from 'providers/authProvider';
import { formatTime } from 'utils/time';
import { Trans } from 'react-i18next';
import NoItem from 'components/noItem';
import useQuerySNS from 'hooks/useQuerySNS';
import publicJs from 'utils/publicJs';
import InfiniteScroll from 'react-infinite-scroll-component';
import useToast, { ToastType } from 'hooks/useToast';

enum ActionType {
  CreateProposal = 'create',
  Reply = 'comment',
  Vote = 'vote',
  Share = 'share',
}

type ActionDataType = {
  pid: number;
  time: string;
  type: ActionType;
  user?: string;
  title: string;
};

export default function HistoryAction() {
  const [list, setList] = useState<ActionDataType[]>([]);
  const [currentSession, setCurrentSession] = useState('');
  const [hasMore, setHasMore] = useState(false);

  const {
    dispatch,
    state: { snsMap },
  } = useAuthContext();
  const { getMultiSNS } = useQuerySNS();
  const { showToast } = useToast();

  const formatSNS = (wallet: string) => {
    const name = snsMap.get(wallet) || wallet;
    return name?.endsWith('.seedao') ? name : publicJs.AddressToShow(name, 4);
  };

  const getList = async () => {
    try {
      dispatch({ type: AppActionType.SET_LOADING, payload: true });
      const res = await getUserActions(10, currentSession);
      const _list = res.data.records.map((item) => ({
        type: item.metaforo_action as ActionType,
        time: formatTime(item.action_ts * 1000),
        user: item.reply_to_wallet.toLocaleLowerCase(),
        title: item.target_title,
        pid: item.proposal_id,
      }));
      setCurrentSession(res.data.session);
      setList([...list, ..._list]);
      setHasMore(_list.length <= 10);
      getMultiSNS(Array.from(new Set(res.data.records.map((item) => item.reply_to_wallet))));
    } catch (error: any) {
      logError('[proposal] get user actions failed', error);
      showToast(error?.code || error, ToastType.Danger, { autoClose: false });
    } finally {
      dispatch({ type: AppActionType.SET_LOADING, payload: false });
    }
  };

  useEffect(() => {
    getList();
  }, []);

  const openProposal = (id: number) => {
    window.open(`/proposal/thread/${id}`, '_blank');
  };

  const returnImg = (type: ActionType) => {
    switch (type) {
      case ActionType.CreateProposal:
        return CreateImg;
      case ActionType.Vote:
        return VoteImg;
      case ActionType.Share:
        return ShareImg;
      case ActionType.Reply:
        return CommentImg;
    }
  };

  const getKindofContent = (data: ActionDataType) => {
    switch (data.type) {
      case ActionType.CreateProposal:
        return (
          <Trans
            i18nKey="Proposal.ActivityCreate"
            values={{ title: data.title }}
            components={{
              strong: <strong />,
            }}
          />
        );
      case ActionType.Reply:
        return (
          <Trans
            i18nKey="Proposal.ActivityComment"
            values={{ title: data.title, author: data.user ? formatSNS(data.user) : '' }}
            components={{
              strong: <strong />,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ActionList>
      {list.length === 0 && <NoItem />}
      <InfiniteScroll
        scrollableTarget="scrollableDiv"
        dataLength={list.length}
        next={getList}
        hasMore={hasMore}
        loader={<></>}
      >
        {list.map((item, index) => (
          <Aciton key={index} onClick={() => openProposal(item.pid)}>
            <div className="icon">
              <img src={returnImg(item.type)} alt="" />
            </div>
            <div className="action-content">
              <div className="title">{getKindofContent(item)}</div>
              <div className="time">{item.time}</div>
            </div>
          </Aciton>
        ))}
      </InfiniteScroll>
    </ActionList>
  );
}

const ActionList = styled.ul`
  background-color: var(--bs-box--background);
  border-radius: 16px;
`;

const Aciton = styled.li`
  padding-inline: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid var(--bs-border-color);
  margin: 0 24px;
  &:hover {
    background-color: var(--bs-menu-hover);
  }
  .icon {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    background: #ddd;
    margin-right: 16px;
  }
  .title {
    font-size: 16px;
    color: var(--bs-body-color_active);
    margin-bottom: 4px;
  }
  .time {
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 18px;
  }
  .action-content {
    flex: 1;
    padding-top: 20px;
    padding-bottom: 10px;
    strong {
      padding: 0 10px;
    }
  }
`;
