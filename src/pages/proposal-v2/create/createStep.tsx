import styled from 'styled-components';
import { Template, Preview } from '@taoist-labs/components';

import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { MdEditor } from 'md-editor-rt';
import { saveOrSubmitProposal } from 'requests/proposalV2';
import { AppActionType, useAuthContext } from 'providers/authProvider';
import useCheckMetaforoLogin from 'hooks/useMetaforoLogin';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-bootstrap';
import BackIcon from '../../../assets/Imgs/back.svg';
import ConfirmModal from 'components/modals/confirmModal';
import { useCreateProposalContext } from './store';
import requests from '../../../requests';
import getConfig from '../../../utils/envCofnig';
import useToast, { ToastType } from 'hooks/useToast';
import TemplateTag from 'components/proposalCom/templateTag';
import CategoryTag from 'components/proposalCom/categoryTag';
import PlusImg from 'assets/Imgs/light/plus.svg';
import MinusImg from 'assets/Imgs/light/minus.svg';

const Box = styled.ul`
  position: relative;
  .cm-scroller {
    background: var(--home-right);
  }
`;

const ItemBox = styled.div`
  margin-bottom: 20px;
`;

const TitleBox = styled.div`
  background: rgba(82, 0, 255, 0.08);
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 20px;
  box-sizing: border-box;
`;

const FixedBox = styled.div<{ showRht: string }>`
  background-color: var(--bs-box-background);
  position: sticky;
  margin: -24px 0 0 -32px;
  width: calc(100% + 64px);
  top: 0;
  height: 64px;
  z-index: 95;
  box-sizing: border-box;
  padding-right: ${(props) => (props.showRht === 'true' ? '340px' : '0')};
  box-shadow: var(--proposal-box-shadow);
  border-top: 1px solid var(--bs-border-color);
`;

const FlexInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 64px;
`;

const NavLeft = styled.div`
  display: flex;
  gap: 12px;
`;

const TagsBox = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const BackBox = styled.div`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  .backTitle {
    color: var(--bs-body-color_active);
  }
`;

const BackIconBox = styled.span`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(217, 217, 217, 0.5);
  background: var(--bs-box-background);
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BtnGroup = styled.div`
  display: flex;
  align-items: center;
  .btn {
    width: 100px;
    height: 40px;
    margin-left: 16px;
  }
  .save {
    background: transparent;
    border: 1px solid rgba(217, 217, 217, 0.5);
    color: var(--font-color-title);
  }
`;

const BoxBg = styled.div<{ showRht: string }>`
  background-color: var(--bs-box-background);
  box-shadow: var(--proposal-box-shadow);
  border: 1px solid var(--proposal-border);
  margin-top: 24px;
  border-radius: 8px;

  width: ${(props) => (props.showRht === 'true' ? 'calc(100% - 335px)' : '100%')};
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  box-sizing: border-box;
`;

const InputBox = styled.div`
  padding: 0 32px;
  input {
    width: 100%;
    height: 40px;
    border-radius: 8px;
    border: 1px solid var(--bs-border-color);
    background: var(--bs-box--background);
    padding: 0 12px;
    box-sizing: border-box;
    &:hover,
    &:focus {
      border: 1px solid rgba(82, 0, 255, 0.5);
      outline: none;
    }
  }
`;

const ComponnentBox = styled(TitleBox)`
  margin-bottom: 10px;
  span {
    font-size: 16px;
  }
`;

const TipsBox = styled.div`
  padding: 10px 32px;
  font-size: 12px;
  opacity: 0.6;
`;

const AfterBox = styled.div``;

