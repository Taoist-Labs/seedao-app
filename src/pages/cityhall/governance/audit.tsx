import styled from 'styled-components';
import React, { useEffect, useMemo, useState } from 'react';
import Page from 'components/pagination';
import requests from 'requests';
import { IApplicantBundleDisplay, ApplicationStatus, IApplicationDisplay } from 'type/application.type';
import { formatTime } from 'utils/time';
import utils from 'utils/publicJs';
import { IQueryParams } from 'requests/applications';
import NoItem from 'components/noItem';
import publicJs from 'utils/publicJs';
import { useTranslation } from 'react-i18next';
import useToast, { ToastType } from 'hooks/useToast';
import Select from 'components/common/select';
import { formatNumber } from 'utils/number';
import ExpandTable from '../../../components/cityHallCom/expandTable';
import ArrowIconSVG from 'components/svgs/back';
import useQuerySNS from 'hooks/useQuerySNS';
import useSeasons from 'hooks/useSeasons';
import useBudgetSource from 'hooks/useBudgetSource';
import BackerNav from 'components/common/backNav';
import { AppActionType, useAuthContext } from 'providers/authProvider';
import { ContainerPadding } from 'assets/styles/global';
import ApplicationStatusTag from 'components/common/applicationStatusTag';
import useApplicants from 'hooks/useApplicants';
import { formatApplicationStatus } from 'utils';

const Box = styled.div`
  position: relative;
  box-sizing: border-box;
  min-height: 100%;
  ${ContainerPadding};
`;
const TopLine = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-bottom: 24px;
  li {
    .tit {
      white-space: nowrap;
      margin-bottom: 16px;
      font-size: 14px;
    }
  }
`;

const BorderBox = styled.div``;

const TimeBox = styled.div`
  display: flex;
  gap: 18px;
  button.btn {
    border-color: var(--bs-primary);
    color: var(--bs-primary);
    &:disabled {
    }
  }
`;

const TableBox = styled.div`
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 3rem;
  td {
    line-height: 54px;
    .form-check-input {
      position: relative;
      top: 8px;
    }
  }
