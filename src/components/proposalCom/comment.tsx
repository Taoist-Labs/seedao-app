import styled from 'styled-components';
import DefaultAvatar from 'assets/Imgs/defaultAvatar.png';
import useContentDisplay from 'hooks/useContentDisplay';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { UserTitleType } from 'type/proposal.type';
import MoreSelectAction from './moreSelectAction';
import { useTranslation } from 'react-i18next';
import { formatMsgTime, formatTime } from 'utils/time';
import CommentIcon from '../../assets/Imgs/proposal/commentReply.svg';
import ProfileComponent from '../../profile-components/profile';
import { useAuthContext } from '../../providers/authProvider';
import { ICommentDisplay } from 'type/proposalV2.type';
import publicJs from 'utils/publicJs';
import CityHallImg from 'assets/Imgs/proposal/cityhall.png';
import LinkIcon from 'assets/Imgs/proposal/linkIcon.svg';
import LinkIconDark from 'assets/Imgs/proposal/linkIcon-black.svg';
import Overlay from 'react-bootstrap/Overlay';

export const DeletedContent = `[{"insert":"Post deleted\\n"}]`;

const formatSNS = (snsMap: Map<string, string>, wallet: string) => {
  const name = snsMap.get(wallet) || wallet;
  return name?.endsWith('.seedao') ? name : publicJs.AddressToShow(name, 4);
};

interface IProps {
  data: ICommentDisplay;
  parentData?: any;
  children?: React.ReactNode;
  isChild?: boolean;
  onReply: (id: number, idx: number) => void;
  onEdit: (id: number, content: any, idx: number) => void;
  onDelete: (id: number, idx: number) => void;
  hideReply?: boolean;
  isCurrentUser?: boolean;
  isSpecial?: boolean;
  hideVersion?: boolean;
}

interface IUserProps {
  name?: string;
  avatar: string;
  address: string;
  isSpecial: boolean | undefined;
  user_title?: UserTitleType;
  userData?: any;
}

const UserBox = ({ address, name, avatar, user_title, isSpecial, userData }: IUserProps) => {
  const [showModal, setShowModal] = useState(false);

  const {
    state: { theme },
  } = useAuthContext();
  const handleClose = () => {
    setShowModal(false);
  };

  const handleProfile = () => {
    if (!isSpecial) {
      setShowModal(true);
    }
  };

  return (
    <>
      {showModal && <ProfileComponent userData={userData} address={address} theme={theme} handleClose={handleClose} />}
      <UserBoxStyle onClick={() => handleProfile()}>
        <Avatar src={isSpecial ? CityHallImg : avatar} alt="" />
        {/*<NameBox>{name}</NameBox>*/}
        {/*{user_title && user_title.name && <UserTag bg={user_title.background}>{user_title?.name}</UserTag>}*/}
      </UserBoxStyle>
    </>
  );
};

