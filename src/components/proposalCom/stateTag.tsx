import { useAuthContext } from 'providers/authProvider';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ProposalState } from 'type/proposalV2.type';

export const getRealState = (state?: ProposalState): ProposalState | undefined => {
  return state;
};

export default function ProposalStateTag({ state }: { state?: ProposalState }) {
  const { t } = useTranslation();
  const {
    state: { language },
  } = useAuthContext();
  let color: string;
  let text: string;
  switch (state) {
    case ProposalState.Approved:
      color = '#1F9E14';
      text = t('Proposal.Approved');
      break;
    case ProposalState.Rejected:
      color = '#FB4E4E';
      text = t('Proposal.Rejected');
      break;
    case ProposalState.Draft:
      color = '#2F8FFF';
      text = t('Proposal.Draft');
      break;
    case ProposalState.PendingSubmit:
      color = 'rgba(9, 171, 207, 0.90)';
      text = t('Proposal.PendingCommit');
      break;
    case ProposalState.Withdrawn:
      color = '#B0B0B0';
      text = t('Proposal.WithDrawn');
      break;
    case ProposalState.VotingPassed:
    case ProposalState.Executed:
    case ProposalState.ExecutionFailed:
      color = '#1F9E14';
      text = t('Proposal.Passed');
      break;
    case ProposalState.VotingFailed:
    case ProposalState.Vetoed:
      color = '#FB4E4E';
      text = t('Proposal.Failed');
      break;
    case ProposalState.Voting:
    case ProposalState.PendingExecution:
      color = '#F9B617';
      text = t('Proposal.Voting');
      break;
    default:
      text = '';
      color = '#ddd';
  }
  return (
    <StatusTag $color={color} $width={language === 'en' ? '90px' : '70px'}>
      {text}
    </StatusTag>
  );
}

const StatusTag = styled.div<{ $color: string; $width: string }>`
  background-color: ${(props) => props.$color};
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  display: inline-block;
  height: 24px;
  line-height: 24px;
  text-align: center;
  width: ${(props) => props.$width};
`;