export default function CreateStep({ onClick }: any) {
  const BASE_URL = getConfig().REACT_APP_BASE_ENDPOINT;
  const API_VERSION = process.env.REACT_APP_API_VERSION;
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const childRef = useRef(null);
  const [title, setTitle] = useState('');
  const [list, setList] = useState<any[]>([]);
  const [beforeList, setBeforeList] = useState<any[]>([]);
  const [submitType, setSubmitType] = useState<'save' | 'submit'>();
  const [voteType, setVoteType] = useState<number>(0);

  const { template, extraData } = useCreateProposalContext();
  const [components, setComponents] = useState<any[]>([]);

  const [showRht, setShowRht] = useState(true);

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showType, setShowType] = useState('new');
  const [token, setToken] = useState('');
  const [templateTitle, setTemplateTitle] = useState('');
  const [componentName, setComponentName] = useState('');
  const [holder, setHolder] = useState<any[]>([]);
  const [preview, setPreview] = useState<any[]>([]);
  const [previewTitle, setPreviewTitle] = useState('');
  const [initList, setInitList] = useState<any[]>([]);
  const [tips, setTips] = useState('');

  const [voteList, setVoteList] = useState(['']);

  const { changeStep, proposalType } = useCreateProposalContext();
  const { showToast } = useToast();

  const {
    state: { theme, tokenData },
    dispatch,
  } = useAuthContext();

  const { checkMetaforoLogin } = useCheckMetaforoLogin();
  const [isInstantVoteAlertVisible, setIsInstantVoteAlertVisible] = useState(false);

  useEffect(() => {
    if (!template || !tokenData) return;

    setToken(tokenData.token);

    let { vote_type } = template;
    setVoteType(vote_type || 0);

    if (template.id) {
      setShowType('template');
      setShowRht(false);
      const { schema, components } = template;
      const arr = JSON.parse(schema!);

      const previewArr = arr.filter((i: any) => i.type === 'preview');
      if (previewArr?.length && extraData?.id) {
        setPreviewTitle(previewArr[0]?.title);
        getPreview();

        getComponentsList();
      }

      const componentsIndex = arr.findIndex((i: any) => i.type === 'components');

      const beforeComponents = arr.filter(
        (item: any) => item.type !== 'components' && arr.indexOf(item) < componentsIndex && item.type !== 'preview',
      );
      let componentsList = arr.filter((item: any) => item.type === 'components') || [];
      const afterComponents = arr.filter(
        (item: any) => item.type !== 'components' && arr.indexOf(item) > componentsIndex && item.type !== 'preview',
      );

      beforeComponents.forEach((item: any) => {
        item.content = item.hint;
      });

      afterComponents.forEach((item: any) => {
        item.content = item.hint;
      });

      setBeforeList(beforeComponents ?? []);
      setList(afterComponents ?? []);
      setHolder(componentsList);
      console.log(componentsList);

      setComponentName(componentsList[0]?.title);
      setTips(componentsList[0]?.content);

      // setList(arr ?? []);
      setTemplateTitle(template?.name ?? '');
      components?.map((item) => {
        if (typeof item.schema === 'string') {
          item.schema = JSON.parse(item.schema);
        }
        return item;
      });
      setComponents(components ? components : []);
    } else {
      setShowType('new');

      setList([
        {
          title: '背景',
          content: '',
        },
        {
          title: '内容',
          content: '',
        },
        {
          title: '备注',
          content: '',
        },
      ]);
      getComponentList();
      setShowRht(true);
    }
  }, [template, tokenData]);

  const getPreview = async () => {
    if (!extraData) return;
    const res = await requests.proposalV2.getProposalDetail(extraData?.id, 0);

    let titleComponents = {
      component_id: 16,
      name: 'relate',
      schema: '',
      data: {
        relate: extraData?.name,
      },
    };
    const comStr = res.data.components || [];
    comStr.map((item: any) => {
      if (typeof item.data === 'string') {
        item.data = JSON.parse(item.data);
      }
      return item;
    });
    comStr.unshift(titleComponents);

    setPreview(comStr ?? []);
  };

  const getComponentsList = async () => {
    // NOTE: getProposalDetail may use more time, so not show loading here
    // dispatch({ type: AppActionType.SET_LOADING, payload: true });
    try {
      const resp = await requests.proposalV2.getComponents();
      let components = resp.data;

      components?.map((item: any) => {
        if (typeof item.schema === 'string') {
          item.schema = JSON.parse(item.schema);
        }
        return item;
      });

      setInitList(resp.data);
    } catch (error) {
      logError('getAllProposals failed', error);
    } finally {
      // dispatch({ type: AppActionType.SET_LOADING, payload: false });
    }
  };

  const handleInput = (e: ChangeEvent) => {
    const { value } = e.target as HTMLInputElement;
    setTitle(value);
  };

  const getComponentList = async () => {
    dispatch({ type: AppActionType.SET_LOADING, payload: true });
    try {
      const resp = await requests.proposalV2.getComponents();
      let components = resp.data;

      components?.map((item: any) => {
        if (typeof item.schema === 'string') {
          item.schema = JSON.parse(item.schema);
        }
        return item;
      });

      setComponents(components);
    } catch (error) {
      logError('getAllProposals failed', error);
    } finally {
      dispatch({ type: AppActionType.SET_LOADING, payload: false });
    }
  };

  const handleFormSubmit = async (data: any) => {
    if (!proposalType) {
      return;
    }
    let dataFormat: any = {};

    for (const dataKey in data) {
      dataFormat[dataKey] = {
        name: dataKey,
        data: data[dataKey],
      };
    }
    const canSubmit = await checkMetaforoLogin();
    if (canSubmit) {
      let holderNew: any[] = [];
      if (holder.length) {
        holderNew = [...holder];
        holderNew[0].name = JSON.stringify(holder[0]?.name);
      }
      let previewArr = [
        {
          title: previewTitle,
          type: 'preview',
          content: JSON.stringify(preview),
        },
      ];
      let arr = [...previewArr, ...beforeList, ...holderNew, ...list];

      dispatch({ type: AppActionType.SET_LOADING, payload: true });

      saveOrSubmitProposal({
        title,
        proposal_category_id: proposalType?.category_id,
        vote_type: voteType,
        vote_options: voteType === 99 ? voteList : null,
        content_blocks: arr,
        components: dataFormat,
        template_id: template?.id,
        submit_to_metaforo: submitType === 'submit',
      })
        .then((r) => {
          showToast(
            submitType === 'submit' ? t('Msg.SubmitProposalSuccess') : t('Msg.SaveProposalSuccess'),
            ToastType.Success,
          );
          navigate(`/proposal/thread/${r.data.id}`);
        })
        .catch((error: any) => {
          logError('saveOrSubmitProposal failed', error);
          showToast(error?.data?.msg || error?.code || error, ToastType.Danger);
        })
        .finally(() => {
          dispatch({ type: AppActionType.SET_LOADING, payload: false });
        });
    }
  };

  const handleSaveDraft = (data: any) => {
    console.log({
      ...data,
    });
    handleFormSubmit(data);
  };

  const saveAllDraft = () => {
    (childRef.current as any).saveForm();
  };

  const handleText = (value: any, index: number, type: string) => {
    if (type === 'before') {
      let arr = [...beforeList];
      arr[index].content = value;
      setBeforeList([...arr]);
    } else {
      let arr = [...list];
      arr[index].content = value;
      setList([...arr]);
    }
  };

  const allSubmit = () => {
    (childRef.current as any).submitForm();
  };

  const handleSave = () => {
    setSubmitType('save');
    setTimeout(saveAllDraft, 0);
  };

  const handleConfirmSubmit = () => {
    setSubmitType('submit');
    setTimeout(allSubmit, 0);
  };

  const handleSubmit = () => {
    if (template?.is_instant_vote) {
      setIsInstantVoteAlertVisible(true);
    } else {
      handleConfirmSubmit();
    }
  };

  const closeIsInstantVoteAlert = () => {
    setIsInstantVoteAlertVisible(false);
    setSubmitType(undefined);
  };

  const handleBack = () => {
    setShowLeaveConfirm(false);
    changeStep(1);
  };

  const removeVote = (index: number) => {
    const arr = [...voteList];
    arr.splice(index, 1);
    setVoteList(arr);
  };

  const handleAdd = () => {
    const arr = [...voteList];
    arr.push('');
    setVoteList(arr);
  };

  const handleVoteInput = (e: ChangeEvent, index: number) => {
    const arr = [...voteList];
    arr[index] = (e.target as HTMLInputElement).value;
    setVoteList(arr);
  };

  const EmptyArray = voteList.filter((item) => item === '');

  const submitDisabled =
    !title || !title.trim() || list.some((item) => !item.content || (voteType === 99 && EmptyArray?.length));

  return (
    <Box>
      <FixedBox showRht={showRht.toString()}>
        <FlexInner>
          <NavLeft>
            <BackBox onClick={() => setShowLeaveConfirm(true)}>
              <BackIconBox>
                <img src={BackIcon} alt="" />
              </BackIconBox>
              <span className="backTitle">{t('Proposal.CreateProposal')}</span>
            </BackBox>
            <TagsBox>
              <CategoryTag>{proposalType?.category_name}</CategoryTag>
              {templateTitle && <TemplateTag>{templateTitle}</TemplateTag>}
            </TagsBox>
          </NavLeft>
          <BtnGroup>
            <Button className="save" onClick={handleSave} disabled={!title || !title.trim()}>
              {t('Proposal.SaveProposal')}
            </Button>
            <Button onClick={handleSubmit} disabled={submitDisabled}>
              {t('Proposal.SubmitProposal')}
            </Button>
          </BtnGroup>
        </FlexInner>
      </FixedBox>

      <BoxBg showRht={showRht.toString()}>
        <Template
          DataSource={null}
          operate={showType}
          language={i18n.language}
          showRight={showRht}
          initialItems={components}
          theme={theme}
          baseUrl={BASE_URL}
          version={API_VERSION}
          token={token}
          BeforeComponent={
            <>
              <ItemBox>
                <TitleBox>{t('Proposal.title')}</TitleBox>
                <InputBox>
                  <input type="text" value={title} onChange={handleInput} />
                </InputBox>
              </ItemBox>

              {!!preview.length && (
                <>
                  <ItemBox className="preview">
                    <TitleBox>{previewTitle}</TitleBox>
                  </ItemBox>
                  <Preview DataSource={preview} language={i18n.language} initialItems={initList} theme={theme} />
                </>
              )}

              {!!beforeList?.length &&
                beforeList.map((item, index: number) => (
                  <ItemBox key={`before_${index}`}>
                    {!!item.title && <TitleBox>{item.title}</TitleBox>}
                    <InputBox>
                      <MdEditor
                        toolbarsExclude={['github', 'save']}
                        modelValue={item.content}
                        editorId={`before_${index}`}
                        onChange={(val) => handleText(val, index, 'before')}
                        theme={theme ? 'dark' : 'light'}
                        placeholder={item.hint}
                      />
                    </InputBox>

                    {/*<MarkdownEditor value={item.content} onChange={(val)=>handleText(val,index)} />*/}
                  </ItemBox>
                ))}
              {!!components.length && (
                <>
                  <ComponnentBox>
                    <span>{componentName || t('Proposal.proposalComponents')}</span>
                  </ComponnentBox>
                  {!!tips && <TipsBox>{tips}</TipsBox>}
                </>
              )}
            </>
          }
          AfterComponent={
            <AfterBox>
              {!!list?.length &&
                list.map((item, index: number) => (
                  <ItemBox key={`block_${index}`}>
                    {!!item.title && <TitleBox>{item.title}</TitleBox>}
                    <InputBox>
                      <MdEditor
                        toolbarsExclude={['github', 'save']}
                        modelValue={item.content}
                        editorId={`block_${index}`}
                        onChange={(val) => handleText(val, index, 'after')}
                        theme={theme ? 'dark' : 'light'}
                        placeholder={item.hint}
                      />
                    </InputBox>

                    {/*<MarkdownEditor value={item.content} onChange={(val)=>handleText(val,index)} />*/}
                  </ItemBox>
                ))}
              {voteType === 99 && (
                <ItemBox>
                  <TitleBox>投票选项</TitleBox>
                  <VoteBox>
                    {voteList.map((item, index) => (
                      <li key={`vote_${index}`}>
                        <input type="text" value={item} onChange={(e) => handleVoteInput(e, index)} />
                        {voteList.length - 1 === index && (
                          <span onClick={() => handleAdd()}>
                            <img src={PlusImg} alt="" />
                          </span>
                        )}

                        {!!(voteList.length - 1) && (
                          <span onClick={() => removeVote(index)}>
                            <img src={MinusImg} alt="" />
                          </span>
                        )}
                      </li>
                    ))}
                  </VoteBox>
                </ItemBox>
              )}
            </AfterBox>
          }
          ref={childRef}
          onSubmitData={handleFormSubmit}
          onSaveData={handleSaveDraft}
        />
      </BoxBg>
      {showLeaveConfirm && (
        <ConfirmModal
          title=""
          msg={t('Proposal.ConfirmBackCreate')}
          onConfirm={handleBack}
          onClose={() => setShowLeaveConfirm(false)}
        />
      )}
      {isInstantVoteAlertVisible && (
        <ConfirmModal
          title=""
          msg={t('Proposal.SubmitConfirmTip')}
          onConfirm={handleConfirmSubmit}
          onClose={closeIsInstantVoteAlert}
        />
      )}
    </Box>
  );
}

const VoteBox = styled.ul`
  padding: 0 32px;
  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
    input {
      flex-grow: 1;
      border: 1px solid var(--proposal-border);
      background: transparent;
      height: 40px;
      border-radius: 8px;
      box-sizing: border-box;
      padding: 0 16px;
    }
    span {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border-radius: 8px;
      border: 1px solid var(--proposal-border);
      cursor: pointer;
    }
  }
`;