export default function CommentComponent({
  data,
  children,
  isChild,
  parentData,
  onReply,
  onEdit,
  onDelete,
  hideReply,
  isCurrentUser,
  isSpecial,
  hideVersion,
}: IProps) {
  const { t } = useTranslation();
  const [showVersionTip, setShowVersionTip] = useState(false);
  const versionTargetRef = useRef(null);

  const {
    state: { snsMap, theme, userMap },
  } = useAuthContext();
  const content = useContentDisplay(data?.deleted ? DeletedContent : data?.content, !!isSpecial, theme);

  const handleReply = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    onReply(data.metaforo_post_id, data.bindIdx);
  };

  const handleClickMoreAction = (action: string) => {
    switch (action) {
      case 'edit':
        onEdit(data.metaforo_post_id, { ops: JSON.parse(data.content) }, data.bindIdx);
        break;
      case 'delete':
        onDelete(data.metaforo_post_id, data.bindIdx);
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('click', (e) => {
      setShowVersionTip(false);
    });
  }, []);

  const handleShow = (e: any) => {
    e.nativeEvent.stopImmediatePropagation();
    setShowVersionTip(true);
  };
  const userData = userMap.get(data.wallet?.toLocaleLowerCase());

  return (
    <CommentStyle padding={isChild ? '64px' : '0'}>
      {/* {parentData && <ReplyComment data={parentData} />} */}
      <CommentMain>
        {/* <Avatar src={data.user.photo_url || DefaultAvatar} alt="" /> */}
        <RightBox>
          <RelationUserLine>
            <UserBox
              userData={userData}
              address={data.wallet?.toLocaleLowerCase()}
              isSpecial={isSpecial}
              name={isSpecial ? t('city-hall.Cityhall') : formatSNS(snsMap, data.wallet?.toLocaleLowerCase())}
              avatar={userData?.sp?.avatar || userData?.avatar || data.avatar || DefaultAvatar}
            />

            <RhtBtm>
              <Flextop>
                <NameBox>
                  {isSpecial ? t('city-hall.Cityhall') : formatSNS(snsMap, data.wallet?.toLocaleLowerCase())}
                </NameBox>
                {parentData && (
                  <ReplyTag>
                    <span>{t('Proposal.Reply')} </span>
                    {'@'} {parentData?.userName || formatSNS(snsMap, parentData.wallet?.toLocaleLowerCase())}
                  </ReplyTag>
                )}
                <TimeBox>{formatMsgTime(data.created_ts * 1000, t)}</TimeBox>
                {!hideVersion && data.proposal_arweave_hash && (
                  <VersionTag>
                    <span ref={versionTargetRef} onClick={(e) => handleShow(e)}>
                      a
                    </span>
                    <Overlay show={showVersionTip} target={versionTargetRef.current} placement="right-end">
                      {(props) => (
                        <Tip
                          {...props}
                          onClick={() => {
                            window.open(`https://arweave.net/tx/${data.proposal_arweave_hash}/data.html`);
                            setShowVersionTip(false);
                          }}
                        >
                          <span className="titleName">{data.proposal_title}</span>
                          <span className="time">{formatTime(data.proposal_ts * 1000)}</span>

                          {/*<img src={!theme ? LinkIconDark : LinkIcon} alt="" />*/}
                        </Tip>
                      )}
                    </Overlay>
                  </VersionTag>
                )}
                {!data.deleted && (
                  <OpLine>
                    {!hideReply && (
                      <FlexReply>
                        <ReplyBtn onClick={handleReply}>
                          <img src={CommentIcon} alt="" />
                          {t('Proposal.Reply')}
                        </ReplyBtn>
                        {isCurrentUser && !isSpecial && (
                          <MoreSelectAction
                            options={[
                              { label: t('Proposal.Edit'), value: 'edit' },
                              { label: t('Proposal.Delete'), value: 'delete' },
                            ]}
                            handleClickAction={handleClickMoreAction}
                          />
                        )}
                      </FlexReply>
                    )}
                  </OpLine>
                )}
              </Flextop>
              {isSpecial ? (
                <Content>{data.content}</Content>
              ) : (
                content
                // <Content className="content" dangerouslySetInnerHTML={{ __html: content }}></Content>
              )}
            </RhtBtm>
          </RelationUserLine>
        </RightBox>
      </CommentMain>
      {children}
    </CommentStyle>
  );
}

const CommentStyle = styled.div<{ padding: string }>`
  width: 100%;
  padding-left: ${(props) => props.padding};
  margin-bottom: 16px;
  p {
    padding: 0;
    margin: 0;
  }
`;

const CommentMain = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 17px;
  width: 100%;
`;

const UserBoxStyle = styled.div`
  display: flex;
  align-items: center;
`;

export const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center;
  margin-right: 24px;
`;

const RightBox = styled.div``;

const UserTag = styled.span<{ bg: string }>`
  padding-inline: 8px;
  height: 20px;
  line-height: 20px;
  display: inline-block;
  font-size: 12px;
  color: #000;
  background-color: ${(props) => props.bg};
  border-radius: 6px;
`;

const ReplyTag = styled.div`
  color: #2f8fff;
  span {
    color: var(--bs-body-color_active);
  }
`;

const RelationUserLine = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const VersionTag = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  span {
    cursor: pointer;
    display: inline-block;
    width: 18px;
    height: 18px;
    line-height: 15px;
    border-radius: 50%;
    border: 1px solid var(--bs-body-color);
    text-align: center;
    box-sizing: border-box;
  }
  &:hover {
    color: #2f8fff;
    span {
      border: 1px solid #2f8fff;
    }
  }
`;

const Tip = styled.div`
  position: relative;
  left: -20px;
  top: -40px;
  height: 36px;
  line-height: 34px;
  border: 1px solid var(--bs-border-color);
  padding-inline: 16px;
  box-sizing: border-box;
  border-radius: 8px;
  background-color: var(--bs-box-background);
  //color: var(--bs-body-color_active);

  cursor: default;
  font-size: 14px;
  .titleName {
    color: #2f8fff;
  }
  .time {
    padding-left: 10px;
    font-size: 12px;
  }
  img {
    position: relative;
    top: -1px;
    margin-left: 12px;
  }
`;

const Content = styled.div`
  color: var(--bs-body-color_active);
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
`;
const NameBox = styled.div`
  color: var(--bs-body-color_active);
  font-size: 16px;
  font-style: normal;
  font-family: 'Poppins-SemiBold';
  line-height: 22px;
`;
const TimeBox = styled.div`
  color: #bbb;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
`;

const OpLine = styled.div`
  display: flex;
`;
const ReplyBtn = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  color: #2f8fff;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  margin-right: 10px;
  img {
    margin-right: 8px;
  }
`;
const FlexReply = styled.div`
  display: flex;
  align-items: center;
  color: #2f8fff;
`;
const RhtBtm = styled.div`
  flex-grow: 1;
`;
const Flextop = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;