`;

export default function Register() {
  const { t } = useTranslation();
  const { dispatch } = useAuthContext();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(100);
  const [list, setList] = useState<IApplicantBundleDisplay[]>([]);

  // budget source
  const allSource = useBudgetSource();
  const [selectSource, setSelectSource] = useState<{ id: number; type: 'project' | 'guild' }>();
  // applicant
  const applicants = useApplicants();
  const [selectApplicant, setSelectApplicant] = useState<string>();
  // asset type
  const assetTypes = useMemo(() => {
    return [
      { value: 'SCR', label: 'SCR' },
      { value: 'USDT', label: 'USDT' },
    ];
  }, []);
  const [selectAssetType, setSelectAssetType] = useState<string>();
  // State
  const allStates = useMemo(() => {
    return [
      { value: ApplicationStatus.Open, label: t(formatApplicationStatus(ApplicationStatus.Open)) },
      { value: ApplicationStatus.Open, label: t(formatApplicationStatus(ApplicationStatus.Open)) },
      { value: ApplicationStatus.Approved, label: t(formatApplicationStatus(ApplicationStatus.Approved)) },
    ];
  }, [t]);
  const [selectState, setSelectState] = useState<ApplicationStatus>();
  // season
  const seasons = useSeasons();
  const [selectSeason, setSelectSeason] = useState<number>();

  const [showMore, setShowMore] = useState<IApplicationDisplay[]>();
  const [showBundleId, setShowBundleId] = useState<number>();

  const { getMultiSNS } = useQuerySNS();

  const showLoading = (v: boolean) => {
    dispatch({ type: AppActionType.SET_LOADING, payload: v });
  };

  const handlePage = (num: number) => {
    setPage(num + 1);
  };
  const handlePageSize = (num: number) => {
    setPageSize(num);
  };

  const getRecords = async () => {
    showLoading(true);
    const queryData: IQueryParams = {
      //   state: ApplicationStatus.Open,
    };
    if (selectApplicant) queryData.applicant = selectApplicant;
    if (selectSource && selectSource.type) {
      queryData.entity_id = selectSource.id;
      queryData.entity = selectSource.type;
    }
    if (selectSeason) {
      queryData.season_id = selectSeason;
    }
    if (selectState) {
      queryData.state = selectState;
    }
    if (selectAssetType) {
      // TODO: add query
    }
    try {
      const res = await requests.application.getApplicationBundle(
        {
          page,
          size: pageSize,
          sort_field: 'created_at',
          sort_order: 'desc',
        },
        queryData,
      );
      setTotal(res.data.total);

      const _wallets = new Set<string>();
      res.data.rows.forEach((item) => {
        item.records.forEach((r) => {
          _wallets.add(r.submitter_wallet?.toLocaleLowerCase());
          _wallets.add(r.reviewer_wallet?.toLocaleLowerCase());
          _wallets.add(r.target_user_wallet?.toLocaleLowerCase());
        });
      });
      const sns_map = await getMultiSNS(Array.from(_wallets));

      setList(
        res.data.rows.map((item) => ({
          ...item,
          created_date: formatTime(item.submit_date),
          records: item.records.map((record) => ({
            ...record,
            created_date: formatTime(record.created_at),
            transactions: record.transaction_ids.split(','),
            asset_display: formatNumber(Number(record.amount)) + ' ' + record.asset_name,
            submitter_name: sns_map.get(record.submitter_wallet?.toLocaleLowerCase()) as string,
            reviewer_name: sns_map.get(record.reviewer_wallet?.toLocaleLowerCase()) as string,
            receiver_name: sns_map.get(record.target_user_wallet?.toLocaleLowerCase()) as string,
          })),
          submitter_name: sns_map.get(item.submitter?.toLocaleLowerCase()) as string,
          assets_display: item.assets.map((a) => `${formatNumber(Number(a.amount))} ${a.name}`),
        })),
      );
    } catch (error) {
      console.error('getProjectApplications failed', error);
    } finally {
      showLoading(false);
    }
  };

  useEffect(() => {
    getRecords();
  }, [selectAssetType, selectState, selectApplicant, selectSource, selectSeason, page, pageSize]);

  const formatSNS = (name: string) => {
    return name?.endsWith('.seedao') ? name : publicJs.AddressToShow(name, 6);
  };

  const handleclose = () => {
    setShowMore(undefined);
    setShowBundleId(undefined);
  };
  const updateStatus = (status: ApplicationStatus) => {
    if (!showMore) {
      return;
    }
    setShowMore([...showMore.map((r) => ({ ...r, status }))]);
    setList(
      list.map((item) => ({
        ...item,
        records: item.records.map((r) => ({ ...r, status })),
      })),
    );
  };

  return (
    <Box>
      {showMore && showBundleId ? (
        <ExpandTable
          bund_id={showBundleId}
          list={showMore}
          handleClose={handleclose}
          updateStatus={updateStatus}
          showLoading={showLoading}
        />
      ) : (
        <>
          <BackerNav title={t('city-hall.PointsAndTokenAudit')} to="/city-hall/governance" />

          <TopLine>
            <li>
              <div className="tit">{t('application.AssetType')}</div>
              <Select
                width="150px"
                options={assetTypes}
                placeholder=""
                onChange={(value: any) => {
                  setSelectAssetType(value?.value);
                  setPage(1);
                }}
              />
            </li>
            <li>
              <div className="tit">{t('application.BudgetSource')}</div>
              <FilterSelect
                options={allSource}
                placeholder=""
                onChange={(value: any) => {
                  setSelectSource({ id: value?.value as number, type: value?.data });
                  setPage(1);
                }}
              />
            </li>
            <li>
              <div className="tit">{t('application.Operator')}</div>
              <FilterSelect
                options={applicants}
                placeholder=""
                onChange={(value: ISelectItem) => {
                  setSelectApplicant(value?.value);
                  setPage(1);
                }}
              />
            </li>
            <li>
              <div className="tit">{t('application.State')}</div>
              <Select
                width="150px"
                options={allStates}
                placeholder=""
                onChange={(value: any) => {
                  setSelectState(value?.value);
                  setPage(1);
                }}
              />
            </li>
            <li>
              <div className="tit">{t('application.Season')}</div>
              <TimeBox>
                <BorderBox>
                  <Select
                    width="90px"
                    options={seasons}
                    placeholder=""
                    NotClear={true}
                    onChange={(value: any) => {
                      setSelectSeason(value?.value);
                      setPage(1);
                    }}
                  />
                </BorderBox>
              </TimeBox>
            </li>
          </TopLine>

          <TableBox>
            {list.length ? (
              <>
                <table className="table" cellPadding="0" cellSpacing="0">
                  <thead>
                    <tr>
                      <th className="center">{t('application.RegisterSource')}</th>
                      <th className="center">{t('application.TotalAssets')}</th>
                      <th>{t('application.State')}</th>
                      <th>{t('application.RegisterNote')}</th>
                      <th className="center">{t('application.Operator')}</th>
                      <th className="center">{t('application.Season')}</th>
                      <th className="center">{t('application.Time')}</th>
                      <th>&nbsp;</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((item) => (
                      <tr key={item.id}>
                        <td className="center">{item.entity.name}</td>
                        <td className="center">
                          <TotalAssets>
                            {item.assets_display.map((asset, idx) => (
                              <div key={idx}>{asset}</div>
                            ))}
                          </TotalAssets>
                        </td>
                        <td>
                          <ApplicationStatusTag status={item.state} />
                        </td>
                        <td>{item.comment}</td>
                        <td className="center">{formatSNS(item.submitter_name)}</td>
                        <td className="center">{item.season_name}</td>
                        <td className="center">{item.created_date}</td>
                        <td>
                          <TotalCountButton
                            onClick={() => {
                              setShowMore(item.records);
                              setShowBundleId(item.id);
                            }}
                          >
                            {t('application.TotalCount', { count: item.records.length })}
                            <ArrowIconSVG className="arrow" />
                          </TotalCountButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {total > pageSize && (
                  <Page
                    itemsPerPage={pageSize}
                    total={total}
                    current={page - 1}
                    handleToPage={handlePage}
                    handlePageSize={handlePageSize}
                  />
                )}
              </>
            ) : (
              <NoItem />
            )}
          </TableBox>
        </>
      )}
    </Box>
  );
}

const FilterSelect = styled(Select)`
  width: 200px;
  @media (max-width: 1240px) {
    width: unset;
  } ;
`;

const TotalCountButton = styled.button`
  min-width: 111px;
  height: 40px;
  line-height: 40px;
  background: var(--bs-background);
  border-radius: 8px;
  opacity: 1;
  border: 1px solid var(--bs-svg-color);
  text-align: center;
  .arrow {
    transform: rotate(180deg);
    position: relative;
    top: -1px;
  }
`;

const TotalAssets = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  line-height: 20px;
  box-sizing: border-box;
  height: 100%;
`;