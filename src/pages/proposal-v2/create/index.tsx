import styled from 'styled-components';
import { ContainerPadding } from 'assets/styles/global';
import BackerNav from 'components/common/backNav';
import { useTranslation } from 'react-i18next';
import CreateProposalProvider from './store';
import ChooseTypeStep from './chooseType';
import ChooseTemplateStep from './chooseTemplate';
import CreateStep from './createStep';
import { useCreateProposalContext } from './store';
import { useEffect } from 'react';
import { AppActionType, useAuthContext } from 'providers/authProvider';
import { getAuthProposalCategoryList, getTemplates } from 'requests/proposalV2';
import useCheckMetaforoLogin from 'hooks/useMetaforoLogin';

const CreateProposalSteps = () => {
  const { t } = useTranslation();
  const { currentStep, proposalType, goBackStepOne } = useCreateProposalContext();

  const {
    dispatch,
    state: { userData },
  } = useAuthContext();
  const { checkMetaforoLogin } = useCheckMetaforoLogin();

  useEffect(() => {
    if (!userData) {
      return;
    }
    checkMetaforoLogin().then(() => {
      dispatch({ type: AppActionType.SET_LOADING, payload: true });

      getTemplates()
        .then((resp) => {
          dispatch({ type: AppActionType.SET_CATEGORIES_TEMPLATES, payload: resp.data });
        })
        .catch(() => {
          // no auth
          checkMetaforoLogin();
        })
        .finally(() => {
          dispatch({ type: AppActionType.SET_LOADING, payload: false });
        });
    });
  }, [userData]);

  const showstep = () => {
    switch (currentStep) {
      case 1:
        return <ChooseTypeStep />;
      // case 2:
      //   return <ChooseTemplateStep />;
      case 2:
        return <CreateStep onClick={backTo} />;
      default:
        return null;
    }
  };

  const backTo = () => {
    if (currentStep !== 1) {
      // back to step 1
      goBackStepOne();
    }
  };

  const backNavTitle = currentStep === 2 && proposalType ? t(proposalType.category_name as any) : t('Proposal.CreateProposal');

  return (
    <>
      {currentStep !== 2 && (
        <BackerNav title={backNavTitle} to={currentStep === 1 ? '/proposal' : '/proposal/create'} onClick={backTo} />
      )}
      {showstep()}
    </>
  );
};

export default function CreateProposalPage() {
  return (
    <Page>
      <CreateProposalProvider>
        <CreateProposalSteps />
      </CreateProposalProvider>
    </Page>
  );
}

const Page = styled.div`
  ${ContainerPadding};
  color: var(--bs-body-color_active);
`;